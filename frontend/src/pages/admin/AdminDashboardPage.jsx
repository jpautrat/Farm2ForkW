import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// MUI Imports
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import PeopleIcon from '@mui/icons-material/People'; // Example icon
import InventoryIcon from '@mui/icons-material/Inventory'; // Example icon

function AdminDashboardPage() {
    const { user } = useContext(AuthContext);

    // Basic role check
    if (user?.role !== 'admin') {
        return <p>Access Denied: You must be an administrator to view this page.</p>;
    }

    // Add logic here later to fetch dashboard stats if needed

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard
            </Typography>
            
            <Grid container spacing={3}>
                {/* User Management Card */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 180 }}>
                        <PeopleIcon sx={{ fontSize: 60, mb: 1 }} color="primary" />
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            User Management
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                            View and manage platform users.
                        </Typography>
                        <Button component={RouterLink} to="/admin/users" variant="contained" size="small">
                            Go to Users
                        </Button>
                    </Paper>
                </Grid>

                {/* Product Management Card (Placeholder) */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: 180 }}>
                        <InventoryIcon sx={{ fontSize: 60, mb: 1 }} color="secondary" />
                        <Typography component="h2" variant="h6" color="secondary" gutterBottom>
                            Product Management
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ flexGrow: 1 }}>
                            Manage products and categories.
                        </Typography>
                        {/* Link to product management page when created */}
                        <Button component={RouterLink} to="/admin/products" variant="contained" size="small" color="secondary">
                            Go to Products
                        </Button>
                    </Paper>
                </Grid>

                {/* Add more dashboard cards/widgets here (e.g., Orders, Analytics) */}

            </Grid>
        </Container>
    );
}

export default AdminDashboardPage;
