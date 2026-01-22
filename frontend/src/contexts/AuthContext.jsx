import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    // Backend returns the user in res.data.data
                    setUser(res.data.data);
                } catch (err) {
                    console.error("Token validation failed", err);
                    logout(); // Clear invalid token
                }
            }
            setLoading(false);
        };
        validateToken();
    }, []);

    const login = async (userId, password) => {
        try {
            const response = await api.post('/auth/login', { user_id: userId, password });
            const { token, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            // Redirect based on user role from backend
            if (user.role === 'ADMIN') {
                navigate('/admin');
            } else if (user.role === 'DOCTOR') {
                navigate('/doctor');
            } else if (user.role === 'PATIENT') {
                navigate('/patient');
            } else if (user.role === 'SUPER_ADMIN') {
                navigate('/super-admin');
            }

            return user;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
