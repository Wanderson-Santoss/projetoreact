import axios from 'axios';

// --- Ponto 1: Configuração da URL Base (Obrigatório para 404) ---
// Utilize o endereço completo onde sua API Django está rodando.
// EX: Se você roda o backend em http://localhost:8000
axios.defaults.baseURL = 'http://localhost:8000/api/v1'; 


// --- Ponto 2: Função para setar/limpar o token globalmente ---
export const setAuthToken = (token) => {
    if (token) {
        // CRÍTICO: Formato DRF: "Token <chave_do_token>"
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
        // Limpa o header
        delete axios.defaults.headers.common['Authorization'];
    }
};

// Exporta a instância do axios configurado
export default axios;