import React, { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
// 🚨 CORREÇÃO CRÍTICA: Caminho corrigido para subir um nível (..) e entrar em 'config/'
import { setAuthToken } from '../config/axiosConfig.js'; 

const AuthContext = createContext(null);

/**
 * Hook para usar o contexto de autenticação em qualquer componente.
 */
export const useAuth = () => {
    return useContext(AuthContext);
};

/**
 * Provedor de Autenticação que encapsula a aplicação.
 */
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // ESTADO INICIAL: Tenta carregar o usuário logado do localStorage
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole') || 'Cliente'; 

        if (token) { 
            // 🚨 CRÍTICO: Aplica o token globalmente no carregamento inicial
            setAuthToken(token);
            
            return { 
                id: localStorage.getItem('userId') || '123',
                role: storedRole, 
                email: localStorage.getItem('userEmail') || 'teste@vagali.com',
                fullName: localStorage.getItem('userFullName') || 'Usuário Teste Vagali'
            };
        }
        return null; // Usuário deslogado por padrão
    });

    // --- FUNÇÕES ESSENCIAIS DE AUTENTICAÇÃO ---

    // FUNÇÃO DE LOGIN REAL (CHAMADA DE API)
    const login = async (email, password) => {
        // Usando o endpoint customizado que seu Django mapeou:
        const API_URL = 'http://127.0.0.1:8000/api/v1/auth/login/'; 

        try {
            // Chamada de API real para o backend
            // Força a remoção do cabeçalho de autenticação para o LOGIN, caso haja um token antigo
            const response = await axios.post(
                API_URL, 
                { email, password },
                {
                    headers: {
                        Authorization: undefined 
                    }
                }
            );
            
            const tokenFromApi = response.data.token || response.data.key; 
            
            // Dados temporários do usuário (serão atualizados na chamada GET do perfil)
            const userData = { 
                id: '123', // Placeholder, se a API não retornar
                role: 'Cliente', // Status inicial
                email, 
                fullName: 'Usuário Logado' 
            };
            
            // Persistência no localStorage
            localStorage.setItem('authToken', tokenFromApi);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userId', userData.id);
            localStorage.setItem('userFullName', userData.fullName);
            
            // 🚨 CRÍTICO: Configura o token globalmente no Axios para requisições futuras
            setAuthToken(tokenFromApi);

            setUser(userData); 
            return true;

        } catch (error) {
            console.error("Login falhou:", error.response?.data || error);
            // Mensagem mais amigável
            throw new Error("Credenciais inválidas. Verifique seu email e senha.");
        }
    };

    // FUNÇÃO DE LOGOUT
    const logout = () => {
        // 🚨 CRÍTICO: Remove o token globalmente no Axios antes de limpar o storage
        setAuthToken(null); 
        
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        localStorage.removeItem('userFullName');
        setUser(null); 
        navigate('/login'); 
    };

    // Função para alternar o papel
    const setUserRole = (newRole) => {
        if (!user) return; 
        
        setUser(prev => ({ 
            ...prev, 
            role: newRole 
        }));
        localStorage.setItem('userRole', newRole); 
    };
    
    // Valores derivados do estado (memoizados para performance)
    const contextValue = useMemo(() => ({
        isAuthenticated: !!user,
        user,
        userId: user?.id,
        userRole: user?.role, 
        isUserProfessional: user?.role === 'Profissional',
        
        // CRÍTICO: Expondo o token que está no localStorage
        token: localStorage.getItem('authToken'), 
        
        login, 
        logout, 
        setUserRole
    }), [user, navigate]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};