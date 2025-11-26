import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse, Badge, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Briefcase, MapPin, ListChecks, FileText, Settings, LogOut, Phone, User, Share2,
    ChevronDown, ChevronUp, Star, CheckSquare, XCircle, Clock, Trash2, Camera
} from 'lucide-react';

// ====================================================================
// IMPORTAÇÕES
// ====================================================================
import { useAuth } from './AuthContext';
import MyDemandsSection from "./MyDemandsSection";

// ====================================================================
// CONSTANTES E URLS
// ====================================================================
const API_PROFESSIONAL_URL = '/api/v1/accounts/professional/me/';
const VIACEP_URL = 'https://viacep.com.br/ws/';
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/ffc107/000000?text=P'; // Avatar Padrão

// --- DADOS MOCKADOS/SIMULADOS PARA DEMONSTRAÇÃO ---
const MOCKED_PROFESSIONAL_DATA = {
    // Dados de Perfil
    full_name: "Novo Nome de Cadastro de Teste", // Nome civil/completo (padrão do cliente)
    fantasy_name: "Pedro Eletricista Silva", // NOVO: Nome que o profissional pode editar para exibição
    avatar_url: DEFAULT_AVATAR, // A chave foi renomeada para ser mais clara
    phone: "(11) 99876-5432", 
    // Dados de Portfólio (do seu PATCH/GET)
    description: "Especialista em reparos elétricos residenciais e comerciais. Rápido, limpo e com garantia. Atendo toda a zona sul.",
    service_area: "Eletricidade", 
    cep: "20000000",
    city: "Rio de Janeiro", 
    state: "RJ", 
    // Novos dados a serem integrados do backend:
    is_active: true, 
    rating: 4.85, 
    total_reviews: 45, 
    demands_completed: 67, 
    media_files: [ 
        { id: 1, type: 'image', url: 'https://via.placeholder.com/150/ffc107/000000?text=FOTO+1' },
        { id: 2, type: 'video', url: 'https://via.placeholder.com/150/dc3545/ffffff?text=VIDEO+2' },
        { id: 3, type: 'image', url: 'https://via.placeholder.com/150/007bff/ffffff?text=FOTO+3' },
    ]
};

// ====================================================================
// NOVO COMPONENTE: HEADER DO PROFISSIONAL
// ====================================================================
const ProfessionalHeader = ({ professionalData }) => {
    // *** ALTERAÇÃO: Prioriza o Nome Fantasia, senão usa o nome completo ***
    const displayName = professionalData.fantasy_name || professionalData.full_name;
    const displayAvatar = professionalData.avatar_url; // Usa a nova chave

    const handleShare = () => {
        // *** ALTERAÇÃO: Mock de URL de compartilhamento mais realista ***
        alert(`Compartilhando perfil público de ${displayName}. URL: /profissionais/${displayName.toLowerCase().replace(/\s/g, '-')}`);
    };

    const displayRating = (rating) => {
        // Exibe estrelas preenchidas com base no rating
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return (
            <>
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={16} fill="gold" stroke="gold" className="me-1" />)}
                {hasHalfStar && <Star key="half" size={16} fill="gold" stroke="gold" className="me-1" style={{ clipPath: 'inset(0 50% 0 0)' }} />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={16} className="me-1 text-secondary" />)}
            </>
        );
    };

    return (
        <Card className="bg-vagali-dark-card p-4 shadow mb-4">
            <Row className="align-items-center">
                <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                    <img
                        src={displayAvatar} // *** ALTERADO: Usando avatar_url ***
                        alt={displayName}
                        className="rounded-circle border border-warning border-3"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                </Col>
                <Col xs={12} md={6} className="text-center text-md-start mb-3 mb-md-0">
                    <h3 className="text-white fw-bold mb-1">{displayName}</h3> {/* *** ALTERADO: Usando displayName (fantasia/nome) *** */}
                    <h5 className="text-warning mb-2 d-flex align-items-center justify-content-center justify-content-md-start">
                        <Briefcase size={20} className="me-2" /> {professionalData.service_area}
                    </h5>
                    <p className="small text-white-50 mb-0 d-flex align-items-center justify-content-center justify-content-md-start">
                        <MapPin size={16} className="me-2" /> {professionalData.city} - {professionalData.state}
                    </p>
                </Col>
                <Col xs={12} md={3} className="text-center text-md-end d-grid gap-2">
                    <div className="d-flex flex-column align-items-center align-items-md-end">
                        <div className="d-flex align-items-center mb-2">
                            {displayRating(professionalData.rating)}
                            <span className="fw-bold text-white ms-2">{professionalData.rating.toFixed(2)}</span>
                        </div>
                        <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center"
                            onClick={handleShare}
                        >
                            <Share2 size={16} className="me-1" /> Compartilhar Perfil
                        </Button>
                        <small className="text-white-50">({professionalData.total_reviews} avaliações)</small>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

// ====================================================================
// COMPONENTE EXTRAÍDO: PORTFÓLIO DE MÍDIAS
// ====================================================================
const PortfolioMediaSection = ({ professionalData, handleMediaDelete, setSuccess }) => (
    <Card className="bg-vagali-dark-card p-4 shadow mb-4">
        <Card.Title className="border-bottom border-warning pb-2 mb-3 d-flex justify-content-between align-items-center text-white">
            Portfólio de Mídias e Projetos <Camera size={20} className="ms-2" />
        </Card.Title>
        
        <Button variant="warning" className="w-100 mb-3 fw-bold d-flex justify-content-center align-items-center">
            <Camera size={18} className="me-2" /> Adicionar Foto ou Vídeo
        </Button>

        <Row xs={1} md={2} className="g-3">
            {professionalData.media_files.map(media => (
                <Col key={media.id}>
                    <div className="position-relative">
                        <img 
                            src={media.url} 
                            alt={`Mídia ${media.id}`} 
                            className="img-fluid rounded" 
                            style={{ height: '100px', width: '100%', objectFit: 'cover' }} 
                        />
                        <Button 
                            variant="danger" 
                            size="sm" 
                            className="position-absolute top-0 end-0 m-1 rounded-circle p-1"
                            onClick={() => handleMediaDelete(media.id)}
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                    <p className="small text-white-50 mt-1 mb-0 text-center">
                        {media.type === 'image' ? 'Foto' : 'Vídeo'}
                    </p>
                </Col>
            ))}
            {professionalData.media_files.length === 0 && (
                <Col xs={12}><Alert variant="info" className="text-center text-dark">Adicione fotos ou vídeos dos seus melhores trabalhos!</Alert></Col>
            )}
        </Row>
    </Card>
);

// ====================================================================
// COMPONENTE EXTRAÍDO: FEEDBACKS (Mock Simples)
// ====================================================================
const FeedbacksSection = ({ total_reviews, rating }) => (
    <Card className="bg-vagali-dark-card p-4 shadow mb-4">
        <Card.Title className="border-bottom border-warning pb-2 mb-3 text-white">
            Feedbacks Recebidos ({total_reviews || 0}) <Star size={20} className="ms-2" />
        </Card.Title>
        
        <Alert variant="info" className='text-dark'>
            Aqui você poderá responder e gerenciar as avaliações que recebe de seus clientes.
        </Alert>

        {/* Mock de um Feedback */}
        <Card className="mb-2 bg-dark text-white border-warning">
            <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-bold">Cliente Silva</div>
                    <Badge bg="warning" className="text-dark">5 Estrelas</Badge>
                </div>
                <p className="small text-white-50 mt-1 mb-0">"O serviço de elétrica foi rápido e profissional. Recomendo!"</p>
            </Card.Body>
        </Card>
    </Card>
);


// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================
const ProfessionalProfileView = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, token, logout } = useAuth(); 

    // *** ALTERAÇÃO: Inicializa o full_name com o nome do usuário autenticado ***
    const initialProfessionalData = {
        ...MOCKED_PROFESSIONAL_DATA,
        // Garante que o nome padrão seja o do usuário, se disponível
        full_name: user?.full_name || MOCKED_PROFESSIONAL_DATA.full_name,
    };
    const [professionalData, setProfessionalData] = useState(initialProfessionalData);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Estados de UI
    const [openDetails, setOpenDetails] = useState(true);
    const [activeStatus, setActiveStatus] = useState(MOCKED_PROFESSIONAL_DATA.is_active);

    // ... [FUNÇÕES DE AÇÃO] ...

    const handleToggleActiveStatus = () => {
        const newStatus = !activeStatus;
        console.log(`[AÇÃO] Chamada de API para mudar o status para: ${newStatus}`);
        setActiveStatus(newStatus);
        setSuccess(`Status alterado para ${newStatus ? 'Ativo' : 'Inativo'} com sucesso.`);
    };

    const handleMediaDelete = (mediaId) => {
        console.log(`[AÇÃO] Chamada de API para deletar mídia ID: ${mediaId}`);
        setProfessionalData(prev => ({
            ...prev,
            media_files: prev.media_files.filter(m => m.id !== mediaId)
        }));
        setSuccess('Mídia removida com sucesso!');
    };
    
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setProfessionalData(prevData => ({ ...prevData, [name]: value }));
    }, []);
    
    // *** NOVA FUNÇÃO: Troca de Avatar ***
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Simulação: Cria uma URL temporária para visualização
            const newAvatarUrl = URL.createObjectURL(file);
            console.log(`[AÇÃO] Chamada de API para upload de novo avatar: ${file.name}`);
            
            // Atualiza o estado com a nova URL
            setProfessionalData(prev => ({
                ...prev,
                avatar_url: newAvatarUrl
            }));
            setSuccess('Foto de perfil carregada com sucesso! Clique em "Salvar Detalhes Profissionais" para finalizar.');
            
            // Limpa o input para permitir o upload da mesma imagem novamente
            e.target.value = null; 
        }
    };
    
    const handleCepChange = (e) => {
        const cepValue = e.target.value.replace(/\D/g, ''); 
        setProfessionalData(prevData => ({ ...prevData, cep: cepValue }));
        if (cepValue.length === 8) {
            // Simula a busca real do ViaCEP
            setProfessionalData(prevData => ({ ...prevData, city: 'São Paulo', state: 'SP' })); 
        } else {
            setProfessionalData(prevData => ({ ...prevData, city: '', state: '' })); 
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(null);
        setError(null);
        try {
            // 🚨 Simulação de chamada PATCH para API_PROFESSIONAL_URL
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setSuccess('Portfólio atualizado com sucesso! 🎉');
        } catch (err) {
            setError('Erro ao salvar as alterações. Verifique os dados.');
        } finally {
            setLoading(false);
        }
    };


    // ====================================================================
    // RENDERIZAÇÃO
    // ====================================================================

    if (!isAuthenticated || !user?.is_professional) {
        return (
            <Container className="text-center py-5">
                <Alert variant="danger" className='text-dark'>Você precisa ser um profissional para acessar esta página. <Link to="/meu-perfil">Mude seu papel aqui.</Link></Alert>
            </Container>
        );
    }

    // Calculo da Porcentagem de Satisfação (4.85/5 * 100 = 97%)
    const satisfactionPercentage = ((professionalData?.rating || 0) / 5) * 100;
    
    return (
        <Container className="my-5">
            {/* NOVO: SEÇÃO DE BOAS-VINDAS */}
            <div className='mb-3'>
                <h1 className="text-white">Olá, {user?.full_name || user?.email || 'Profissional'}! 👋</h1>
            </div>

            <h2 className="text-white mb-4"><Briefcase size={30} className="me-2 text-warning" /> Painel Profissional</h2>

            {success && <Alert variant="success" className='text-dark'>{success}</Alert>}
            {error && <Alert variant="danger" className='text-dark'>{error}</Alert>}

            {/* BLOCO SUPERIOR (HEADER) */}
            <ProfessionalHeader professionalData={professionalData} />
            
            <Row>
                {/* COLUNA ESQUERDA: md={7} (MAIOR: Mídias, Status e Feedbacks) */}
                <Col md={7} className="mb-4">
                    
                    {/* CARD: STATUS E DESEMPENHO */}
                    <Card className="bg-vagali-dark-card p-3 shadow-sm mb-4">
                        <h5 className="mb-3 text-white">Status e Desempenho</h5>

                        {/* STATUS ATIVO/INATIVO */}
                        <div className={`p-2 rounded text-center mb-3 fw-bold ${activeStatus ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                            {activeStatus ? (<><CheckSquare size={16} className="me-2" /> ATIVO (Recebendo Demandas)</>) : (<><XCircle size={16} className="me-2" /> INATIVO</>)}
                        </div>
                        <Button 
                            variant={activeStatus ? "outline-danger" : "outline-success"} 
                            className="w-100 mb-3 fw-bold"
                            onClick={handleToggleActiveStatus}
                        >
                            {activeStatus ? 'Pausar Atendimento' : 'Ficar Ativo'}
                        </Button>
                        
                        {/* *** NOVO: BOTÃO PARA MUDAR O AVATAR (Foto de Perfil) *** */}
                        <div className="text-center border-top border-secondary pt-3 mt-3">
                            <h6 className="text-white-50 mb-2">Mudar Foto de Perfil</h6>
                            <input 
                                type="file" 
                                id="avatarUpload" 
                                className="d-none" 
                                accept="image/*" 
                                onChange={handleAvatarChange} 
                            />
                            <Button
                                variant="outline-info"
                                onClick={() => document.getElementById('avatarUpload').click()}
                                className="w-100 fw-bold d-flex justify-content-center align-items-center mb-4"
                            >
                                <Camera size={18} className="me-2" /> Alterar Avatar
                            </Button>
                        </div>

                        <div className="border-top border-secondary pt-3 mt-3">
                            <div className="mb-2 d-flex justify-content-between align-items-center">
                                <span className='small text-white-50'>Satisfação (Baseado em {professionalData.total_reviews} avaliações)</span>
                                <Badge bg="warning" className="text-dark fs-6">{professionalData.rating} <Star size={14} /></Badge>
                            </div>
                            <ProgressBar variant="warning" now={satisfactionPercentage} label={`${satisfactionPercentage.toFixed(1)}%`} className="mb-3" />
                            
                            <div className="d-flex justify-content-between align-items-center">
                                <span className='small text-white-50'>Demandas Concluídas</span>
                                <Badge bg="primary">{professionalData.demands_completed}</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* SEÇÃO 2: PORTFÓLIO DE MÍDIAS */}
                    <PortfolioMediaSection 
                        professionalData={professionalData} 
                        handleMediaDelete={handleMediaDelete} 
                        setSuccess={setSuccess} 
                    />

                    {/* SEÇÃO 3: FEEDBACKS */}
                    <FeedbacksSection 
                        total_reviews={professionalData.total_reviews} 
                        rating={professionalData.rating} 
                    />

                </Col>

                {/* COLUNA DIREITA: md={5} (MENOR: Gerenciamento, Formulário e Demandas) */}
                <Col md={5}>
                    
                    {/* CARD: AÇÕES DE GERENCIAMENTO */}
                    <Card className="bg-vagali-dark-card p-3 shadow-sm mb-4">
                        <h5 className="mb-3 text-white">Ações de Gerenciamento Rápido</h5>
                        <Row xs={1} md={3} className="g-2">
                            <Col>
                                <Button as={Link} to="/meu-perfil" variant="outline-warning" className="w-100 fw-bold d-flex justify-content-center align-items-center">
                                    <User size={20} className="me-2" /> Conta Geral
                                </Button>
                            </Col>
                            <Col>
                                <Button as={Link} to="/agendamento/gerenciar" variant="outline-warning" className="w-100 fw-bold d-flex justify-content-center align-items-center">
                                    <Clock size={20} className="me-2" /> Agenda
                                </Button>
                            </Col>
                            <Col>
                                <Button as={Link} to="/chat" variant="outline-warning" className="w-100 fw-bold d-flex justify-content-center align-items-center">
                                    <Phone size={20} className="me-2" /> Mensagens
                                </Button>
                            </Col>
                        </Row>
                        <Button 
                            variant="outline-danger" 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center mt-3"
                            onClick={logout}
                        >
                            <LogOut size={20} className="me-2" /> Sair da Conta
                        </Button>
                    </Card>

                    {/* SEÇÃO 1: SOBRE O PROFISSIONAL (FORMULÁRIO DE EDIÇÃO) */}
                    <Card className="bg-vagali-dark-card p-4 shadow mb-4">
                        <Card.Title className="border-bottom border-warning pb-2 mb-3 d-flex justify-content-between align-items-center text-white">
                            Editar Detalhes do Portfólio <FileText size={20} className="ms-2" />
                            <Button variant="link" onClick={() => setOpenDetails(!openDetails)} size="sm" className="text-warning p-0">
                                {openDetails ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </Button>
                        </Card.Title>

                        <Collapse in={openDetails}>
                            <div>
                                <Form onSubmit={handleSubmit}>
                                    
                                    {/* *** NOVO CAMPO: NOME FANTASIA (EXIBIÇÃO) *** */}
                                    <Form.Group controlId="formFantasyName" className="mb-3">
                                        <Form.Label className="text-white-50 d-flex align-items-center"><User size={16} className="me-2" /> Nome de Exibição (Fantasia)</Form.Label>
                                        <Form.Control
                                            type="text" name="fantasy_name" className="form-control-dark"
                                            value={professionalData?.fantasy_name || ''} onChange={handleChange}
                                            placeholder={`Ex: ${professionalData.service_area} - ${professionalData.full_name}`}
                                        />
                                        <Form.Text className="text-white-50">
                                            Nome que aparecerá no seu perfil público. Se vazio, será exibido: **{professionalData.full_name}**.
                                        </Form.Text>
                                    </Form.Group>
                                    {/* FIM: NOVO CAMPO */}

                                    {/* Campo de Área de Serviço */}
                                    <Form.Group controlId="formServiceArea" className="mb-3">
                                        <Form.Label className="text-white-50 d-flex align-items-center"><Briefcase size={16} className="me-2" /> Área de Serviço Principal</Form.Label>
                                        <Form.Control
                                            type="text" name="service_area" className="form-control-dark" required
                                            value={professionalData?.service_area || ''} onChange={handleChange}
                                            placeholder="Ex: Eletricista Residencial, Pintor, Web Developer"
                                        />
                                    </Form.Group>

                                    {/* Campo de CEP (com busca ViaCEP) */}
                                    <Form.Group controlId="formCep" className="mb-3">
                                        <Form.Label className="text-white-50 d-flex align-items-center"><MapPin size={16} className="me-2" /> CEP (Para Localização de Serviço)</Form.Label>
                                        <Form.Control
                                            type="text" name="cep" className="form-control-dark" required maxLength={8}
                                            value={professionalData?.cep || ''} onChange={handleCepChange} 
                                            placeholder="Apenas números, Ex: 12345678"
                                        />
                                        {(professionalData?.city || professionalData?.state) && (
                                            <Form.Text className="text-success fw-bold">
                                                Localização detectada: {professionalData.city || 'N/A'} - {professionalData.state || 'N/A'}
                                            </Form.Text>
                                        )}
                                    </Form.Group>
                                    
                                    {/* Campo de Descrição Profissional (Bio) */}
                                    <Form.Group controlId="formDescription" className="mb-3">
                                        <Form.Label className="text-white-50 d-flex align-items-center"><FileText size={16} className="me-2" /> Descrição do Portfólio (Bio)</Form.Label>
                                        <Form.Control
                                            as="textarea" rows={5} name="description" className="form-control-dark" required
                                            value={professionalData?.description || ''} onChange={handleChange}
                                            placeholder="Fale sobre seus serviços, experiência, especializações e diferenciais."
                                        />
                                    </Form.Group>

                                    <Button 
                                        type="submit" variant="warning" className="w-100 fw-bold mt-3 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Salvar Detalhes Profissionais'}
                                    </Button>
                                </Form>
                            </div>
                        </Collapse>
                    </Card>

                    {/* Componente de Demandas */}
                    <MyDemandsSection title="Demandas Ativas (Profissional)" isProfessionalView={true} />
                    
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalProfileView;