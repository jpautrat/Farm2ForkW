import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token, loading: authLoading } = useAuth(); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            if (authLoading) return;
            if (!user || !token) {
                setError('Please log in to view your orders.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await axios.get('/api/orders/myorders'); 
                
                const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedOrders);
            } catch (err) {
                console.error("Fetch orders error:", err.response ? err.response.data : err.message);
                setError(err.response?.data?.message || 'Error fetching order history.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, token, authLoading]); 

    const handleViewDetails = (orderId) => {
        navigate(`/order-confirmation/${orderId}`); 
    };

    const getOrderStatus = (order) => {
        if (order.isDelivered) {
            return 'Delivered';
        } else if (order.isPaid) {
            return 'Processing';
        } else {
            return 'Awaiting Payment';
        }
    };

    if (loading || authLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Order History
            </Typography>

            {error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : orders.length === 0 ? (
                <Paper sx={{ p: 3, mt: 2 }}>
                    <Typography>You haven't placed any orders yet.</Typography>
                    <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 2 }}>
                        Start Shopping
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table aria-label="order history table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        {order._id}
                                    </TableCell>
                                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{getOrderStatus(order)}</TableCell>
                                    <TableCell align="right">${order.totalPrice ? parseFloat(order.totalPrice).toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            onClick={() => handleViewDetails(order._id)} 
                                        >
                                            View Details
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default OrderHistoryPage;
