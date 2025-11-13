import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { setAuthToken } from '../config/axiosConfig.js'; 

const AuthContext = createContext(null);

// ----------------------------------------------------
// 1. HOOK CUSTOMIZADO
// ----------------------------------------------------
export const useAuth = () => {
    return useContext(AuthContext);
};

// ----------------------------------------------------
// 2. PROVEDOR DE AUTENTICAÇÃO
// ----------------------------------------------------
export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // Assumimos que a API de login retorna esta estrutura para o usuário:
    // { id: 2, full_name: 'João Cliente', email: 'joao@mail.com', is_professional: false }
    const API_LOGIN_URL = 'http://127.0.0.1:8000/api/v1/auth/login/';

    // ESTADO: Armazena o objeto user completo ou null.
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem('authToken');
        const storedUserData = localStorage.getItem('user'); // Armazena o objeto user completo
        
        if (token && storedUserData) { 
            setAuthToken(token); // Aplica o token globalmente
            try {
                return JSON.parse(storedUserData);
            } catch (e) {
                console.error("Falha ao parsear dados do usuário do localStorage", e);
                localStorage.clear(); // Limpa dados inconsistentes
                return null;
            }
        }
        return null; // Usuário deslogado por padrão
    });

    // FUNÇÃO DE LOGIN REAL (CHAMADA DE API)
    const login = useCallback(async (email, password) => {

        try {
            const response = await axios.post(
                API_LOGIN_URL, 
                { email, password },
                {
                    headers: {
                        Authorization: undefined // Garante que o token antigo não seja enviado
                    }
                }
            );
            
            // 🚨 MUDANÇA CRÍTICA: Pegando dados dinâmicos da API 
            const tokenFromApi = response.data.token || response.data.key; 
            const userFromApi = response.data.user; // Espera-se: { id: 2, full_name: 'João Cliente', ... }
            
            // Validação Mínima
            if (!userFromApi || !userFromApi.id || !tokenFromApi) {
                throw new Error("Resposta da API incompleta (faltando ID ou Token).");
            }

            // Harmoniza o objeto de usuário para o nosso estado
            const userData = { 
                id: String(userFromApi.id), // Garante que o ID é string (igual ao useParams())
                fullName: userFromApi.full_name || 'Usuário Sem Nome',
                email: userFromApi.email || email,
                // Usa o campo que vem do backend para definir o papel (Profissional/Cliente)
                role: userFromApi.is_professional ? 'Profissional' : 'Cliente', 
                is_professional: userFromApi.is_professional,
            };
            
            // Persistência no localStorage
            localStorage.setItem('authToken', tokenFromApi);
            localStorage.setItem('user', JSON.stringify(userData)); // Armazena o objeto completo
            
            // CRÍTICO: Configura o token globalmente
            setAuthToken(tokenFromApi);

            setUser(userData); 
            return true;

        } catch (error) {
            console.error("Login falhou:", error.response?.data || error);
            throw new Error("Credenciais inválidas. Verifique seu email e senha.");
        }
    }, [setUser]); 

    // FUNÇÃO DE LOGOUT
    const logout = useCallback(() => {
        setAuthToken(null); 
        
        // Limpa todos os itens de autenticação
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('user'); 
        
        setUser(null); 
        navigate('/login'); 
    }, [navigate, setUser]); 

    // Função para alternar o papel
    const setUserRole = useCallback((newRole) => {
        if (!user) return; 
        
        const newUserData = { ...user, role: newRole, is_professional: (newRole === 'Profissional') };
        
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    }, [user, setUser]); 
    
    // Função para atualizar apenas o nome do usuário no Contexto e no LocalStorage
    const setUserName = useCallback((newName) => {
        if (!user) return; 
        
        const newUserData = { ...user, fullName: newName };
        
        setUser(newUserData); 
        localStorage.setItem('user', JSON.stringify(newUserData)); 
    }, [user, setUser]); 

    // Valores derivados do estado (memoizados para performance)
    const contextValue = useMemo(() => ({
        isAuthenticated: !!user,
        
        // 🚨 VALORES NECESSÁRIOS NO ProfessionalProfileView.jsx 🚨
        user, // Objeto user completo (contém fullName)
        userId: user?.id, // O ID do usuário logado (será '2' para o João)
        token: localStorage.getItem('authToken'),
        isUserProfessional: user?.role === 'Profissional',
        
        // Funções
        login, 
        logout, 
        setUserRole,
        setUserName 
    }), [user, login, logout, setUserRole, setUserName]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};