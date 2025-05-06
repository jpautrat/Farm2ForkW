// frontend/src/pages/farmer/FarmerProductsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { AuthContext } from '../../context/AuthContext';
import { getFarmerProducts, deleteProduct } from '../../services/api'; // Import deleteProduct
import LoadingSpinner from '../../components/LoadingSpinner'; // Assuming you have a spinner
import Alert from '../../components/Alert'; // Assuming you have an Alert component

function FarmerProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState(''); // Specific error state for delete actions
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchProducts = async () => {
            if (!user || user.role !== 'farmer' || !token) {
                setError('Unauthorized');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const data = await getFarmerProducts(token); // Pass token for auth
                setProducts(data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to fetch products');
                console.error("Fetch Farmer Products Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [user, token]);

    const handleDelete = async (productId) => {
        // Confirmation dialog
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            setDeleteError(''); // Clear previous delete errors
            try {
                await deleteProduct(productId, token); // Call API
                // Update state locally by filtering out the deleted product
                setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
            } catch (err) {
                console.error("Delete Product Error:", err);
                // Set specific error for delete failure
                setDeleteError(err.message || 'Failed to delete product. Please try again.');
                // Clear error after a few seconds
                setTimeout(() => setDeleteError(''), 5000);
            }
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <Alert type="error">{error}</Alert>; // Initial fetch error

    return (
        <div className="container mt-4">
            <h2>My Products</h2>
            
            <div className="mb-3">
                <button 
                    className="btn btn-success"
                    onClick={() => navigate('/farmer/products/add')}
                >
                    Add New Product
                </button>
            </div>

            {/* Display delete error if it occurs */}
            {deleteError && <Alert type="error">{deleteError}</Alert>}

            {products.length === 0 && !loading && (
                <p>You have not listed any products yet.</p>
            )}
            {products.length > 0 && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <img src={product.imageUrl || '/images/placeholder.png'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                </td>
                                <td>{product.name}</td>
                                <td>${product.price?.toFixed(2)}</td>
                                <td>{product.countInStock}</td>
                                <td>
                                    <Link 
                                        to={`/farmer/products/edit/${product._id}`} 
                                        className="btn btn-sm btn-primary me-2"
                                    >
                                        Edit
                                    </Link>
                                    <button 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => handleDelete(product._id)} // Attach handleDelete
                                    >
                                        Delete
                                    </button> 
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default FarmerProductsPage;
