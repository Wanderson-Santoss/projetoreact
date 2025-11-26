import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// URL DE LOGIN
const LOGIN_URL = '/api/v1/auth/custom-login/'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // CRÍTICO: Lê o token e o usuário do localStorage na inicialização
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    }); 
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(false);
    
    // Funções de atualização local (permanecem as mesmas)
    const updateUserData = (updates) => {
        setUser(prevUser => {
            if (!prevUser) return prevUser;
            const newUser = { ...prevUser, ...updates }; 
            localStorage.setItem('user', JSON.stringify(newUser)); 
            return newUser;
        });
    };
    const setUserName = (name) => { updateUserData({ full_name: name }); };
    const setUserRole = (isProfessional) => { updateUserData({ is_professional: isProfessional }); };

    // FUNÇÃO DE LOGOUT (centralizada)
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        axios.defaults.headers.common['Authorization'] = '';
        
        setIsAuthenticated(false);
        navigate('/login'); // Redireciona para o login
    };

    // EFEITO 1: Configura o token globalmente no Axios e autenticação
    useEffect(() => {
        if (token) {
            // ✅ Aplica o token no header do Axios para todas as requisições
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setIsAuthenticated(true);
        } else {
            // Limpa o header
            axios.defaults.headers.common['Authorization'] = '';
            setIsAuthenticated(false);
        }
    }, [token]);

    // EFEITO 2: Configura o Interceptor de Resposta do Axios
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            // Se a resposta for bem-sucedida (2xx), apenas retorna
            response => response,
            
            // Se a resposta for um erro (não 2xx)
            error => {
                // ⚠️ LÓGICA CRÍTICA: Se o status for 401 (Unauthorized) e o usuário estiver autenticado
                const status = error.response ? error.response.status : null;
                
                if (status === 401 && isAuthenticated) {
                    // Previne loop infinito se o logout também disparar uma requisição
                    // A requisição falhou devido a expiração, force o logout
                    console.warn("Token Expirado. Logout automático acionado.");
                    logout(); 
                    
                    // Retorna um Promise rejeitada para parar o fluxo da requisição original
                    return Promise.reject(error);
                }
                
                // Para qualquer outro erro, apenas retorna o erro
                return Promise.reject(error);
            }
        );

        // Função de limpeza: remove o interceptor quando o componente for desmontado
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [isAuthenticated, logout]); // Dependências do interceptor

    // Funções de Login (permanecem as mesmas)
    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(LOGIN_URL, { email, password });
            const data = response.data;
            
            setToken(data.token);
            localStorage.setItem('token', data.token);

            const userData = {
                id: data.user_id,
                email: data.email,
                is_professional: data.is_professional,
                full_name: data.full_name || '',
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setIsAuthenticated(true);
            
            console.log("Login bem-sucedido:", userData); 
        } catch (error) {
            console.error('Login falhou:', error);
            throw error; 
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        setUserRole, 
        setUserName, 
        updateUserData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};