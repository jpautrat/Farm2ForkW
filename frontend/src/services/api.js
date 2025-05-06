// frontend/src/services/api.js
import axios from 'axios';

// Define the base URL for the backend API
// Make sure the backend server is running on this port
// Adjust if your backend runs on a different port or domain
const API_URL = '/api'; // Using Vite proxy

// Create an axios instance for API requests
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// === Helper function to handle errors ===
const handleError = (error) => {
    console.error('API Call Error:', error.response || error.message || error);
    // Return a more user-friendly error message or the error response data
    return Promise.reject(error.response?.data?.message || error.message || 'An unknown error occurred');
};

// === Helper function to get auth token ===
const getAuthHeaders = (token) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// === Authentication ===
export const loginUser = async (email, password) => {
    try {
        const { data } = await api.post('/users/login', { email, password });
        return data; // Should return { user, token }
    } catch (error) {
        return handleError(error);
    }
};

export const registerUser = async (name, email, password, role) => {
    try {
        const { data } = await api.post('/users/register', { name, email, password, role });
        return data; // Should return { user, token }
    } catch (error) {
        return handleError(error);
    }
};

// === Products ===
export const getAllProducts = async () => {
    try {
        const { data } = await api.get('/products');
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const getProductById = async (productId) => {
    try {
        const { data } = await api.get(`/products/${productId}`);
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// === Cart ===
export const getCart = async (token) => {
    try {
        const { data } = await api.get('/cart', getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const addToCart = async (productId, quantity, token) => {
    try {
        const { data } = await api.post('/cart', { productId, quantity }, getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const removeFromCart = async (productId, token) => {
    try {
        const { data } = await api.delete(`/cart/${productId}`, getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const updateCartItemQuantity = async (productId, quantity, token) => {
    try {
        const { data } = await api.put(`/cart/${productId}`, { quantity }, getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// === Payments (Stripe) ===
export const createPaymentIntent = async (token) => {
    // Amount is calculated server-side now
    try {
        const { data } = await api.post('/payments/create-payment-intent', {}, getAuthHeaders(token));
        return data; // Should return { clientSecret }
    } catch (error) {
        return handleError(error);
    }
};

// === Orders ===
export const createOrder = async (orderData, token) => {
    // orderData should contain { shippingAddress, paymentIntentId }
    try {
        const { data } = await api.post('/orders', orderData, getAuthHeaders(token));
        return data; // Should return { orderId }
    } catch (error) {
        return handleError(error);
    }
};

export const getOrderDetails = async (orderId, token) => {
    try {
        const { data } = await api.get(`/orders/${orderId}`, getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const getMyOrders = async (token) => {
    try {
        const { data } = await api.get('/orders/myorders', getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

// === Farmer Specific ===
export const getFarmerProducts = async (token) => {
    try {
        const { data } = await api.get('/farmer/products', getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const getFarmerSalesOrders = async (token) => {
    try {
        const { data } = await api.get('/farmer/orders', getAuthHeaders(token));
        return data;
    } catch (error) {
        return handleError(error);
    }
};

export const createProduct = async (productData, token) => {
    // productData: { name, description, price, category, stock, imageUrl (optional) }
    try {
        const { data } = await api.post('/products', productData, getAuthHeaders(token));
        return data; // Returns the newly created product
    } catch (error) {
        return handleError(error);
    }
};

export const updateProduct = async (productId, productData, token) => {
    // productData: { name, description, price, category, stock, imageUrl (optional) }
    try {
        const { data } = await api.put(`/products/${productId}`, productData, getAuthHeaders(token));
        return data; // Returns the updated product
    } catch (error) {
        return handleError(error);
    }
};

export const deleteProduct = async (productId, token) => {
    try {
        // DELETE requests usually don't return a body, but check API response
        const { data } = await api.delete(`/products/${productId}`, getAuthHeaders(token));
        return data; // May return a success message or just status 200/204
    } catch (error) {
        return handleError(error);
    }
};

// Function to update the status of an order
export const updateOrderStatus = async (orderId, status, token) => {
    try {
        const { data } = await api.put(`/orders/${orderId}/status`, { status }, getAuthHeaders(token));
        return data; // Returns the updated order object from the backend
    } catch (error) {
        return handleError(error);
    }
};

// Add other API functions as needed (e.g., admin functions etc.)

export default api; // Optionally export the configured instance if needed elsewhere
