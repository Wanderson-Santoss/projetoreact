import React, { useState, useCallback } from 'react'; 
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse } from 'react-bootstrap'; 
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
// Ícones Lucide: Adicionado MessageSquare, LogOut, ChevronDown, ChevronUp
import { Briefcase, User, Repeat, Settings, ListChecks, MapPin, Camera, Heart, ChevronDown, ChevronUp, MessageSquare, LogOut } from 'lucide-react'; 

import MyDemandsSection from './MyDemandsSection'; 
import { useAuth } from './AuthContext'; // Certifique-se de que este caminho está correto

const VIACEP_URL = 'https://viacep.com.br/ws/';
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/007bff/ffffff?text=FOTO';

const ProfileManagement = () => {
    
    // ESTADOS DE CONTROLE DE COLAPSO
    const [isInfoCollapsed, setIsInfoCollapsed] = useState(false); 

    // ESTADO DE AUTENTICAÇÃO E DADOS
    const { 
        userRole, 
        setUserRole, 
        isUserProfessional, 
        userId,
        logout // Função de logout obtida do contexto
    } = useAuth(); 

    // ESTADO DO FORMULÁRIO
    const [profileData, setProfileData] = useState({
        fullName: "Usuário Teste Vagali", email: "teste@vagali.com", phone: "(99) 99999-9999",
        profilePictureUrl: DEFAULT_AVATAR, 
        cep: "20000000", street: "Rua do Teste", number: "100", complement: "Apto 101", 
        neighborhood: "Centro", city: "Rio de Janeiro", state: "RJ", 
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState(null);

    // LÓGICA DE BUSCA DO CEP
    const fetchAddressByCep = useCallback(async (cep) => {
        const cleanedCep = cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) {
            setCepError(null);
            return;
        }
        setCepLoading(true);
        setCepError(null);
        try {
            const response = await axios.get(`${VIACEP_URL}${cleanedCep}/json/`);
            const data = response.data;
            if (data.erro) {
                setCepError("CEP não encontrado.");
                setProfileData(prev => ({ ...prev, street: '', neighborhood: '', city: '', state: '', }));
            } else {
                setProfileData(prev => ({
                    ...prev,
                    street: data.logradouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || '',
                }));
            }
        } catch (error) {
            setCepError("Erro ao buscar CEP. Tente novamente.");
        } finally {
            setCepLoading(false);
        }
    }, []);

    // HANDLERS DE INPUT
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value, }));

        if (name === 'cep') {
            if (value.replace(/\D/g, '').length === 8) {
                fetchAddressByCep(value);
            }
        }
    };
    
    // HANDLER: Upload de Foto
    const handlePictureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, profilePictureUrl: newUrl }));
            alert("Foto de perfil selecionada. Lembre-se de salvar o perfil!");
        }
    };

    // HANDLER DE SUBMISSÃO (Simulação)
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        setCepError(null); 
        
        setTimeout(() => {
            setIsSaving(false);
            console.log("Dados salvos:", profileData);
            alert("Perfil atualizado com sucesso!");
        }, 1500);
    };

    // FUNÇÃO DE LOGOUT
    const handleLogout = () => {
        if (typeof logout === 'function') {
            logout(); // Chama a função de logout do AuthContext
        } else {
            console.error("Função de logout não está disponível no AuthContext.");
        }
    };

    // FUNÇÕES DE CONTEXTO (TOGGLE ROLE)
    const toggleRole = () => {
        const newRole = userRole === 'Profissional' ? 'Cliente' : 'Profissional';
        if (typeof setUserRole !== 'function') {
            console.error("ERRO CRÍTICO: A função setUserRole não está disponível no contexto.");
            return; 
        }
        setUserRole(newRole); 
    };
    
    const nextRole = userRole === 'Profissional' ? 'Cliente' : 'Profissional';
    const currentRoleIcon = isUserProfessional ? <Briefcase size={20} className="me-2" /> : <User size={20} className="me-2" />;

    return (
        <Container className="my-5">
            <h1 className="mb-4 d-flex align-items-center" style={{ color: 'var(--primary-color)' }}>
                <Settings size={32} className="me-2" /> Gerenciamento de Perfil
            </h1>
            
            <Row>
                <Col md={8}>
                    
                    {/* CARD DE FOTO DE PERFIL */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="d-flex align-items-center">
                            <img 
                                src={profileData.profilePictureUrl} 
                                alt="Foto de Perfil"
                                className="rounded-circle me-4"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #007bff' }}
                            />
                            <div>
                                <h5 className="mb-1">{profileData.fullName}</h5>
                                <label htmlFor="profile-picture-upload" className="btn btn-outline-primary btn-sm mt-1">
                                    <Camera size={16} className="me-1" /> Alterar Foto
                                </label>
                                <input 
                                    type="file" id="profile-picture-upload" accept="image/*" 
                                    onChange={handlePictureUpload} style={{ display: 'none' }} 
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    {/* CARD DE INFORMAÇÕES BÁSICAS - COM COLAPSO */}
                    <Card className="shadow-sm mb-4">
                        {/* HEADER COM BOTÃO DE COLAPSO */}
                        <Card.Header 
                            className="fw-bold bg-light d-flex justify-content-between align-items-center" 
                            style={{ color: 'var(--dark-text)', cursor: 'pointer' }}
                            onClick={() => setIsInfoCollapsed(!isInfoCollapsed)}
                            aria-controls="info-collapse-body"
                            aria-expanded={!isInfoCollapsed}
                        >
                            Informações da Conta e Endereço
                            {isInfoCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </Card.Header>
                        
                        {/* CORPO DO CARD WRAPADO PELO COLLAPSE */}
                        <Collapse in={!isInfoCollapsed}>
                            <div id="info-collapse-body">
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        
                                        {/* DADOS PESSOAIS */}
                                        <h5 className="mb-3 text-muted">Dados Pessoais</h5>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Label>Nome Completo</Form.Label>
                                                <Form.Control type="text" name="fullName" value={profileData.fullName} onChange={handleChange} required />
                                            </Col>
                                            <Col md={6}>
                                                <Form.Label>Email</Form.Label>
                                                <div className="d-flex flex-column">
                                                    <Form.Control readOnly plaintext value={profileData.email} className="fw-bold" />
                                                    <small className="text-danger mt-1">
                                                        Este é seu login principal e não pode ser alterado.
                                                    </small>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Telefone</Form.Label>
                                            <Form.Control type="text" name="phone" value={profileData.phone} onChange={handleChange} />
                                        </Form.Group>

                                        {/* DADOS DE ENDEREÇO */}
                                        <hr />
                                        <h5 className="mb-3 text-muted d-flex align-items-center"><MapPin size={20} className="me-2"/> Endereço</h5>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Label>CEP</Form.Label>
                                                <Form.Control 
                                                    type="text" name="cep" value={profileData.cep} onChange={handleChange} maxLength={9} placeholder="Ex: 00000-000" required 
                                                />
                                            </Col>
                                            <Col md={8} className="d-flex align-items-end">
                                                {cepLoading && <Spinner animation="border" size="sm" className="me-2 text-primary" />}
                                                {cepError && <Alert variant="danger" className="py-1 px-2 small m-0">{cepError}</Alert>}
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col md={8}>
                                                <Form.Label>Rua/Avenida (Logradouro)</Form.Label>
                                                <Form.Control type="text" name="street" value={profileData.street} onChange={handleChange} disabled={cepLoading} required />
                                            </Col>
                                            <Col md={4}>
                                                <Form.Label>Bairro</Form.Label>
                                                <Form.Control type="text" name="neighborhood" value={profileData.neighborhood} onChange={handleChange} disabled={cepLoading} required />
                                            </Col>
                                        </Row>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Label>Cidade</Form.Label>
                                                <Form.Control type="text" name="city" value={profileData.city} onChange={handleChange} disabled={cepLoading} required />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Estado (UF)</Form.Label>
                                                <Form.Control type="text" name="state" value={profileData.state} onChange={handleChange} disabled={cepLoading} maxLength={2} required />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label>Número</Form.Label> {/* 🎯 CORREÇÃO: Certificando que a tag de fechamento é </Form.Label> na próxima linha */}
                                                <Form.Control type="text" name="number" value={profileData.number} onChange={handleChange} placeholder="Obrigatório" required />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label>Complemento (Opcional)</Form.Label>
                                                <Form.Control type="text" name="complement" value={profileData.complement} onChange={handleChange} placeholder="Apto/Bloco" />
                                            </Col>
                                        </Row>

                                        <Button variant="success" type="submit" disabled={isSaving || cepLoading}>
                                            {isSaving ? <Spinner animation="border" size="sm" /> : 'Salvar Alterações'}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </div>
                        </Collapse>
                    </Card>

                    {/* SEÇÃO DE DEMANDAS (SÓ PARA CLIENTES) */}
                    {!isUserProfessional && (
                        <MyDemandsSection />
                    )}

                    {/* CARD DE CONFIGURAÇÕES DE PROFISSIONAL (SÓ PARA PROFISSIONAIS) */}
                    {isUserProfessional && (
                        <Card className="shadow-sm mb-4 border-success">
                            <Card.Header className="fw-bold bg-success text-white">
                                Configurações de Profissional
                            </Card.Header>
                            <Card.Body>
                                <p>Gerencie suas especialidades, preços e disponibilidade.</p>
                                <Button as={Link} to={`/professional/${userId}`} variant="outline-success" className="me-2">
                                    Editar Portfólio
                                </Button>
                                <Button as={Link} to={`/professional/${userId}/schedule`} variant="outline-success">
                                    Gerenciar Agenda
                                </Button>
                            </Card.Body>
                        </Card>
                    )}
                    
                </Col>

                {/* COLUNA DE CONTROLES (DIREITA) */}
                <Col md={4}>
                    {/* CARD DE PAPEL ATUAL E CONTROLE DE TESTE */}
                    <Card className="shadow-lg mb-4 text-center">
                        <Card.Body>
                            <h5 className="mb-3">Seu Papel Atual:</h5>
                            <Alert variant={isUserProfessional ? "info" : "warning"} className="fw-bold d-flex justify-content-center align-items-center">
                                {currentRoleIcon} {userRole}
                            </Alert>
                            <p className="small text-muted">Use este controle para simular a mudança de papel do usuário.</p>
                            <Button variant="primary" className="w-100 mt-2 fw-bold d-flex justify-content-center align-items-center" onClick={toggleRole}>
                                <Repeat size={18} className="me-2" />
                                Mudar para: {nextRole}
                            </Button>
                        </Card.Body>
                    </Card>
                    
                    {/* CARD DE PROFISSIONAIS SEGUIDOS (SÓ PARA CLIENTES) */}
                    {!isUserProfessional && (
                        <Card className="shadow-sm mb-4 border-info">
                            <Card.Body className="d-grid gap-2">
                                <Button as={Link} to="/profissionais-seguidos" variant="outline-info" className="fw-bold">
                                    <Heart size={20} className="me-2" /> Profissionais Seguidos
                                </Button>
                            </Card.Body>
                        </Card>
                    )}

                    {/* NOVO: CARD DE MENSAGENS / CHAT */}
                    <Card className="shadow-lg mb-4 border-success">
                        <Card.Body className="d-grid gap-2">
                            <Button 
                                as={Link} 
                                to="/chat" 
                                variant="success" 
                                className="fw-bold"
                            >
                                <MessageSquare size={20} className="me-2" /> Minhas Mensagens
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* CARD DE SEGURANÇA */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>
                            Segurança
                        </Card.Header>
                        <Card.Body className="d-grid gap-2">
                            <Button as={Link} to="/change-password" variant="danger" className="w-100">
                                Mudar Senha
                            </Button>
                            {/* BOTÃO SAIR CORRIGIDO */}
                            <Button 
                                variant="outline-danger" 
                                className="w-100 d-flex justify-content-center align-items-center mt-2 fw-bold"
                                onClick={handleLogout} // Chama a função de logout
                            >
                                <LogOut size={20} className="me-2" /> Sair da Conta
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

        </Container>
    );
};

export default ProfileManagement;