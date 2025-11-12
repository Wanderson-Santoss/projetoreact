import React, { createContext, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

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

    // ESTADO INICIAL: Tenta carregar o usuário logado
    const [user, setUser] = useState(() => {
        // Usa 'authToken' como chave principal (corrigindo a inconsistência de 'userToken')
        const token = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole') || 'Cliente';

        if (token) { 
            // Se houver token, simula um usuário logado
            return { 
                id: '123', 
                role: storedRole, 
                email: localStorage.getItem('userEmail') || 'teste@vagali.com', // Adicionando email para persistência
                fullName: 'Usuário Teste Vagali'
            };
        }
        return null; // Usuário deslogado por padrão
    });

    // --- FUNÇÕES ESSENCIAIS DE AUTENTICAÇÃO ---

    // Função de Login (SIMULADA - substitua a lógica interna pela sua chamada de API real)
    const login = async (email, password) => {
        // 🚨 Aqui deve entrar sua lógica de chamada de API real (ex: axios.post('/api/auth/login'))
        // Por enquanto, é uma simulação de sucesso:
        
        // Simulação de resposta da API
        const roleFromApi = 'Cliente'; // Supondo que a API retorne o papel
        const tokenFromApi = 'simulated_jwt_token';
        
        // Simulação de sucesso da requisição
        localStorage.setItem('authToken', tokenFromApi);
        localStorage.setItem('userRole', roleFromApi);
        localStorage.setItem('userEmail', email); // Armazena o email
        
        const userData = { 
            id: '123', 
            role: roleFromApi, 
            email, 
            fullName: 'Usuário Teste Vagali' 
        };
        setUser(userData); // 🎯 ISTO ATUALIZA O ESTADO GLOBAL
        
        // Não redirecionamos aqui. Deixamos o componente de Login fazer o navigate.
        // O componente Login fará o navigate após chamar esta função.
        return true;
    };

    // FUNÇÃO DE LOGOUT
    const logout = () => {
        console.log("Usuário deslogado e limpando sessão.");
        localStorage.removeItem('authToken'); 
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('userEmail');
        setUser(null);                      
        navigate('/login');                 
    };

    // Função para alternar o papel (usada no ProfileManagement)
    const setUserRole = (newRole) => {
        if (!user) return; // Não muda o papel se não houver usuário logado
        
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