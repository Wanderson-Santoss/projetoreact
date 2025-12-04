import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
    Briefcase, Share2, Star, CheckSquare, XCircle, Clock, Camera, Trash2, User, Edit, MessageSquare // ADICIONADO: MessageSquare
} from 'lucide-react';

import ChangePassword from './ChangePassword'; 

// ====================================================================\
// IMPORTAÇÕES E DADOS MOCKADOS (AJUSTADOS PARA INCLUIR O BANNER)
// ====================================================================\
import { useAuth } from './AuthContext';
import MyDemandsSection from "./MyDemandsSection"; 

// URLs dos Endpoints (AJUSTE SE NECESSÁRIO)
const API_PROFILE_ME_URL = '/api/v1/accounts/perfil/me/'; 
const API_PORTFOLIO_URL = '/api/v1/accounts/portfolio/'; 
const API_UPLOAD_URL = '/api/v1/accounts/upload-midia/'; // Endpoint unificado para Avatar/Banner

const DEFAULT_AVATAR = 'https://via.placeholder.com/150/ffc107/000000?text=P';

const MOCKED_PROFESSIONAL_DATA = {
    // Dados do Usuário e Perfil
    email: "pedro.eletricista@vagali.com",
    is_professional: true,
    full_name: "Pedro Eletricista Silva",
    phone: "(11) 99876-5432", 
    description: "Especialista em reparos elétricos residenciais e comerciais. Rápido, limpo e com garantia. Atendo toda a zona sul e centro do Rio de Janeiro.",
    service_area: "Eletricidade Residencial", 
    cep: "20000-000",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    is_active: true,
    rating: 4.8,
    total_reviews: 50, // Adicionado para display
    
    // NOVO: URLs para Imagens de Perfil e Banner
    avatar_url: DEFAULT_AVATAR,
    banner_url: 'https://via.placeholder.com/1200x300/8c8c8c/ffffff?text=Banner+do+Portfólio', // URL de mock para o banner
    
    // Dados de Portfólio
    portfolio_images: [
        { id: 1, image_url: "https://via.placeholder.com/400x300/3498db/ffffff?text=Instala%C3%A7%C3%A3o+1", caption: "Instalação de painel novo no Leblon." },
        { id: 2, image_url: "https://via.placeholder.com/400x300/2ecc71/ffffff?text=Reparo+R%C3%A1pido", caption: "Reparo de emergência em restaurante." },
    ],
};

// ====================================================================\
// COMPONENTE PRINCIPAL
// ====================================================================\

const ProfessionalProfileView = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(MOCKED_PROFESSIONAL_DATA);
    const [portfolio, setPortfolio] = useState(MOCKED_PROFESSIONAL_DATA.portfolio_images || []);
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    // --- LÓGICA DE MOCK DE API ---

    const fetchProfileData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Simula o fetch completo de dados do perfil e portfólio
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setProfileData(MOCKED_PROFESSIONAL_DATA);
            setPortfolio(MOCKED_PROFESSIONAL_DATA.portfolio_images); 
        } catch (err) {
            setError("Falha ao carregar dados do perfil.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    // 1. Handler para Mudança de Campos
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
    };

    // 2. Handler para Upload de Imagens de Mídia (Avatar ou Banner)
    const handleMediaUpload = async (file, fieldName) => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', fieldName); // 'avatar' ou 'banner'

        try {
            // AQUI VOCÊ FARIA O AXIOS.POST para API_UPLOAD_URL
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simula a URL retornada pela API
            const newUrl = URL.createObjectURL(file); 
            
            setProfileData(prev => ({ 
                ...prev, 
                [`${fieldName}_url`]: newUrl 
            }));
            
            setSuccessMessage(`${fieldName === 'avatar' ? 'Foto de Perfil' : 'Banner'} atualizado com sucesso! Lembre-se de salvar o perfil.`);
            
        } catch (err) {
            setError("Falha no upload da imagem. Verifique o formato e tamanho.");
        } finally {
            setLoading(false);
        }
    };
    
    // 3. Handler para Salvar Alterações (Perfil e Dados)
    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);
        setError(null);

        // Prepara o payload para o ProfileViewSet.me (PATCH)
        const payload = {
            // Campos do modelo User (ex: email, full_name, etc.)
            full_name: profileData.full_name,
            
            // Campos do modelo Profile (aninhados)
            profile: {
                // A API precisará receber a URL atualizada do avatar/banner ou lidar com o upload separadamente
                // Se o upload de mídia for separado (como acima), aqui só vão os dados de texto:
                phone_number: profileData.phone, // Assumindo phone_number no Profile
                descricao_servicos: profileData.description, // Assumindo descricao_servicos no Profile
                servico_principal: profileData.service_area, 
                cep: profileData.cep,
                cidade: profileData.cidade,
                estado: profileData.estado,
                // ... outros campos do Profile que foram alterados
            }
        };

        try {
            // AQUI VOCÊ FARIA O AXIOS.PATCH para API_PROFILE_ME_URL com o payload
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccessMessage("Perfil e informações de serviço salvos com sucesso!");
            setIsEditing(false); // Sai do modo de edição
            
        } catch (err) {
            setError("Erro ao salvar o perfil. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    // 4. Handler para Upload de Imagem de Portfólio (Mock)
    const handlePortfolioImageUpload = async (file) => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('caption', `Nova foto - ${new Date().toLocaleDateString()}`); 

        try {
            // AQUI VOCÊ FARIA O AXIOS.POST para API_PORTFOLIO_URL
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newImage = { 
                id: Date.now(), 
                image_url: URL.createObjectURL(file),
                caption: formData.get('caption')
            };
            setPortfolio(prev => [...prev, newImage]);
            
            setSuccessMessage("Foto de portfólio carregada com sucesso!");
            
        } catch (err) {
            setError("Falha no upload da imagem.");
        } finally {
            setLoading(false);
        }
    };

    // 5. Handler para Exclusão de Imagem de Portfólio (Mock)
    const handleImageDelete = async (imageId) => {
        if (!window.confirm("Tem certeza que deseja excluir esta imagem do portfólio?")) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // AQUI VOCÊ FARIA O AXIOS.DELETE para /api/v1/accounts/portfolio/{imageId}/
            await new Promise(resolve => setTimeout(resolve, 700));

            setPortfolio(prev => prev.filter(item => item.id !== imageId));

            setSuccessMessage("Imagem do portfólio removida.");

        } catch (err) {
            setError("Erro ao remover a imagem.");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERIZAÇÃO ---
    
    const isProfileComplete = profileData.full_name && profileData.description && profileData.service_area;
    const completionPercentage = Math.min(100, (isProfileComplete ? 60 : 0) + (portfolio.length > 0 ? 40 : 0));

    return (
        <Container className="my-5">
            {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
            {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

            <Form onSubmit={handleSave}>
                <Row>
                    
                    {/* COLUNA ESQUERDA (Principal: Edição de Perfil e Portfólio) */}
                    <Col lg={8}>
                        
                        {/* CABEÇALHO E CONTROLE DE EDIÇÃO */}
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="text-warning fw-bold">Gerenciar Perfil e Portfólio</h2>
                            <Button 
                                variant={isEditing ? 'danger' : 'warning'} 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="fw-bold"
                            >
                                {isEditing ? <XCircle size={20} className="me-2" /> : <Edit size={20} className="me-2" />}
                                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
                            </Button>
                        </div>

                        {/* ====================================================================\
                           SEÇÃO 0: BANNER E FOTO DE PERFIL (LAYOUT CORRIGIDO)
                           ==================================================================== */}
                        <Card className="mb-4 shadow-sm position-relative overflow-hidden border-0">
                            
                            {/* Banner (Background) */}
                            <div style={{ height: '200px', overflow: 'hidden', background: '#ccc' }}>
                                <img 
                                    src={profileData.banner_url}
                                    alt="Banner do Perfil"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {/* Botão de Upload do Banner (só visível em edição) */}
                                {isEditing && (
                                    <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
                                        <Form.Label className="btn btn-sm btn-light fw-bold">
                                            <Camera size={16} className="me-1" /> Mudar Banner
                                            <Form.Control 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleMediaUpload(e.target.files[0], 'banner')}
                                                disabled={loading}
                                                hidden
                                            />
                                        </Form.Label>
                                    </div>
                                )}
                            </div>

                            {/* Conteúdo Abaixo do Banner: Avatar e Informações em linha */}
                            <Card.Body className="pt-0">
                                <div className="d-flex align-items-end" style={{ marginTop: '-75px' }}>
                                    
                                    {/* Avatar Section (Left) - Puxado para cima */}
                                    <div className="position-relative me-4">
                                        <img 
                                            src={profileData.avatar_url}
                                            alt="Foto de Perfil"
                                            className="rounded-circle border border-5 border-white shadow"
                                            style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                        />
                                        {/* Botão de Upload do Avatar */}
                                        {isEditing && (
                                            <Form.Label className="position-absolute badge bg-warning text-dark p-2" style={{ bottom: '0', right: '0', cursor: 'pointer' }}>
                                                <Camera size={16} />
                                                <Form.Control 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleMediaUpload(e.target.files[0], 'avatar')}
                                                    disabled={loading}
                                                    hidden
                                                />
                                            </Form.Label>
                                        )}
                                    </div>

                                    {/* Info Section (Right) - Alinhada ao lado do Avatar */}
                                    <div className="flex-grow-1 mb-2">
                                        <h3 className="mb-0 fw-bold">{profileData.full_name}</h3>
                                        <p className="text-muted mb-1">{profileData.service_area}</p>
                                        <div className='d-flex align-items-center'>
                                            <Star size={18} className='text-warning me-1'/>
                                            <span className="fw-bold">{profileData.rating}</span>
                                            <span className='ms-1 text-muted'>({MOCKED_PROFESSIONAL_DATA.total_reviews || 0} avaliações)</span>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        {/* ------------------------------------------- */}

                        {/* SEÇÃO 1: DADOS PESSOAIS E CONTATO */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-warning text-dark fw-bold">Dados Pessoais e Contato</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formFullName">
                                            <Form.Label>Nome de Exibição Público</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="full_name"
                                                value={profileData.full_name}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing || loading}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3" controlId="formPhone">
                                            <Form.Label>Telefone de Contato</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phone" // Corresponde ao phone_number no payload
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing || loading}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="formCep">
                                            <Form.Label>CEP</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cep"
                                                value={profileData.cep}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing || loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="formCidade">
                                            <Form.Label>Cidade</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="cidade"
                                                value={profileData.cidade}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing || loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3" controlId="formEstado">
                                            <Form.Label>Estado</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="estado"
                                                value={profileData.estado}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing || loading}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        {/* SEÇÃO 2: SERVIÇOS E DESCRIÇÃO */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-warning text-dark fw-bold">Serviço Principal e Biografia</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3" controlId="formServiceArea">
                                    <Form.Label><Briefcase size={16} className="me-1" /> Serviço Principal/Área de Atuação</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="service_area"
                                        value={profileData.service_area}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing || loading}
                                        required
                                        placeholder="Ex: Eletricista Residencial"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3" controlId="formDescription">
                                    <Form.Label>Biografia / Descrição dos Serviços</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description" // Corresponde ao descricao_servicos no payload
                                        value={profileData.description}
                                        onChange={handleProfileChange}
                                        disabled={!isEditing || loading}
                                        placeholder="Descreva sua experiência, diferenciais e as áreas que atende."
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        {/* SEÇÃO 3: GERENCIAMENTO DE PORTFÓLIO E MÍDIA */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
                                Portfólio de Projetos
                                <Badge bg="dark" className="p-2">
                                    {portfolio.length} Fotos
                                </Badge>
                            </Card.Header>
                            <Card.Body>
                                <p className="text-muted">Mostre seu trabalho! Carregue fotos de seus projetos concluídos para impressionar novos clientes.</p>

                                {/* CAMPO DE UPLOAD DE IMAGEM */}
                                <Form.Group controlId="portfolioUpload" className="mb-4">
                                    <Form.Label className="fw-bold d-flex align-items-center"><Camera size={18} className="me-2" /> Adicionar Nova Foto</Form.Label>
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => handlePortfolioImageUpload(e.target.files[0])}
                                        disabled={!isEditing || loading}
                                    />
                                    {!isEditing && <Form.Text className="text-danger">Entre no modo de edição para fazer upload de fotos.</Form.Text>}
                                </Form.Group>

                                <hr />

                                {/* GALERIA ATUAL DE IMAGENS */}
                                <Row className="mt-3">
                                    {portfolio.length === 0 ? (
                                        <Col>
                                            <Alert variant="info" className="text-center">
                                                Nenhuma foto no portfólio. Clique em "Adicionar Nova Foto" para começar!
                                            </Alert>
                                        </Col>
                                    ) : (
                                        portfolio.map((item) => (
                                            <Col md={6} lg={4} key={item.id} className="mb-4">
                                                <Card className="shadow-sm">
                                                    <div style={{ height: '150px', overflow: 'hidden' }}>
                                                        <Card.Img variant="top" src={item.image_url} alt={item.caption || 'Imagem do Portfólio'} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                                                    </div>
                                                    <Card.Body className="p-2">
                                                        <p className="small text-truncate mb-1">{item.caption || 'Sem legenda'}</p>
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
                                                            className="w-100 d-flex justify-content-center align-items-center"
                                                            onClick={() => handleImageDelete(item.id)} 
                                                            disabled={!isEditing || loading}
                                                        >
                                                            <Trash2 size={16} className="me-1" /> Excluir
                                                        </Button>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        ))
                                    )}
                                </Row>
                            </Card.Body>
                        </Card>
                        
                    </Col>
                    
                    {/* COLUNA DIREITA (Status e Navegação) */}
                    <Col lg={4}>
                        
                        {/* 1. Card de Status do Perfil */}
                        <Card className="mb-4 shadow-sm position-sticky" style={{ top: '20px' }}>
                            <Card.Header className="bg-dark text-white fw-bold d-flex align-items-center">
                                <Clock size={18} className="me-2" /> Status e Progresso
                            </Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="ms-1">
                                        <h5 className="mb-0 fw-bold">{profileData.full_name}</h5>
                                        <Badge bg={profileData.is_active ? 'success' : 'secondary'} className="mt-1">
                                            {profileData.is_active ? 'Perfil Ativo' : 'Rascunho/Inativo'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <h6 className="mt-3">Conclusão do Perfil ({completionPercentage}%)</h6>
                                <ProgressBar variant="warning" now={completionPercentage} label={`${completionPercentage}%`} className="mb-3" />
                                
                                <ul className="list-unstyled small">
                                    <li className={isProfileComplete ? 'text-success' : 'text-danger'}>
                                        {isProfileComplete ? <CheckSquare size={16} className="me-1" /> : <XCircle size={16} className="me-1" />}
                                        Dados Básicos e Descrição
                                    </li>
                                    <li className={portfolio.length > 0 ? 'text-success' : 'text-danger'}>
                                        {portfolio.length > 0 ? <CheckSquare size={16} className="me-1" /> : <XCircle size={16} className="me-1" />}
                                        Portfólio de Imagens ({portfolio.length})
                                    </li>
                                </ul>
                            </Card.Body>
                            <Card.Footer className='text-center'>
                                <Link to={`/profissionais/${1}`} className='btn btn-outline-info btn-sm w-100 fw-bold'>
                                    <Share2 size={16} className="me-2" /> Ver Perfil Público
                                </Link>
                            </Card.Footer>
                        </Card>

                        {/* 5. Card de Navegação/Ações de Conta */}
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-dark text-white fw-bold">Mais Opções</Card.Header>
                            {/* INÍCIO DA MODIFICAÇÃO: NOVO BOTÃO DE MENSAGENS */}
                            <Button as={Link} to="/mensagens" variant="outline-info" className="w-100 fw-bold mb-2">
                                <MessageSquare size={20} className="me-2" /> Mensagens
                            </Button>
                            {/* FIM DA MODIFICAÇÃO */}
                            <Button as={Link} to="/alterar-senha" variant="outline-primary" className="w-100 fw-bold mb-2">
                                <Star size={20} className="me-2" /> Alterar Senha
                            </Button>
                            <Button as={Link} to="/meu-perfil" variant="outline-warning" className="w-100 fw-bold mb-2">
                                <User size={20} className="me-2" /> Conta Geral
                            </Button>
                            <Button variant="outline-danger" className="w-100 fw-bold mt-2" onClick={logout}>
                                Sair da Conta
                            </Button>
                        </Card>

                        {/* 6. Componente de Demandas */}
                        <MyDemandsSection title="Minhas Demandas Ativas" isProfessionalView={true} />
                        
                    </Col>
                </Row>
                
                {/* BOTÃO DE SUBMISSÃO GERAL */}
                {isEditing && (
                    <div className="fixed-bottom p-3 bg-white border-top border-warning shadow-lg">
                        <Button 
                            type="submit" variant="warning" className="w-100 fw-bold py-3"
                            disabled={loading}
                        >
                            {loading ? <><Spinner animation="border" size="sm" className='me-2' /> Salvando Alterações...</> : 'Salvar Portfólio e Dados'}
                        </Button>
                    </div>
                )}
            </Form>
        </Container>
    );
};

export default ProfessionalProfileView;