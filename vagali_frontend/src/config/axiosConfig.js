import axios from 'axios';

// Função para setar/limpar o token globalmente
export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        console.log("Axios Configurado: Token aplicado globalmente.");
    } else {
        delete axios.defaults.headers.common['Authorization'];
        console.log("Axios Configurado: Token removido globalmente.");
    }
};

// 🚨 A SOLUÇÃO: Interceptor de Requisição
// Ele executa antes de CADA requisição para garantir o token mais atualizado.
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');

        // Adiciona o token se ele existir E se a requisição não for para login/registro
        // Isso evita enviar cabeçalhos desnecessários para endpoints de autenticação.
        const isAuthUrl = config.url.includes('/auth/login/') || config.url.includes('/auth/register/');

        if (token && !isAuthUrl) {
            // Sobrescreve/adiciona o cabeçalho Authorization
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Check inicial na carga da aplicação (para manter o usuário logado após F5)
const initialToken = localStorage.getItem('userToken');
if (initialToken) {
    setAuthToken(initialToken);
}