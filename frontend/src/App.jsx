import React, { useContext, useState } from 'react';
import { Routes, Route, Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'; 
import { AuthContext, AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// MUI Imports
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton'; 
import MenuIcon from '@mui/icons-material/Menu'; 
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Badge from '@mui/material/Badge'; // If showing cart count
import CircularProgress from '@mui/material/CircularProgress';

// Page Imports 
import ProductList from './components/ProductList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FarmerDashboardPage from './pages/farmer/FarmerDashboardPage';
import FarmerProductsPage from './pages/farmer/FarmerProductsPage';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import MyProductsPage from './pages/farmer/MyProductsPage';
import AddProductPage from './pages/farmer/AddProductPage';
import EditProductPage from './pages/farmer/EditProductPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import ProtectedRoute from './components/ProtectedRoute';

// Refactored Navigation using MUI AppBar
function Navigation() {
    const { user, token, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [cartItemCount, setCartItemCount] = useState(0); 

    const isAuthenticated = !!user; 

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleClose();
        navigate('/login');
    };

    const handleGoToCart = () => {
        navigate('/cart');
    };

    const handleGoToOrders = () => {
        navigate('/my-orders');
        handleClose();
    };

    if (loading) {
        return (
            <AppBar position="static">
                <Toolbar>
                     <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Farm2Fork
                    </Typography>
                    <CircularProgress color="inherit" size={24} />
                </Toolbar>
            </AppBar>
        );
    }

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Optional: IconButton for mobile menu if needed later */}
                {/* <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton> */}
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
                    Farm2Fork
                </Typography>

                {/* Navigation Links */} 
                <Box sx={{ display: 'flex', alignItems: 'center' }}> 
                    {isAuthenticated ? (
                        <>
                            <Typography variant="body1" component="span" sx={{ mr: 2 }}>
                                Welcome, {user?.name || user?.email} ({user?.role})
                            </Typography>
                            <Button color="inherit" component={RouterLink} to="/">Shop</Button> 
                            <Button color="inherit" component={RouterLink} to="/my-orders">My Orders</Button>
                            {/* Farmer Specific Links */} 
                            {user?.role === 'farmer' && (
                                <>
                                    <Button color="inherit" component={RouterLink} to="/farmer/products">
                                        My Products
                                    </Button>
                                    <Button color="inherit" component={RouterLink} to="/farmer/orders">
                                        My Sales
                                    </Button>
                                </> 
                            )}
                            {user?.role === 'admin' && (
                                <Button color="inherit" component={RouterLink} to="/admin/dashboard">Admin</Button>
                            )}
                            {/* Cart Icon - Consider moving logic to a dedicated CartContext/component */}
                            <IconButton 
                                size="large"
                                aria-label={`show ${cartItemCount} items in cart`}
                                color="inherit"
                                onClick={handleGoToCart}
                                sx={{ ml: 1 }} // Add some margin
                            >
                                <Badge badgeContent={cartItemCount} color="error">
                                    <ShoppingCartIcon />
                                </Badge>
                            </IconButton>

                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleGoToOrders}>My Orders</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to="/">Shop</Button>
                            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                            <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

// AppContent using MUI Container for consistent padding
function AppContent() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ProductList />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated User Routes */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />

            {/* Farmer Routes */}
            <Route 
                path="/dashboard/farmer"
                element={<ProtectedRoute requiredRole="farmer"><FarmerDashboardPage /></ProtectedRoute>}
            />
            <Route 
                path="/farmer/products" 
                element={<ProtectedRoute requiredRole="farmer"><FarmerProductsPage /></ProtectedRoute>} 
            />
            <Route 
                path="/farmer/orders"
                element={<ProtectedRoute requiredRole="farmer"><FarmerOrdersPage /></ProtectedRoute>}
            />
            <Route 
                path="/farmer/products/add"
                element={<ProtectedRoute requiredRole="farmer"><AddProductPage /></ProtectedRoute>} 
            />
            <Route 
                path="/farmer/products/edit/:productId"
                element={<ProtectedRoute requiredRole="farmer"><EditProductPage /></ProtectedRoute>} 
            />
            
            {/* Admin Routes */}
            <Route 
                path="/admin/dashboard"
                element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} 
            />
             <Route 
                path="/admin/users"
                element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} 
            />
             <Route 
                path="/admin/products"
                element={<ProtectedRoute requiredRole="admin"><ProductManagementPage /></ProtectedRoute>} 
            />

            {/* Default redirect or 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

// Main App component remains the same
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
