import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For success indication

function OrderConfirmationPage() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId || !token) {
                setError('Order ID or authentication token is missing.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                const response = await fetch(`/api/orders/${orderId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch order details');
                }
                setOrder(data);
            } catch (err) {
                console.error("Fetch order details error:", err);
                setError(err.message || 'Error fetching order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, token]);

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Alert severity="warning">Order details not found.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h4" component="h1">
                        Order Confirmation
                    </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                    Thank you for your order!
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Order ID: {order.id}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Order Date: {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Status: {order.status}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Total Amount: ${order.totalAmount ? parseFloat(order.totalAmount).toFixed(2) : 'N/A'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Items Ordered:
                </Typography>
                <List disablePadding>
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                            <ListItem key={item.id || item.productId} sx={{ py: 1, px: 0 }}>
                                <ListItemText 
                                    primary={item.Product?.name || 'Product Name Unavailable'} 
                                    secondary={`Quantity: ${item.quantity} @ $${item.price ? parseFloat(item.price).toFixed(2) : 'N/A'} each`}
                                />
                                <Typography variant="body2">
                                    ${(item.quantity * parseFloat(item.price || 0)).toFixed(2)}
                                </Typography>
                            </ListItem>
                        ))
                    ) : (
                        <ListItem>
                            <ListItemText primary="No items found for this order." />
                        </ListItem>
                    )}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Shipping Address:
                </Typography>
                {/* Display shipping address if available in order details */}
                {order.shippingAddress ? (
                     <Typography variant="body2">
                        {order.shippingAddress.addressLine1}<br />
                        {order.shippingAddress.addressLine2 && <>{order.shippingAddress.addressLine2}<br /></>}
                        {`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`}<br />
                        {order.shippingAddress.country}
                    </Typography>
                ) : (
                    <Typography variant="body2">Shipping address not available.</Typography>
                )}

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button component={RouterLink} to="/" variant="outlined">
                        Continue Shopping
                    </Button>
                    <Button component={RouterLink} to="/my-orders" variant="contained">
                        View My Orders
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default OrderConfirmationPage;
