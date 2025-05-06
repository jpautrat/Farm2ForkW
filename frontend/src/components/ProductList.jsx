import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia'; 
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar'; 

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addCartError, setAddCartError] = useState('');
    const [addCartSuccess, setAddCartSuccess] = useState(false);
    const [isAdding, setIsAdding] = useState(null); 
    const { token, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('/api/products');
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch products');
                }
                setProducts(data || []);
            } catch (err) {
                console.error("Fetch products error:", err);
                setError(err.message || 'An error occurred while fetching products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) {
            navigate('/login'); 
            return;
        }
        setIsAdding(productId); 
        setAddCartError('');
        setAddCartSuccess(false);

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity: 1 }), 
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add item to cart');
            }
            setAddCartSuccess(true); 
        } catch (err) {
            console.error("Add to cart error:", err);
            setAddCartError(err.message || 'Error adding item to cart.');
        } finally {
            setIsAdding(null); 
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setAddCartSuccess(false);
        setAddCartError('');
      };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                 <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Products
            </Typography>
            {addCartError && <Alert severity="error" sx={{ mb: 2 }}>{addCartError}</Alert>}
            
            <Grid container spacing={4}> 
                {products.map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4}> 
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardMedia
                                component="img"
                                sx={{ 
                                    aspectRatio: '16/9', 
                                    objectFit: 'cover' 
                                }}
                                image={product.imageUrl || 'https://via.placeholder.com/300x150?text=No+Image'}
                                alt={product.name}
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {product.description}
                                </Typography>
                                <Typography variant="h6" sx={{ mt: 1 }}>
                                    ${product.price ? product.price.toFixed(2) : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color={product.quantity > 0 ? 'text.primary' : 'error'}>
                                    {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    onClick={() => handleAddToCart(product.id)} 
                                    disabled={product.quantity === 0 || isAdding === product.id}
                                >
                                    {isAdding === product.id ? <CircularProgress size={24} /> : 'Add to Cart'}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Snackbar
                open={addCartSuccess}
                autoHideDuration={3000} 
                onClose={handleCloseSnackbar}
                message="Item added to cart successfully!"
            />

        </Box>
    );
}

export default ProductList;
