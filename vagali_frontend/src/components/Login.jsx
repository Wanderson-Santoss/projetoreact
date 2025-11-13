import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from './AuthContext'; // 🚨 Caminho Corrigido

const Login = () => {
    const navigate = useNavigate();
    // 🚨 CHAVE ESSENCIAL: Importar a função login do contexto
    const { login, isAuthenticated } = useAuth(); 

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Efeito para verificar se o usuário já está logado no contexto
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/meu-perfil'); 
        }
    }, [navigate, isAuthenticated]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 🚨 MUDANÇA CRUCIAL: Chama a função login do contexto que faz a chamada de API
            await login(email, password);
            // Se o login for bem-sucedido (sem throw), redireciona
            navigate('/meu-perfil'); 
        } catch (err) {
            // Se a função login lançar um erro (catch no AuthContext), ele é capturado aqui
            setError(err.message || 'Erro desconhecido ao tentar logar.');
        } finally {
            setLoading(false);
        }
    };
    
    // Remove o LOGIN_URL, pois a API call é feita no AuthContext
    // Remove a lógica de axios e localStorage, pois é feita no AuthContext

    return (
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: 'var(--primary-color)' }}>
            <Card style={{ maxWidth: '400px', width: '100%' }} className="p-4 shadow-lg bg-dark">
                <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-color)' }}>Login</h2>
                
                {error && (
                    <Alert variant="danger" className="text-center p-2 small">
                        {error}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label className="text-white-50">Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            className="form-control-dark" 
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="password">
                        <Form.Label className="text-white-50">Senha</Form.Label>
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