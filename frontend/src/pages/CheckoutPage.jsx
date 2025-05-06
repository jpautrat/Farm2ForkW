import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

// Placeholder for your Stripe Publishable Key
// IMPORTANT: Replace with your actual key and store it securely (e.g., environment variable)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PTo5HRq1y0yM5zX2JjD45r3J5V4k9zWqfJgPqQ8N4zY9K5wX6gE2bVvL8lA1sF7dO0cY9zXpB5uL1r00E6wXyY3a'; // Replace this!

if (!STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') && !STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_')) {
  console.warn('Stripe Publishable Key is missing or seems invalid. Please replace the placeholder in CheckoutPage.jsx.');
  // Optionally, you could render an error message or disable checkout here
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const steps = ['Shipping address', 'Payment details', 'Review your order'];

function CheckoutPage() {
    const [shippingAddress, setShippingAddress] = useState({ // Example structure
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA', // Default or based on user profile
    });
    const [cart, setCart] = useState(null); // To display order summary
    const [loadingCart, setLoadingCart] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false); // Keep for general loading state if needed
    const [error, setError] = useState('');
    const [activeStep, setActiveStep] = useState(0);
    const [clientSecret, setClientSecret] = useState('');
    const [paymentIntentError, setPaymentIntentError] = useState('');
    const [isFetchingClientSecret, setIsFetchingClientSecret] = useState(false);

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Fetch cart details to display summary (optional but good UX)
    useEffect(() => {
        const fetchCartData = async () => {
            setLoadingCart(true);
            setError('');
            try {
                const response = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch cart');
                setCart(data);
            } catch (err) {
                console.error('Fetch cart error:', err);
                setError('Could not load cart summary.');
                // Don't necessarily block checkout if summary fails, but show error
            } finally {
                setLoadingCart(false);
            }
        };
        fetchCartData();
    }, [token]);

    // Fetch Payment Intent Client Secret when moving to Step 1
    useEffect(() => {
        if (activeStep === 1 && !clientSecret && cartTotal > 0) {
            const fetchClientSecret = async () => {
                setIsFetchingClientSecret(true);
                setPaymentIntentError('');
                try {
                    // Ensure cartTotal is calculated correctly before this fetch
                    if (cartTotal <= 0) {
                        throw new Error("Cannot create payment intent with zero amount.");
                    }

                    // *** Backend Endpoint Needed ***
                    // This endpoint should calculate the final amount securely on the backend
                    // based on the cart and return the client_secret
                    const response = await fetch('/api/payments/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        // Send amount in cents
                        body: JSON.stringify({ amount: Math.round(cartTotal * 100) }), 
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to create payment intent');
                    }
                    setClientSecret(data.clientSecret);
                } catch (err) {
                    console.error("Payment Intent Error:", err);
                    setPaymentIntentError(err.message || 'Could not initialize payment.');
                    // Maybe navigate back or show a persistent error?
                    // setActiveStep((prev) => prev - 1); // Option: force user back
                } finally {
                    setIsFetchingClientSecret(false);
                }
            };
            fetchClientSecret();
        }
    }, [activeStep, token, cartTotal, clientSecret]); // Add dependencies

    const handleShippingChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    // Basic validation example (implement more robustly as needed)
    const isShippingValid = () => {
        return shippingAddress.addressLine1 && shippingAddress.city && shippingAddress.state && shippingAddress.postalCode && shippingAddress.country;
    };

    // Mock handle next step for Stepper - adapt if implementing
    const handleNext = () => {
        if (activeStep === 0 && !isShippingValid()) {
            setError('Please fill in all required shipping address fields.');
            return;
        }
        setError('');
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setError(''); // Clear errors when navigating back
        setPaymentIntentError('');
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Internal component for the Stripe payment form
    const StripePaymentForm = ({ clientSecret }) => {
        const stripe = useStripe();
        const elements = useElements();
        const [isProcessing, setIsProcessing] = useState(false);
        const [paymentError, setPaymentError] = useState('');

        const handleSubmit = async (event) => {
            event.preventDefault();
            if (!stripe || !elements || !clientSecret) {
                // Stripe.js has not yet loaded or clientSecret is missing.
                setPaymentError('Payment system is not ready. Please wait or refresh.');
                return;
            }

            setIsProcessing(true);
            setPaymentError('');

            const { error: submitError } = await elements.submit();
            if (submitError) {
                setPaymentError(submitError.message);
                setIsProcessing(false);
                return;
            }

            // Now confirm the PaymentIntent
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    // Pass necessary info (like order ID if available) if needed
                    return_url: `${window.location.origin}/order-confirmation`, 
                    // Send shipping details collected earlier for Stripe Radar, etc.
                    // Note: Structure depends on Stripe API version and requirements
                    shipping: {
                        name: 'Customer Name', // TODO: Get customer name if available
                        address: {
                            line1: shippingAddress.addressLine1,
                            line2: shippingAddress.addressLine2 || undefined,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            postal_code: shippingAddress.postalCode,
                            country: shippingAddress.country,
                        }
                    },
                },
                redirect: 'if_required', // Handle redirect manually or let Stripe handle it
            });

            if (confirmError) {
                // This will typically be validation errors (e.g., insufficient funds, invalid card) 
                // or network errors. Show confirmError.message to your customer.
                setPaymentError(confirmError.message || 'An unexpected error occurred during payment.');
                setIsProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment succeeded! 
                // **Now call the backend to create the final order**
                console.log('PaymentIntent Succeeded:', paymentIntent);
                // Proceed to place the order on the backend
                await finalizeOrder(paymentIntent.id);
            } else if (paymentIntent && paymentIntent.status === 'processing'){
                 setPaymentError('Payment is processing. We will notify you upon completion.');
                 // Handle processing state appropriately - maybe disable button, show message
            } else if (paymentIntent && paymentIntent.status === 'requires_payment_method') {
                 setPaymentError('Payment failed. Please try another payment method.');
                 // Allow user to try again
            } else {
                 setPaymentError('An unexpected payment status occurred.');
            }
            
            // Only set processing false if it's not a redirect scenario or final state
            if (!confirmError?.type?.includes('redirect')) {
                 setIsProcessing(false); 
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Payment Method</Typography>
                {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
                {/* Ensure Stripe and Elements are loaded before rendering PaymentElement */}
                {stripe && elements && <PaymentElement />}
                <Button 
                    type="submit" 
                    disabled={!stripe || !elements || isProcessing || !clientSecret} 
                    variant="contained" 
                    sx={{ mt: 3 }}
                >
                    {isProcessing ? <CircularProgress size={24} /> : `Pay $${cartTotal.toFixed(2)}`}
                </Button>
            </form>
        );
    };

    // Function to call backend AFTER successful payment confirmation
    const finalizeOrder = async (paymentIntentId) => {
        setPlacingOrder(true); // Use placingOrder state for this final step
        setError('');
        try {
            const orderData = {
                shippingAddress: { ...shippingAddress },
                paymentIntentId: paymentIntentId, // Send the confirmed Payment Intent ID
            };

            // Use the original '/api/orders' endpoint
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (!response.ok) {
                // If order creation fails AFTER payment, we have a problem.
                // Need robust error handling/logging. Maybe try to refund?
                throw new Error(data.message || 'Failed to finalize order after payment.');
            }

            // Order placed successfully, navigate to confirmation
            navigate(`/order-confirmation/${data.orderId}`);

        } catch (err) {
            console.error('Finalize order error:', err);
            // Critical error: Payment succeeded but order failed. 
            // Show a specific error message and advise user to contact support.
            setError(`Payment succeeded, but finalizing your order failed: ${err.message}. Please contact support with Payment Intent ID: ${paymentIntentId}`);
            // Potentially trigger an alert/logging mechanism here for manual intervention.
        } finally {
            setPlacingOrder(false);
        }
    };

    // Calculate total from fetched cart
    const cartTotal = cart?.items?.reduce((sum, item) => {
        const price = parseFloat(item.Product?.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return sum + (price * quantity);
    }, 0) ?? 0; // Default to 0 if cart is null

    function getStepContent(step) {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField required id="addressLine1" name="addressLine1" label="Address line 1" fullWidth autoComplete="shipping address-line1" variant="standard" value={shippingAddress.addressLine1} onChange={handleShippingChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField id="addressLine2" name="addressLine2" label="Address line 2" fullWidth autoComplete="shipping address-line2" variant="standard" value={shippingAddress.addressLine2} onChange={handleShippingChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="city" name="city" label="City" fullWidth autoComplete="shipping address-level2" variant="standard" value={shippingAddress.city} onChange={handleShippingChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="state" name="state" label="State/Province/Region" fullWidth variant="standard" value={shippingAddress.state} onChange={handleShippingChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="postalCode" name="postalCode" label="Zip / Postal code" fullWidth autoComplete="shipping postal-code" variant="standard" value={shippingAddress.postalCode} onChange={handleShippingChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField required id="country" name="country" label="Country" fullWidth autoComplete="shipping country" variant="standard" value={shippingAddress.country} onChange={handleShippingChange} />
                        </Grid>
                    </Grid>
                );
            case 1:
                // Render Stripe Elements form
                const options = {
                    clientSecret,
                    // appearance: { /* Customize appearance */ },
                };
                if (isFetchingClientSecret) {
                    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>;
                }
                if (paymentIntentError) {
                    return <Alert severity="error">{paymentIntentError}</Alert>;
                }
                if (!clientSecret) {
                    // This case might happen if cart total was 0 or fetch failed silently
                    return <Alert severity="warning">Could not initialize payment form. Please go back and check your cart or address.</Alert>;
                }
                return (
                    <Elements stripe={stripePromise} options={options}>
                        <StripePaymentForm clientSecret={clientSecret} />
                    </Elements>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Order summary</Typography>
                        {loadingCart ? <CircularProgress size={20}/> : cart?.items?.length > 0 ? (
                            <Box mb={2}>
                                {cart.items.map((item) => (
                                    <Typography key={item.productId} variant="body2">
                                        {item.Product?.name || 'N/A'} x {item.quantity} - ${(parseFloat(item.Product?.price || 0) * parseInt(item.quantity || 0)).toFixed(2)}
                                    </Typography>
                                ))}
                                <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>Total: ${cartTotal.toFixed(2)}</Typography>
                            </Box>
                        ) : <Typography variant="body2">Cart empty or loading error.</Typography>}

                        <Typography variant="h6" gutterBottom>Shipping Details</Typography>
                        <Typography gutterBottom>{shippingAddress.addressLine1}</Typography>
                        {shippingAddress.addressLine2 && <Typography gutterBottom>{shippingAddress.addressLine2}</Typography>}
                        <Typography gutterBottom>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}`}</Typography>
                        <Typography gutterBottom>{shippingAddress.country}</Typography>
                    </Box>
                );
            default:
                throw new Error('Unknown step');
        }
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    Checkout
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <React.Fragment>
                    {activeStep === steps.length ? (
                        <React.Fragment>
                            {/* This state might not be reached if payment handles navigation */}
                            <Typography variant="h5" gutterBottom>
                                Processing your order...
                            </Typography>
                            <Typography variant="subtitle1">
                                Your payment is being processed. You will be redirected shortly.
                            </Typography>
                            {placingOrder && <CircularProgress sx={{mt: 2}}/>}
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            {getStepContent(activeStep)}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                                        Back
                                    </Button>
                                )}

                                {/* Hide Next button on Payment Step - Payment form has its own button */}
                                {activeStep !== 1 && (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext} // This button now only moves from Step 0 -> 1 and 2 -> (potentially a final confirmation if needed)
                                        sx={{ mt: 3, ml: 1 }}
                                        disabled={activeStep === 0 && !isShippingValid()} // Keep validation for step 0
                                    >
                                        {activeStep === steps.length - 1 ? 'Review Order' : 'Next'}
                                        {/* Changed last step button text - Place Order is now handled by Stripe Form */}
                                    </Button>
                                )}
                            </Box>
                        </React.Fragment>
                    )}
                </React.Fragment>
            </Paper>
        </Container>
    );
}

export default CheckoutPage;
