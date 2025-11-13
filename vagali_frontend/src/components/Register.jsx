import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios'; 

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        // CAMPOS OBRIGATÓRIOS/COMUNS
        email: '',
        password: '',
        password2: '', // Confirmação de senha
        is_professional: false, 
        full_name: '', // Nome completo
        cpf: '', 
        phone_number: '', // Telefone
        // CAMPOS OPCIONAIS DO PROFILE (APENAS PARA PROFISSIONAIS)
        bio: '',
        address: '',
        cnpj: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Endpoint de Cadastro customizado
    // 🚨 CORREÇÃO CRÍTICA: Usando o endpoint correto
    const REGISTER_URL = 'http://127.0.0.1:8000/api/v1/accounts/register/'; 

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        
        const finalValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [id]: finalValue
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        // 1. Validação de Senha Local
        if (formData.password !== formData.password2) {
            setError('As senhas não coincidem!');
            setLoading(false);
            return;
        }

        // 2. Montar o Payload
        const payload = {
            email: formData.email,
            password: formData.password,
            password2: formData.password2,
            is_professional: formData.is_professional,
            // Campos que serão usados para criar/atualizar o Profile
            full_name: formData.full_name,
            cpf: formData.cpf,
            phone_number: formData.phone_number,
        };
        
        // Adiciona campos opcionais apenas se for profissional
        if (formData.is_professional) {
            payload.bio = formData.bio;
            payload.address = formData.address;
            payload.cnpj = formData.cnpj;
            // O backend deve lidar com a criação do Profile com esses dados
        }

        try {
            const response = await axios.post(REGISTER_URL, payload);
            console.log("Cadastro bem-sucedido:", response.data);
            
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            navigate('/login'); // 🚨 Redireciona após o cadastro
            
        } catch (err) {
            const errorData = err.response?.data;
            let errorMessage = 'Erro no servidor. Tente novamente.';

            if (errorData) {
                // Tenta extrair mensagens de erro do backend (validação do serializer)
                if (errorData.email) {
                    errorMessage = `Email: ${errorData.email[0]}`;
                } else if (errorData.password2) {
                    errorMessage = `Confirmação de Senha: ${errorData.password2[0]}`;
                } else if (errorData.cpf) {
                    errorMessage = `CPF: ${errorData.cpf[0]}`;
                } else if (errorData.is_professional) {
                    errorMessage = `Profissional: ${errorData.is_professional[0]}`;
                }
                // Adicione mais verificações para outros campos, se necessário.
            }
            
            setError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: 'var(--primary-color)' }}>
            <Card style={{ maxWidth: '600px', width: '100%' }} className="p-4 shadow-lg bg-dark">
                <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--accent-color)' }}>Cadastro</h2>
                
                <Form onSubmit={handleRegister}>
                    
                    {/* CHECKBOX PROFISSIONAL */}
                    <Form.Group className="mb-4" controlId="is_professional">
                        <Form.Check 
                            type="checkbox" 
                            label={<span className="text-white fw-bold">Quero me cadastrar como Profissional</span>}
                            checked={formData.is_professional}
                            onChange={handleChange}
                            style={{ paddingLeft: '2em' }}
                        />
                        <p className="small text-white-50 ms-4 mt-1">Ao marcar, você poderá oferecer seus serviços na plataforma. (Requer preenchimento de Nome e CPF)</p>
                    </Form.Group>

                    {/* DADOS DE LOGIN */}
                    <h5 className="text-warning mb-3">Dados de Acesso</h5>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="email">
                                <Form.Label className="text-white-50">Email</Form.Label>
                                <Form.Control type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group controlId="password">
                                <Form.Label className="text-white-50">Senha</Form.Label>
                                <Form.Control type="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="password2">
                                <Form.Label className="text-white-50">Confirme a Senha</Form.Label>
                                <Form.Control type="password" placeholder="Repita a senha" value={formData.password2} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    {/* DADOS PESSOAIS */}
                    <h5 className="text-warning mb-3">Dados Pessoais</h5>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="full_name">
                                <Form.Label className="text-white-50">Nome Completo</Form.Label>
                                <Form.Control type="text" value={formData.full_name} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="phone_number">
                                <Form.Label className="text-white-50">Telefone</Form.Label>
                                <Form.Control type="text" placeholder="Ex: (21) 98765-4321" value={formData.phone_number} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group controlId="cpf" className="mb-4">
                        <Form.Label className="text-white-50">CPF</Form.Label>
                        <Form.Control type="text" maxLength={11} value={formData.cpf} onChange={handleChange} required />
                    </Form.Group>
                    
                    {/* CAMPOS ADICIONAIS SÓ PARA PROFISSIONAIS */}
                    <Collapse in={formData.is_professional}>
                        <div>
                            <h5 className="text-info mb-3 mt-3">Informações de Serviço</h5>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="cnpj">
                                        <Form.Label className="text-white-50">CNPJ (Opcional)</Form.Label>
                                        <Form.Control type="text" placeholder="Ex: 00.000.000/0001-00" maxLength={14} value={formData.cnpj} onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="address">
                                        <Form.Label className="text-white-50">Endereço Principal</Form.Label>
                                        <Form.Control type="text" placeholder="Rua, Número, Bairro, Cidade" value={formData.address} onChange={handleChange} />
                                        <p className="small text-white-50 mt-1">O endereço completo pode ser editado no perfil.</p>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group controlId="bio" className="mb-4">
                                <Form.Label className="text-white-50">Bio / Mini-Descrição</Form.Label>
                                <Form.Control as="textarea" rows={2} placeholder="Fale um pouco sobre seus serviços..." value={formData.bio} onChange={handleChange} />
                            </Form.Group>
                        </div>
                    </Collapse>

                    {error && (
                        <Alert variant="danger" className="p-2 small mt-4">
                            {error}
                        </Alert>
                    )}

                    {/* BOTÕES */}
                    <div className="d-flex justify-content-between gap-2 mb-3 mt-4">
                        <Button 
                            type="submit" 
                            className="flex-grow-1 fw-bold"
                            style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                            disabled={loading}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Cadastrar'}
                        </Button>
                        <Button 
                            type="button" 
                            className="flex-grow-1 fw-bold" 
                            variant="secondary"
                            onClick={() => navigate('/login')}
                        >
                            Voltar para Login
                        </Button>
                    </div>

                    <p className="text-center small text-white-50 mt-3">
                        Já tem conta? Faça seu <Link to="/login" className="text-vagali-link" style={{ color: 'var(--vagali-link)' }}>Login aqui</Link>.
                    </p>
                </Form>
            </Card>
        </Container>
    );
}

export default Register;    