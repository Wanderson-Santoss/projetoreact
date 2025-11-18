import axios from 'axios';

// --- Ponto 1: Configuração da URL Base (Opcional) ---
// Se você usa um proxy no package.json, mantenha esta linha comentada.
// Caso contrário, descomente e ajuste para a URL completa da sua API (ex: 'http://127.0.0.1:8000/api/v1')
// axios.defaults.baseURL = '/api/v1'; 


// --- Ponto 2: Função para setar/limpar o token globalmente ---
// Esta função será controlada APENAS pelo seu AuthContext.
export const setAuthToken = (token) => {
    if (token) {
        // CRÍTICO: Formato DRF: "Token <chave_do_token>"
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
        // Limpa o header
        delete axios.defaults.headers.common['Authorization'];
    }
};

// --- Ponto 3: REMOVEMOS O CÓDIGO DE CHECK INICIAL ---
// A responsabilidade de ler o token no início da aplicação foi movida para o AuthContext.

// Exporta a instância do axios configurado
export default axios;