import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

//  URL DE LOGIN
const LOGIN_URL = '/api/v1/auth/custom-login/'; 

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    // Estado para armazenar o objeto do usuário (id, email, is_professional)
    const [user, setUser] = useState(null); 
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [loading, setLoading] = useState(false);

    // Efeito para configurar o token globalmente no Axios e carregar dados do localStorage
    useEffect(() => {
        if (token) {
            // Aplica o token no header do Axios para todas as requisições autenticadas
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setIsAuthenticated(true);
            
            // Tenta carregar dados do usuário do localStorage (para persistir entre reloads)
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    // Tenta garantir que o usuário está logado, mesmo após um refresh
                    // CRÍTICO: Garante que o estado do usuário seja preenchido
                    setUser(JSON.parse(storedUser)); 
                } catch (e) {
                    console.error("Erro ao carregar usuário do localStorage", e);
                    logout(); // Limpa se o dado estiver corrompido
                }
            }
        } else {
            // Limpa o token se não houver
            axios.defaults.headers.common['Authorization'] = '';
            setIsAuthenticated(false);
            setUser(null);
        }
    }, [token]);

    // Atualiza o status de profissional no Contexto e no localStorage
    const setUserRole = (is_professional_status) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            
            // Cria um novo objeto user com o status atualizado
            const newUser = { ...prevUser, is_professional: is_professional_status };
            
            // CRÍTICO: Atualiza o localStorage para manter a persistência
            localStorage.setItem('user', JSON.stringify(newUser));
            
            return newUser;
        });
    };
    
    //  Atualiza o nome completo no Contexto e no localStorage
    const setUserName = (fullName) => {
        setUser(prevUser => {
            if (!prevUser) return null;
            
            // Cria um novo objeto user com o nome atualizado
            const newUser = { ...prevUser, full_name: fullName };
            
            // CRÍTICO: Atualiza o localStorage para manter a persistência
            localStorage.setItem('user', JSON.stringify(newUser));
            
            return newUser;
        });
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(LOGIN_URL, { 
                email: email, 
                password: password 
            });
            const data = response.data;
            
            if (!data.token || !data.user_id) {
                throw new Error("Resposta da API incompleta (faltando ID ou Token).");
            }

            // 1. Salva o Token
            setToken(data.token);
            localStorage.setItem('token', data.token);

            // 2. Salva os Dados do Usuário
            const userData = {
                id: data.user_id,
                email: data.email,
                is_professional: data.is_professional,
                // Adicionar o full_name aqui se o seu endpoint de login retornar
                full_name: data.full_name || '', // <-- Importante: Adicionar full_name se o backend retornar
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

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        axios.defaults.headers.common['Authorization'] = '';
        
        setIsAuthenticated(false);
        navigate('/login');
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
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};