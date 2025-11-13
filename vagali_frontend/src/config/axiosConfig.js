// axiosConfig.js (CORRIGIDO)

import axios from 'axios';

// Função para setar/limpar o token globalmente
export const setAuthToken = (token) => {
    if (token) {
        // 🚨 CRÍTICO: Usa 'authToken' para consistência
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        console.log("Axios Configurado: Token aplicado globalmente.");
    } else {
        delete axios.defaults.headers.common['Authorization'];
        console.log("Axios Configurado: Token removido globalmente.");
    }
};

// 🚨 Interceptor de Requisição (Garante o token em todas as requisições, exceto login/registro)
axios.interceptors.request.use(
    (config) => {
        // 🚨 CRÍTICO: Usa 'authToken' para consistência
        const token = localStorage.getItem('authToken'); 

        // Verifica se é uma URL de autenticação que não deve ter token (ex: login, registro)
        const isAuthUrl = config.url && (
            config.url.includes('/auth/login/') || 
            config.url.includes('/auth/register/')
        );

        if (token && !isAuthUrl) {
            // Adiciona o cabeçalho Authorization com o prefixo 'Token '
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Check inicial na carga da aplicação (para manter o usuário logado após F5)
// 🚨 CRÍTICO: Usa 'authToken' para consistência
const initialToken = localStorage.getItem('authToken');
if (initialToken) {
    setAuthToken(initialToken);
}