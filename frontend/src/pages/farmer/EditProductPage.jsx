import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getProductById, updateProduct } from '../../services/api'; // Import API functions

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function EditProductPage() {
    const { productId } = useParams(); // Get product ID from URL
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);

    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        countInStock: '', // Use countInStock to match model/API
    });
    const [loading, setLoading] = useState(true); // Start loading true to fetch data
    const [updating, setUpdating] = useState(false); // Separate state for update operation
    const [error, setError] = useState('');

    // Fetch existing product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!token || user?.role !== 'farmer') {
                setError('Access denied.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError('');
            try {
                // Use getProductById from api.js
                const data = await getProductById(productId, token);

                // Ensure numeric fields are strings for TextField compatibility
                setProductData({
                    name: data.name || '',
                    description: data.description || '',
                    category: data.category || '',
                    price: data.price !== undefined ? String(data.price) : '',
                    countInStock: data.countInStock !== undefined ? String(data.countInStock) : '', // Use countInStock
                });
            } catch (err) {
                console.error("Fetch product error:", err);
                // Error message is now handled by handleError in api.js
                setError(err || 'Error fetching product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, token, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || user?.role !== 'farmer') {
            setError('Access denied. Only farmers can edit products.');
            return;
        }
        setUpdating(true);
        setError('');

        // Basic validation
        if (!productData.name || !productData.price || !productData.countInStock) { // Check countInStock
            setError('Product Name, Price, and Stock are required.');
            setUpdating(false);
            return;
        }

        try {
            const updatePayload = {
                name: productData.name,
                description: productData.description,
                category: productData.category || undefined, // Send undefined if empty
                price: parseFloat(productData.price),
                countInStock: parseInt(productData.countInStock, 10), // Use countInStock
                // imageUrl can be added later
            };

            // Use updateProduct from api.js
            const updatedProduct = await updateProduct(productId, updatePayload, token);

            console.log('Product updated:', updatedProduct);

            // Navigate back to the farmer's product list on success
            navigate('/farmer/products'); // Updated navigation target

        } catch (err) {
            console.error("Update product error:", err);
            // Error message is now handled by handleError in api.js
            setError(err || 'An error occurred while updating the product.');
        } finally {
            setUpdating(false);
        }
    };

    // Redirect if not a farmer
    if (user?.role !== 'farmer') {
        // Could also redirect: navigate('/login');
        return <p>Access Denied: Only farmers can edit products.</p>;
    }

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading product details...</Typography>
            </Container>
        );
    }

    if (error && !productData.name) { // Show error prominently if fetching failed initially
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Edit Product
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name"
                        label="Product Name"
                        name="name"
                        autoComplete="product-name"
                        value={productData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Product Description"
                        name="description"
                        multiline
                        rows={4}
                        value={productData.description}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="category"
                        label="Category (Optional)"
                        name="category"
                        value={productData.category}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="price"
                        label="Price ($)"
                        name="price"
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                        value={productData.price}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="countInStock" // Use countInStock
                        label="Stock Quantity"
                        name="countInStock" // Use countInStock
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: "1" } }}
                        value={productData.countInStock} // Use countInStock
                        onChange={handleChange}
                    />
                    
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, position: 'relative' }}
                        disabled={updating} // Disable button while updating
                    >
                        Update Product
                        {updating && (
                            <CircularProgress 
                                size={24} 
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 1, mb: 2 }}
                        onClick={() => navigate('/farmer/products')} // Cancel button
                        disabled={updating}
                    >
                        Cancel
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}

export default EditProductPage;
