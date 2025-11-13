import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap'; 
import { Star, CalendarCheck, Share2, MessageSquare, MapPin, Zap, AlertTriangle, Pencil, Camera, Trash2, Edit } from 'lucide-react';
import { useAuth } from './AuthContext'; 

// Endpoint para buscar/atualizar o perfil do profissional
const BASE_PROFILE_URL = 'http://127.00.0.1:8000/api/v1/accounts/profissionais/';
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/007bff/ffffff?text=NP';

// --- SIMULAÇÃO DE DADOS INICIAIS ---
const initialPortfolioMedia = [
    { id: 1, label: 'Cozinha', url: 'https://via.placeholder.com/400/ffb564/000000?text=Projeto+1' },
    { id: 2, label: 'Banheiro', url: 'https://via.placeholder.com/400/8d8a86/ffffff?text=Projeto+2' },
    { id: 3, label: 'Sala', url: 'https://via.placeholder.com/400/98df98/000000?text=Projeto+3' },
    // ... mais itens
];

const initialDemands = {
    active: [
        { id: 1, title: "Instalação de Luminárias", status: "Em Andamento" },
        { id: 2, title: "Reparo de Vazamento", status: "Aguardando Resposta" },
    ],
    completed: [
        { id: 3, title: "Pintura de Sala", status: "Concluída" },
    ]
};


const ProfessionalProfileView = () => {
    
    // 1. OBTENDO DADOS DO CONTEXTO E URL
    const { id } = useParams(); // ID do perfil na URL (string)
    const navigate = useNavigate();
    const { userId, isAuthenticated, token, user } = useAuth(); // userId é o ID do usuário logado
    
    // 🚨 CÁLCULO CRÍTICO: ID do logado (e.g., 2) vs ID na URL (e.g., 2 ou 3)
    const isOwner = isAuthenticated && (String(userId) === String(id)); 

    // ESTADOS
    const [profileData, setProfileData] = useState({ 
        full_name: 'TESTE PROFISSIONAL',
        main_service: 'Serviço Principal', 
        city: 'Cidade não Informada',
        state: 'Estado',
        rating: 4.8, 
        reviews_count: 5, 
        satisfaction: 96,
        demands_count: 42,
        status: 'Ativo',
        bio: 'Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos.',
        cnpj: 'CNPJ: Não Informado',
        specialties: [], 
        profilePictureUrl: DEFAULT_AVATAR,
    });
    const [portfolioMedia, setPortfolioMedia] = useState(initialPortfolioMedia);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [demandsStatus, setDemandsStatus] = useState('active'); 

    // LÓGICA DE CARREGAMENTO DE DADOS (GET)
    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await axios.get(`${BASE_PROFILE_URL}${id}/`, {
                headers: isAuthenticated && token ? { 'Authorization': `Token ${token}` } : {}
            });

            const apiData = response.data;
            setProfileData({
                full_name: apiData.user.full_name || 'Nome do Profissional',
                main_service: apiData.main_service || 'Serviço Principal', 
                city: apiData.city || 'Cidade não Informada',
                state: apiData.state || 'Estado',
                rating: apiData.rating || 0, 
                reviews_count: apiData.reviews_count || 0, 
                satisfaction: apiData.satisfaction || 0,
                demands_count: apiData.demands_count || 0,
                status: apiData.status || 'Ativo',
                bio: apiData.bio || 'Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos.',
                cnpj: apiData.cnpj || 'CNPJ: Não Informado',
                specialties: apiData.specialties || [],
                profilePictureUrl: apiData.profile_picture_url || DEFAULT_AVATAR,
            });
            setPortfolioMedia(apiData.portfolio_media || initialPortfolioMedia);
            
        } catch (error) {
             if (error.response && error.response.status === 404) {
                 setApiError("Perfil de profissional não encontrado.");
            } else {
                 setApiError("Erro ao carregar dados do perfil.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [id, isAuthenticated, token]); 
    
    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id, fetchProfile]); 
    
    // Handlers de Edição (Omitido para brevidade)
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = async (e) => {
        e.preventDefault();
        // Lógica de salvamento
        setIsEditMode(false); 
    };

    // ----------------------------------------------------
    // RENDERIZAÇÃO
    // ----------------------------------------------------
    if (isLoading) { /* ... */ return <Container className="my-5 text-center"><Spinner animation="border" role="status" className="text-primary"/><p className="mt-2">Carregando perfil profissional...</p></Container>;}
    
    return (
        <Container className="my-5">
            {/* 🚨 DEBUG BAR CRÍTICO 🚨 */}
            <Alert variant={isOwner ? "success" : "info"} className="p-1 mb-2 small d-flex justify-content-between">
                <span>
                    **MODO: {isOwner ? 'PROPRIETÁRIO' : 'CLIENTE/VISITANTE'}** | Logado: **{user?.full_name || 'Visitante'}**
                    | Auth ID: **{userId || 'NÃO AUTENTICADO'}**
                    | URL ID: **{id}**
                    | isOwner: **{String(isOwner).toUpperCase()}**
                </span>
                {apiError && <span className="text-danger">API Falhou: {apiError}</span>}
            </Alert>
            
            <Row>
                {/* COLUNA ESQUERDA: PERFIL E CONTEÚDO */}
                <Col md={8}>
                    {/* CARD SUPERIOR: FOTO, NOME, SERVIÇO, LOCALIZAÇÃO */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="d-flex align-items-center justify-content-between p-4">
                            <div className="d-flex align-items-center">
                                {/* Simulação de Avatar com inicial */}
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-4" 
                                     style={{ width: '80px', height: '80px', fontSize: '2.5rem', fontWeight: 'bold' }}>
                                    {profileData.full_name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="mb-1 fw-bold">{profileData.full_name}</h4>
                                    <p className="text-muted mb-1">{profileData.main_service}</p>
                                    <p className="text-muted mb-0 d-flex align-items-center">
                                        <MapPin size={16} className="me-1" /> {profileData.city}, {profileData.state}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="text-end">
                                {/* 🚨 DIFERENCIAL 1: BOTÃO EDITAR PERFIL (SÓ PARA O DONO) */}
                                {isOwner && (
                                    <Button 
                                        variant="primary" 
                                        size="sm" 
                                        className="mb-2 d-flex align-items-center fw-bold"
                                        onClick={() => setIsEditMode(prev => !prev)}
                                    >
                                        <Pencil size={16} className="me-1" /> {isEditMode ? 'SAIR DO MODO EDIÇÃO' : 'EDITAR PERFIL'}
                                    </Button>
                                )}
                                <div className="d-flex align-items-center justify-content-end">
                                    <Star size={16} fill="#ffc107" color="#ffc107" className="me-1"/> 
                                    <span className="ms-1 fw-bold">({profileData.rating.toFixed(1)}/5)</span>
                                </div>
                                <Button variant="light" size="sm" className="mt-1"><Share2 size={16} className="me-1"/> Compartilhar</Button>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* CARD DE DADOS DE SATISFAÇÃO E DEMANDAS */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="d-flex justify-content-around text-center">
                            <Col><h4 className="fw-bold text-primary">{profileData.satisfaction}%</h4><p className="text-muted small">Satisfação</p></Col>
                            <Col className="border-start border-end"><h4 className="fw-bold">{profileData.demands_count}</h4><p className="text-muted small">Demandas</p></Col>
                            <Col><h4 className="fw-bold text-success">{profileData.status}</h4><p className="text-muted small">Status</p></Col>
                        </Card.Body>
                    </Card>

                    {/* CARD SOBRE O PROFISSIONAL (Modo Edição visível se isOwner for TRUE) */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>Sobre o Profissional</Card.Header>
                        <Card.Body>
                            {isEditMode ? (<Form.Group className="mb-3"><Form.Label>Descrição/Bio</Form.Label><Form.Control as="textarea" name="bio" value={profileData.bio} onChange={handleEditChange} rows={4} /></Form.Group>) : (<p className="text-muted">{profileData.bio}</p>)}
                            {isEditMode ? (<Form.Group className="mb-3"><Form.Label>CNPJ (Opcional)</Form.Label><Form.Control type="text" name="cnpj" value={profileData.cnpj} onChange={handleEditChange} /></Form.Group>) : (<p className="text-muted">CNPJ: {profileData.cnpj}</p>)}
                        </Card.Body>
                    </Card>

                    {/* CARD PORTFÓLIO & MÍDIA (Botões de Edição visíveis se isOwner for TRUE) */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>Portfólio & Mídia</Card.Header>
                        <Card.Body>
                            <Row>
                                {portfolioMedia.map((media) => (
                                    <Col md={4} className="mb-3" key={media.id}>
                                        <div className="position-relative">
                                            <img src={media.url} alt={media.label} className="img-fluid rounded" style={{ height: '120px', width: '100%', objectFit: 'cover' }} />
                                            {isEditMode && <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1"><Trash2 size={14} /></Button>}
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* CARD FEEDBACKS */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>Feedbacks ({profileData.reviews_count})</Card.Header>
                        <Card.Body><p className="text-muted">Aqui serão exibidos os comentários dos clientes.</p></Card.Body>
                    </Card>

                    {/* BOTÃO DE SALVAR PRINCIPAL */}
                    {isEditMode && isOwner && (
                        <div className="text-center mt-4">
                            <Button variant="success" size="lg" onClick={handleSave} disabled={isSaving} className="fw-bold">SALVAR ALTERAÇÕES</Button>
                        </div>
                    )}

                </Col>

                {/* COLUNA DIREITA: OPÇÕES RÁPIDAS E MINHAS DEMANDAS */}
                <Col md={4}>
                    {/* CARD DE OPÇÕES RÁPIDAS */}
                    <Card className="shadow-lg mb-4 text-center">
                        <Card.Header className="fw-bold bg-dark text-white">Opções Rápidas</Card.Header>
                        <Card.Body className="d-grid gap-2">
                            {isOwner ? (
                                // 🚨 DIFERENCIAL 2: BOTÕES DO MODO PROPRIETÁRIO
                                <>
                                    <Button as={Link} to={`/meu-perfil`} variant="dark" className="fw-bold d-flex align-items-center justify-content-center" style={{ backgroundColor: '#495057', borderColor: '#495057' }}>
                                        <Edit size={16} className="me-2" /> GERENCIAR MEUS DADOS
                                    </Button>
                                    <Button as={Link} to={`/professional/${userId}/schedule`} variant="secondary" className="fw-bold d-flex align-items-center justify-content-center" style={{ backgroundColor: '#a52a2a', borderColor: '#a52a2a' }}>
                                        <CalendarCheck size={16} className="me-2" /> CONSULTAR AGENDA
                                    </Button>
                                    <Button variant="outline-warning" className="fw-bold d-flex align-items-center justify-content-center">
                                        <MessageSquare size={16} className="me-2" /> ENVIAR MENSAGEM
                                    </Button>
                                </>
                            ) : isAuthenticated ? (
                                // 🚨 DIFERENCIAL 3: BOTÕES DO MODO CLIENTE (João)
                                <>
                                    <Button variant="success" className="fw-bold d-flex align-items-center justify-content-center">
                                        <Zap size={16} className="me-2" /> SOLICITAR SERVIÇO
                                    </Button>
                                    <Button as={Link} to={`/mensagens/novo/${id}`} variant="warning" className="fw-bold d-flex align-items-center justify-content-center">
                                        <MessageSquare size={16} className="me-2" /> ENVIAR MENSAGEM
                                    </Button>
                                    <Button variant="link" className="small text-danger mt-2 d-flex align-items-center justify-content-center">
                                        <AlertTriangle size={14} className="me-1" /> DENUNCIAR CONTA
                                    </Button>
                                </>
                            ) : (
                                // MODO VISITANTE
                                <Alert variant="light" className="m-0">Faça login para contratar este profissional.</Alert>
                            )}
                        </Card.Body>
                    </Card>

                    {/* 🚨 DIFERENCIAL 4: CARD MINHAS DEMANDAS (SÓ PARA O DONO) */}
                    {isOwner && (
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>Minhas Demandas</Card.Header>
                            <Card.Body>
                                {/* ... (Conteúdo de Demandas) ... */}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            <footer className="text-center mt-5 text-muted"><p>© 2025 VagALI. Todos os direitos reservados.</p></footer>
        </Container>
    );
};

export default ProfessionalProfileView;