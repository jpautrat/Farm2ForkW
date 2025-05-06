import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

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
import AddIcon from '@mui/icons-material/Add';

function MyProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, user } = useContext(AuthContext); // Farmer token and user needed
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyProducts = async () => {
            if (!token || user?.role !== 'farmer') {
                setError('Access denied. Only farmers can view this page.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                // Endpoint specifically for the logged-in farmer's products
                const response = await fetch('/api/products/my-products', { 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch your products');
                }
                setProducts(data);
            } catch (err) {
                console.error("Fetch my products error:", err);
                setError(err.message || 'Error fetching your products.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, [token, user]);

    const handleEditProduct = (productId) => {
        navigate(`/products/edit/${productId}`); 
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
            return;
        }
        setError('');
        try {
             const response = await fetch(`/api/products/${productId}`, { 
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete product');
            }
            // Remove product from local state
            setProducts(products.filter(p => p.id !== productId));
            // Optionally show a success message

        } catch (err) {
            console.error("Delete product error:", err);
            setError(err.message || 'Error deleting product.');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    My Products
                </Typography>
                <Button
                    variant="contained"
                    component={RouterLink}
                    to="/products/add"
                    startIcon={<AddIcon />}
                >
                    Add New Product
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table aria-label="my products table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">You have not listed any products yet.</TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.description}</TableCell>
                                        <TableCell>${product.price ? parseFloat(product.price).toFixed(2) : 'N/A'}</TableCell>
                                        <TableCell>{product.quantity}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => handleEditProduct(product.id)}>
                                                Edit
                                            </Button>
                                            <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteProduct(product.id)}>
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default MyProductsPage;
