import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function CartPage() {
    const [cart, setCart] = useState(null); // { items: [], total: 0 }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const { token, user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchCart = async () => {
        setLoading(true); // Ensure loading state is true during fetch
        setError('');
        try {
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch cart');
            }
            setCart(data);
        } catch (err) {
            console.error("Fetch cart error:", err);
            setError(err.message || 'Error fetching cart data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setError('You must be logged in to view the cart.');
            setLoading(false);
            return;
        }
        fetchCart();
    }, [token, isAuthenticated]); // Refetch if token changes (e.g., re-login)

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return; // Don't allow less than 1
        setUpdatingItemId(productId); // Indicate loading for this item
        setError('');
        try {
            const response = await fetch('/api/cart', {
                method: 'POST', // Changed from PUT to POST
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: newQuantity }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update quantity');
            }
            setCart(data); // Update cart state with the response from the server
        } catch (err) {
            console.error("Update quantity error:", err);
            setError(err.message || 'Error updating item quantity.');
        } finally {
            setUpdatingItemId(null); // Remove loading indicator
        }
    };

    const handleRemoveItem = async (productId) => {
        setUpdatingItemId(productId); // Indicate loading for this item
        setError('');
        try {
            const response = await fetch('/api/cart', {
                method: 'POST', // Changed from DELETE to POST
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: 0 }),
            });
            const data = await response.json(); // Assume API returns updated cart or success
            if (!response.ok) {
                throw new Error(data.message || 'Failed to remove item');
            }
            setCart(data); // Update cart state
        } catch (err) {
            console.error("Remove item error:", err);
            setError(err.message || 'Error removing item from cart.');
        } finally {
            setUpdatingItemId(null); // Remove loading indicator
        }
    };

    const handleCheckout = () => {
        // Navigate to the checkout page
        navigate('/checkout'); 
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Your Cart</Typography>
                <Alert severity="info">Your cart is empty.</Alert>
                <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
                    Continue Shopping
                </Button>
            </Container>
        );
    }

    // Calculate total
    const cartTotal = cart.items.reduce((sum, item) => {
        // Ensure price and quantity are valid numbers
        const price = parseFloat(item.Product?.price || 0);
        const quantity = parseInt(item.quantity || 0);
        return sum + (price * quantity);
    }, 0);

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}> {/* Use lg for wider tables */}
            <Typography variant="h4" component="h1" gutterBottom>
                Your Shopping Cart
            </Typography>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} aria-label="shopping cart table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="center">Quantity</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Remove</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cart.items.map((item) => (
                            <TableRow
                                key={item.productId}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {item.Product?.name || 'Product not found'}
                                </TableCell>
                                <TableCell align="right">${item.Product?.price ? item.Product.price.toFixed(2) : 'N/A'}</TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                            disabled={item.quantity <= 1 || updatingItemId === item.productId}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                            disabled={updatingItemId === item.productId}
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                         {updatingItemId === item.productId && <CircularProgress size={16} sx={{ ml: 1 }}/>}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    ${(item.Product?.price * item.quantity).toFixed(2)}
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        aria-label="delete" 
                                        color="error" 
                                        onClick={() => handleRemoveItem(item.productId)}
                                        disabled={updatingItemId === item.productId}
                                    >
                                        {updatingItemId === item.productId ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Cart Summary and Checkout Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                    Total: ${cartTotal.toFixed(2)}
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckout}
                    disabled={loading || updatingItemId !== null || !cart || !cart.items || cart.items.length === 0} // Disable if loading, updating, or empty
                >
                    Proceed to Checkout
                </Button>
            </Box>
        </Container>
    );
}

export default CartPage;
