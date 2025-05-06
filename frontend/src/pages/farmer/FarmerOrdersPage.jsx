// frontend/src/pages/farmer/FarmerOrdersPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getFarmerSalesOrders, updateOrderStatus } from '../../services/api';
import { Select, MenuItem, FormControl, InputLabel, Box, CircularProgress } from '@mui/material';
import LoadingSpinner from '../../components/LoadingSpinner';
import Alert from '../../components/Alert';
import { Link } from 'react-router-dom';

const ORDER_STATUSES = ['Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function FarmerOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState({});
    const { user, token } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user || (user.role !== 'farmer' && user.role !== 'admin') || !token) {
                setError('Unauthorized');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getFarmerSalesOrders(token);
                setOrders(data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to fetch sales orders');
                console.error("Fetch Farmer Sales Orders Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user, token]);

    const handleStatusChange = async (orderId, newStatus) => {
        if (!token) {
            setError("Authentication token not found.");
            return;
        }
        setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
        setError('');

        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus, token);
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order._id === orderId ? { ...order, status: updatedOrder.status, isDelivered: updatedOrder.isDelivered, deliveredAt: updatedOrder.deliveredAt } : order
                )
            );
        } catch (err) {
            console.error("Update Order Status Error:", err);
            setError(`Failed to update status for order ${orderId.substring(0, 8)}: ${err}`);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
        }
    };

    if (loading) return <LoadingSpinner />;
    {error && !error.startsWith('Failed to update status') && <Alert type="error">{error}</Alert>}

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
            <h2>My Sales Orders</h2>
            {error && error.startsWith('Failed to update status') && <Alert type="error">{error}</Alert>}

            {orders.length === 0 && !loading ? (
                <p>You have no sales orders yet.</p>
            ) : (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total Paid</th>
                            <th>Items Sold (Yours)</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => {
                            const farmerItems = order.orderItems.filter(
                                item => item.product && item.product.user === user?.id
                            );
                            if (farmerItems.length === 0 && user?.role === 'farmer') return null;

                            const farmerItemsTotal = farmerItems.reduce((acc, item) => acc + item.qty * item.price, 0);
                            const isUpdating = updatingStatus[order._id];

                            return (
                                <tr key={order._id}>
                                    <td>
                                        <Link to={`/order/${order._id}`}>{order._id.substring(0, 8)}...</Link>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{order.user?.name || 'N/A'} ({order.user?.email || 'N/A'})</td>
                                    <td>${order.totalPrice.toFixed(2)}</td>
                                    <td>
                                        <ul>
                                            {farmerItems.map(item => (
                                                <li key={item.product?._id || item.name}>
                                                    {item.qty} x {item.name} (@ ${item.price.toFixed(2)} each)
                                                </li>
                                            ))}
                                        </ul>
                                        {farmerItems.length > 0 && <strong>Subtotal (Your Items): ${farmerItemsTotal.toFixed(2)}</strong>}
                                    </td>

                                    <td>
                                        <FormControl size="small" sx={{ minWidth: 150 }} disabled={isUpdating}>
                                            <Select
                                                labelId={`status-label-${order._id}`}
                                                value={order.status || 'Processing'}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                sx={{ '.MuiSelect-select': { py: 0.8, px: 1 } }}
                                            >
                                                {ORDER_STATUSES.map((statusOption) => (
                                                    <MenuItem key={statusOption} value={statusOption}>
                                                        {statusOption}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {isUpdating && <CircularProgress size={20} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-10px', marginLeft: '-10px' }} />}
                                        </FormControl>
                                    </td>

                                    <td>
                                        <Link to={`/order/${order._id}`} className="btn btn-sm btn-info">View Details</Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </Box>
    );
}

export default FarmerOrdersPage;
