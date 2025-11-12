import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
// Importação do useAuth
import { useAuth } from '../components/AuthContext'; 

const Login = () => {
    const navigate = useNavigate();
    // 🚨 Chave essencial: Importar a função login do contexto
    const { login, isAuthenticated } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Endpoint de login (Djoser/authtoken)
    const LOGIN_URL = '/api/v1/auth/login/'; 

    // Efeito para verificar se o usuário já está logado no contexto
    useEffect(() => {
        if (isAuthenticated) {
            // Se já está logado (estado no contexto), redireciona. 
            navigate('/meu-perfil'); 
        }
    }, [navigate, isAuthenticated]); // Depende do estado do Contexto

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 🚨 MUDANÇA CRUCIAL: Substituir a lógica de Axios e localStorage.setItem 
            // pela chamada centralizada ao login do AuthContext.
            
            // Opcional: Se a função login real usar axios, você pode fazer a chamada aqui
            // e passar os dados para o login do AuthContext. No entanto, o ideal 
            // é que o AuthContext faça a chamada. Vamos usar a função login do AuthContext:

            const success = await login(email, password); // Chama a função no Contexto

            if (success) {
                // O AuthContext.login já fará o setUser, que re-renderiza o Header.
                // O Header agora mudará imediatamente, e o useEffect acima 
                // garantirá o redirecionamento.
                navigate('/meu-perfil'); 
            } else {
                // Caso a API retorne erro, mas a chamada tenha sucesso
                setError("Erro desconhecido ao autenticar. Tente novamente.");
            }

        } catch (err) {
            // Tratamento de erros de rede ou resposta da API
            const message = err.response?.data?.detail || "Credenciais inválidas. Tente novamente.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-dark py-5">
            <Card className="p-4 shadow-lg text-white" style={{ maxWidth: '400px', width: '100%', backgroundColor: '#343a40', border: '1px solid #ffc107' }}>
                <h2 className="text-center mb-4 fw-bold text-warning">Entrar no VagALI</h2>

                {error && (
                    <Alert variant="danger" className="p-2 small mt-2">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="small">E-mail:</Form.Label>
                        <Form.Control 
                            type="email" 
                            className="form-control-dark" 
                            placeholder="seu.email@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label className="small">Senha:</Form.Label>
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
                        <Link to="/forgot-password" className="text-vagali-link small text-warning">
                            Esqueceu sua senha?
                        </Link>
                    </div>

                    {/* BOTÃO DE LOGIN */}
                    <Button 
                        type="submit" 
                        className="w-100 fw-bold py-2"
                        variant="warning" 
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : 'Entrar'}
                    </Button>
                </Form>

                <p className="text-center small text-white-50 mt-4">
                    Ainda não tem conta? <Link to="/register" className="text-vagali-link text-warning">Cadastre-se aqui</Link>
                </p>
            </Card>
        </Container>
    );
};

export default Login;