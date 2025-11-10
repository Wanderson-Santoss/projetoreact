import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { BoxArrowInRight } from 'react-bootstrap-icons';
// 🚨 IMPORTAÇÃO CRÍTICA: Use a função global de configuração
import { setAuthToken } from '../config/axiosConfig'; 

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Endpoint de login (Djoser/authtoken)
    const LOGIN_URL = '/api/v1/auth/login/'; 

    // Efeito para verificar se o usuário já está logado
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (token) {
            // Se já está logado, redireciona. 
            // A configuração do token no Axios já deve ter ocorrido no App.jsx.
            navigate('/meu-perfil'); 
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Enviar o e-mail no campo 'username'
            const response = await axios.post(LOGIN_URL, {
                username: email,
                password: password
            });

            // Lógica para extrair o token da chave 'key' (padrão rest_framework.authtoken)
            const token = response.data.key || response.data.auth_token || response.data.token;
            
            if (token) {
                // 1. Salva o token no armazenamento local
                localStorage.setItem('userToken', token);
                
                // 2. 🚨 DEFINE O TOKEN GLOBALMENTE NO AXIOS (ESSENCIAL PARA O 401)
                setAuthToken(token);
                
                // 3. Redireciona para a rota protegida
                console.log("Autenticação bem-sucedida. Redirecionando...");
                navigate('/meu-perfil'); 
                
            } else {
                // Token não encontrado na resposta 200
                setError("O servidor retornou sucesso, mas o token de autenticação não foi encontrado na resposta.");
            }

        } catch (err) {
            // Tratamento de erro (ex: 400 Bad Request)
            console.error("Erro no login:", err.response || err);
            
            let errorMessage = "Falha na comunicação com o servidor.";

            if (err.response && err.response.status === 400) {
                 errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
            } else if (err.response && err.response.data && err.response.data.non_field_errors) {
                errorMessage = err.response.data.non_field_errors.join(' ');
            } else if (err.message === 'Network Error') {
                errorMessage = 'Erro de rede. Verifique sua conexão ou se o servidor está online.';
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <BoxArrowInRight className="me-2 text-primary" /> Acesso
                </h2>

                {/* Exibe o erro se houver */}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    {/* E-MAIL */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">E-mail:</Form.Label>
                        <Form.Control 
                            type="email" 
                            className="form-control-dark" 
                            placeholder="Seu e-mail de cadastro"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {/* SENHA */}
                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50">Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            className="form-control-dark" 
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    
                    {/* LINK ESQUECEU A SENHA */}
                    <div className="d-flex justify-content-end mb-3">
                        <Link to="/forgot-password" className="text-vagali-link small">
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    {/* BOTÃO DE LOGIN */}
                    <Button 
                        type="submit" 
                        className="w-100 fw-bold py-2"
                        variant="primary" 
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Entrar'}
                    </Button>
                </Form>

                <p className="text-center small text-white-50 mt-4">
                    Ainda não tem conta? <Link to="/register" className="text-vagali-link">Cadastre-se aqui</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;