import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ListAltIcon from '@mui/icons-material/ListAlt'; // Example icon for My Products
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Example icon for Add Product

function FarmerDashboardPage() {
    // Add logic here later for farmer-specific stats or info

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Farmer Dashboard
            </Typography>

            <Grid container spacing={3}>
                {/* My Products Card */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 180 }}>
                        <ListAltIcon sx={{ fontSize: 60, mb: 1 }} color="primary" />
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            My Products
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                            View, edit, or delete your listed products.
                        </Typography>
                        <Button component={RouterLink} to="/my-products" variant="contained" size="small">
                            Go to My Products
                        </Button>
                    </Paper>
                </Grid>

                {/* Add Product Card */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 180 }}>
                        <AddCircleOutlineIcon sx={{ fontSize: 60, mb: 1 }} color="secondary" />
                        <Typography component="h2" variant="h6" color="secondary" gutterBottom>
                            Add New Product
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                            List a new product for sale.
                        </Typography>
                        <Button component={RouterLink} to="/products/add" variant="contained" size="small" color="secondary">
                            Add Product
                        </Button>
                    </Paper>
                </Grid>

                 {/* Add more farmer-specific cards/widgets here (e.g., Orders Received, Analytics) */}
            </Grid>
        </Container>
    );
}

export default FarmerDashboardPage;
