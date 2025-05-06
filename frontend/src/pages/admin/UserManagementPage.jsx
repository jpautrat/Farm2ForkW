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

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, user } = useContext(AuthContext); // Assuming admin token is used

    useEffect(() => {
        const fetchUsers = async () => {
            if (user?.role !== 'admin' || !token) {
                setError('Access Denied. Only administrators can manage users.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                // Assuming '/api/users' is the admin endpoint to fetch all users
                const response = await fetch('/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch users');
                }

                setUsers(data || []); // Ensure users is always an array
            } catch (err) {
                console.error("Fetch users error:", err);
                setError(err.message || 'An error occurred while fetching users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [token, user]);

    const handleDeleteUser = async (userId) => {
        if (user?.id === userId) {
             alert("Administrators cannot delete their own account.");
             return;
        }
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
             setError('');
             try {
                 const response = await fetch(`/api/users/${userId}`, {
                     method: 'DELETE',
                     headers: {
                         'Authorization': `Bearer ${token}`,
                     },
                 });
                 if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(errorData.message || 'Failed to delete user');
                 }
                 // Refresh user list
                 setUsers(users.filter(u => u.id !== userId));
                 alert('User deleted successfully.');
             } catch (err) {
                 console.error("Delete user error:", err);
                 setError(err.message || 'Failed to delete user.');
             }
        }
    };

    // Placeholder for role change logic
    const handleChangeRole = (userId, currentRole) => {
        // This would typically involve a PUT request to an endpoint like /api/users/:userId/role
        // Or open a modal/form to select the new role
        alert(`Role change functionality for user ${userId} (current: ${currentRole}) is not yet implemented.`);
    };

    if (user?.role !== 'admin') {
        return <p>Access Denied.</p>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                User Management
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table aria-label="user management table">
                        <TableHead>
                            <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                                <TableCell>ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Joined Date</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No users found.</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => handleChangeRole(user.id, user.role)} disabled={user.id === user.id}>
                                                Change Role
                                            </Button>
                                            <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteUser(user.id)} disabled={user.id === user.id}>
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

export default UserManagementPage;
