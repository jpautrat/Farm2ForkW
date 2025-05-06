import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createProduct } from '../../services/api'; // Import createProduct

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function AddProductPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(''); // Optional: Could be a Select component later
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState(''); // Renamed from quantity for consistency
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token || user?.role !== 'farmer') {
            setError('Access denied. Only farmers can add products.');
            return;
        }
        setLoading(true);
        setError('');

        // Basic validation (add more as needed)
        if (!name || !price || !stock) {
            setError('Product Name, Price, and Stock are required.');
            setLoading(false);
            return;
        }

        try {
            const productData = {
                name,
                description,
                category: category || undefined, // Send undefined if empty
                price: parseFloat(price),
                countInStock: parseInt(stock, 10), // Ensure field name matches model (countInStock)
                // imageUrl can be added later if implementing image uploads
            };

            // Use the imported API function
            const createdProduct = await createProduct(productData, token);

            console.log('Product added:', createdProduct);

            // Navigate back to the farmer's product list on success
            navigate('/farmer/products'); // Updated navigation target

        } catch (err) {
            console.error("Add product error:", err);
            // Error message is now handled by handleError in api.js
            setError(err || 'An error occurred while adding the product.'); 
        } finally {
            setLoading(false);
        }
    };

    // Redirect if not a farmer
    if (user?.role !== 'farmer') {
        return <p>Access Denied: Only farmers can add products.</p>;
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Add New Product
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
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Product Description"
                        name="description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        id="category"
                        label="Category (Optional)"
                        name="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="price"
                        label="Price ($)"
                        name="price"
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: "0.01" } }} // Basic input validation
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="stock"
                        label="Stock Quantity"
                        name="stock"
                        type="number"
                        InputProps={{ inputProps: { min: 0, step: "1" } }} // Basic input validation
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
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
                        disabled={loading}
                    >
                        Add Product
                        {loading && (
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
                </Box>
            </Paper>
        </Container>
    );
}

export default AddProductPage;
