import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { LockFill } from 'react-bootstrap-icons';

const ChangePassword = () => {
    const navigate = useNavigate();
    // 💡 NOVO ESTADO: Controla se a checagem inicial de token está em curso
    const [isAuthChecking, setIsAuthChecking] = useState(true); 

    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        re_new_password: '', 
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const CHANGE_PASSWORD_URL = '/api/v1/auth/users/set_password/'; 

    // --- LÓGICA DE REDIRECIONAMENTO E CONFIGURAÇÃO ---
    useEffect(() => {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            // Se não houver token, navega para o login (usa setTimeout para evitar race condition)
            setTimeout(() => navigate('/login'), 50); 
        } else {
            // Se houver, configura o token para a requisição
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
            setIsAuthChecking(false); // Token encontrado, pode renderizar o formulário
        }

        // 💡 LIMPEZA: Remove o header Authorization ao desmontar
        return () => {
            if (token) {
                delete axios.defaults.headers.common['Authorization'];
            }
        };
    }, [navigate]);
    
    // 🚨 CORREÇÃO DE RENDERIZAÇÃO: Mostra o spinner enquanto o token está sendo checado
    if (isAuthChecking) {
        return (
            <Container className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
                 <Spinner animation="border" variant="warning" />
                 <p className="ms-2 text-muted">Verificando autenticação...</p>
            </Container>
        );
    }

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // --- LÓGICA DE ENVIO (POST) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        const { new_password, re_new_password } = formData;
        
        if (new_password !== re_new_password) {
            setError("As novas senhas não coincidem.");
            setLoading(false);
            return;
        }

        if (new_password.length < 6) {
             setError("A nova senha deve ter no mínimo 6 caracteres.");
             setLoading(false);
             return;
        }

        try {
            const response = await axios.post(CHANGE_PASSWORD_URL, {
                current_password: formData.current_password,
                new_password: new_password,
                re_new_password: re_new_password,
            });

            if (response.status === 204 || response.status === 200) {
                setSuccess("Senha alterada com sucesso! Redirecionando para o perfil...");
                
                setTimeout(() => navigate('/me'), 2000); 
            }

        } catch (err) {
            console.error("Erro ao trocar a senha:", err.response || err);
            
            let errorMessage = "Erro desconhecido. Verifique a senha atual e tente novamente.";

            if (err.response) {
                if (err.response.status === 401) {
                    errorMessage = "Sessão expirada. Faça login novamente.";
                } else if (err.response.data) {
                    const errorData = err.response.data;
                    if (errorData.current_password) {
                        errorMessage = `Senha Atual: ${errorData.current_password.join(' ')}`;
                    } else if (errorData.new_password) {
                        errorMessage = `Nova Senha: ${errorData.new_password.join(' ')}`;
                    } else if (errorData.non_field_errors) {
                        errorMessage = errorData.non_field_errors.join(' ');
                    } else if (errorData.detail) {
                         errorMessage = errorData.detail; 
                    }
                }
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };
    
    // --- RENDERIZAÇÃO PRINCIPAL (SÓ APARECE SE AUTENTICADO) ---
    return (
        <Container className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '100vh' }}>
            <Card className="bg-vagali-dark-card p-4 shadow-lg" style={{ width: '450px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <LockFill className="me-2 text-warning" /> Trocar Senha
                </h2>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                    
                    {/* SENHA ATUAL */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">Senha Atual:</Form.Label>
                        <Form.Control 
                            type="password" 
                            id="current_password"
                            className="form-control-dark" 
                            placeholder="Sua senha atual"
                            value={formData.current_password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* NOVA SENHA */}
                    <Form.Group className="mb-3">
                        <Form.Label className="text-white-50">Nova Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            id="new_password"
                            className="form-control-dark" 
                            placeholder="Mínimo 6 caracteres"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* CONFIRMAÇÃO DA NOVA SENHA */}
                    <Form.Group className="mb-4">
                        <Form.Label className="text-white-50">Confirme a Nova Senha:</Form.Label>
                        <Form.Control 
                            type="password" 
                            id="re_new_password"
                            className="form-control-dark" 
                            placeholder="Repita a nova senha"
                            value={formData.re_new_password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    {/* BOTÕES */}
                    <div className="d-flex justify-content-between gap-2 mt-4">
                        <Button 
                            type="submit" 
                            className="flex-grow-1 fw-bold"
                            variant="warning"
                            disabled={loading}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Confirmar Troca'}
                        </Button>
                        <Button 
                            type="button" 
                            className="fw-bold" 
                            variant="secondary"
                            onClick={() => navigate('/me')} 
                        >
                            Voltar
                        </Button>
                    </div>

                </Form>
            </Card>
        </Container>
    );
};

export default ChangePassword;