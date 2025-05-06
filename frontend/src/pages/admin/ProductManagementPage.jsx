import React, { useState, useEffect, useContext } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'; // For potential actions

function ProductManagementPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext); // Admin token needed

    useEffect(() => {
        const fetchProducts = async () => {
            if (!token) {
                setError('Admin authentication required.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                // TODO: Replace with the actual admin endpoint for fetching ALL products
                // This might be different from the public /api/products endpoint
                const response = await fetch('/api/admin/products', { 
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch products');
                }
                setProducts(data);
            } catch (err) {
                console.error("Fetch products error:", err);
                setError(err.message || 'Error fetching products.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [token]);

    // Placeholder functions for product actions
    const handleEditProduct = (productId) => {
        console.log(`Edit product: ${productId}`);
        // TODO: Navigate to an edit page or open a modal
    };

    const handleDeleteProduct = (productId) => {
        console.log(`Delete product: ${productId}`);
        // TODO: Implement delete logic with confirmation
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Product Management
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table aria-label="product management table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Farmer/Vendor</TableCell> 
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No products found.</TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.category || 'N/A'}</TableCell>
                                        <TableCell>${product.price ? parseFloat(product.price).toFixed(2) : 'N/A'}</TableCell>
                                        <TableCell>{product.stock !== undefined ? product.stock : 'N/A'}</TableCell>
                                        {/* Assuming farmer info is available, adjust as needed */}
                                        <TableCell>{product.Farmer?.name || product.farmerId || 'N/A'}</TableCell> 
                                        <TableCell align="center">
                                            <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => handleEditProduct(product.id)} disabled>
                                                Edit
                                            </Button>
                                            <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteProduct(product.id)} disabled>
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

export default ProductManagementPage;
