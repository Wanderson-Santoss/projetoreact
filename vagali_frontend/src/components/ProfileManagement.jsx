import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse, Nav } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, User, Repeat, Settings, ListChecks, MessageSquare, LogOut, Heart, PlusCircle, Trash2, Camera, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

// ====================================================================
// IMPORTAÇÕES DE COMPONENTES DE SEÇÃO (Assumindo que eles existem)
// ====================================================================
import { useAuth } from "./AuthContext"; 
// import FollowingProfessionalsList from "./FollowingProfessionalsList"; // Descomente quando o componente estiver pronto
// import MyDemandsSection from "./MyDemandsSection"; // Descomente quando o componente estiver pronto
// import ChatSection from "./ChatSection"; // Componente fictício para o chat

// ====================================================================
// CONSTANTES E URLS
// ====================================================================
const API_BASE_URL = '/api/v1/accounts/perfil/me/'; 
const API_ROLE_URL = API_BASE_URL; // Usamos o mesmo endpoint para o PATCH de papel
const API_PHOTO_URL = '/api/v1/accounts/perfil/photo/'; // Endpoint para foto de perfil

const ProfileManagement = () => { 
    const navigate = useNavigate();

    // 1. CONSUMIR O CONTEXTO DE AUTENTICAÇÃO
    const { 
        token, 
        user, 
        logout, 
        updateUserData,
        isAuthenticated,
    } = useAuth(); 

    // Estados locais
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Estado de UI
    const [activeSection, setActiveSection] = useState('perfil'); // 'perfil', 'demandas', 'chat', 'seguindo', 'config'
    const [openProfile, setOpenProfile] = useState(true);
    const [profileImage, setProfileImage] = useState(null); // Para a nova foto a ser enviada
    const [imagePreview, setImagePreview] = useState(null); // Para pré-visualização da imagem
    
    // ====================================================================
    // FUNÇÃO REUTILIZÁVEL PARA BUSCAR O PERFIL (GET)
    // ====================================================================
    const fetchProfile = useCallback(async () => {
        // Lógica de verificação e redirecionamento de autenticação...
        if (!isAuthenticated || !token) {
             setLoading(false);
             if (!isAuthenticated) navigate('/login');
             return;
        }

        try {
            const response = await axios.get(API_BASE_URL); 
            setProfileData(response.data);
            
            // Define a pré-visualização da imagem atual (se houver)
            if (response.data?.profile?.photo) {
                setImagePreview(response.data.profile.photo);
            }
            
            // ... (Lógica de atualização do contexto global user.is_professional e full_name)
            const isProfessionalFromAPI = response.data?.user?.is_professional || response.data?.is_professional;
            const fullNameFromAPI = response.data?.profile?.full_name;
            
            const dataToUpdate = {};
            if (fullNameFromAPI) dataToUpdate.full_name = fullNameFromAPI;
            if (isProfessionalFromAPI !== undefined) dataToUpdate.is_professional = isProfessionalFromAPI; 
            
            if (Object.keys(dataToUpdate).length > 0) {
                 updateUserData(dataToUpdate); 
            }

        } catch (err) {
            console.error("Erro ao carregar perfil (GET):", err);
            if (err.response && err.response.status === 401) {
                logout(); 
            } else {
                setError('Falha ao carregar dados do perfil. Tente recarregar.');
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, updateUserData, navigate, logout]);


    // Efeito: Chama fetchProfile na montagem
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); 


    // Função genérica para lidar com a mudança dos inputs do formulário
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            profile: {
                ...prevData.profile,
                [name]: value,
            }
        }));
    }, []);
    
    // ====================================================================
    // FUNÇÕES DE FOTO DE PERFIL
    // ====================================================================
    
    // Lida com a seleção de arquivo e gera pré-visualização
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    // Envia a foto de perfil
    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!profileImage) {
            setError('Nenhuma imagem selecionada para upload.');
            return;
        }
        
        setLoading(true);
        setSuccess(null);
        setError(null);
        
        const formData = new FormData();
        formData.append('photo', profileImage);

        try {
            // Requisição PATCH/POST (Depende do backend, mas PATCH é comum para atualização)
            // Assumimos que o endpoint espera o FormData com a chave 'photo'
            await axios.patch(API_PHOTO_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Atualiza o perfil para obter a nova URL da foto
            await fetchProfile(); 

            setSuccess('Foto de perfil atualizada com sucesso! 📸');
            setProfileImage(null); // Limpa o estado do arquivo
            
        } catch (err) {
            console.error('Erro ao enviar foto:', err.response?.data || err);
            setError('Erro ao enviar foto. Verifique o tamanho e o formato do arquivo.');
        } finally {
            setLoading(false);
        }
    };

    // Remove a foto de perfil (se o backend suportar)
    const handlePhotoDelete = async () => {
        if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) return;
        
        setLoading(true);
        setSuccess(null);
        setError(null);

        try {
            // Assumimos que o PATCH com photo: null ou o DELETE remove a foto
            await axios.patch(API_PHOTO_URL, { photo: null }); 

            // Atualiza o perfil
            await fetchProfile(); 
            
            setImagePreview(null);
            setSuccess('Foto de perfil removida com sucesso!');
        } catch (err) {
            console.error('Erro ao remover foto:', err.response?.data || err);
            setError('Erro ao remover foto. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // ====================================================================
    // FUNÇÃO PARA ALTERAR O PAPEL (CLIENTE <-> PROFISSIONAL)
    // ... (Mantida igual)
    // ====================================================================
    const handleRoleSwitch = async () => {
        // ... (Corpo da função handleRoleSwitch mantido igual)
         if (!user) {
            setError('Dados de usuário não encontrados. Por favor, refaça o login.');
            logout();
            return;
        }

        const newRoleStatus = !user.is_professional;
        const newRoleName = newRoleStatus ? 'Profissional' : 'Cliente';

        if (!window.confirm(`Tem certeza que deseja mudar seu papel para ${newRoleName}?`)) {
            return;
        }

        setLoading(true);
        setSuccess(null);
        setError(null);
        
        try {
            const response = await axios.patch(API_ROLE_URL, { 
                is_professional: newRoleStatus 
            }); 
            
            updateUserData({ 
                is_professional: response.data.is_professional,
            });
            
            await fetchProfile(); 
            
            setSuccess(`Papel alterado com sucesso para ${newRoleName}! 🎉`);
            
        } catch (err) {
            console.error('Erro ao alternar papel (PATCH):', err.response?.data || err);
            
            if (err.response && err.response.status === 401) {
                logout(); 
                setError('Sua sessão expirou. Por favor, faça login novamente.');
            } else {
                const message = err.response?.data?.detail || err.message || 'Erro ao alterar o papel.';
                setError(message);
            }

        } finally {
            setLoading(false);
        }
    };

    // ====================================================================
    // FUNÇÃO PARA ATUALIZAR O PERFIL (PATCH - Nome, Bio, etc.)
    // ... (Mantida igual)
    // ====================================================================
    const handleProfileUpdate = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        setSuccess(null);
        setError(null);

        const payload = {
            profile: {
                full_name: profileData?.profile?.full_name || '', 
                bio: profileData?.profile?.bio || '',
                // Adicione outros campos de perfil aqui (e.g., location)
                // location: profileData?.profile?.location || '', 
            }
        };

        try {
            const response = await axios.patch(API_BASE_URL, payload); 
            
            setProfileData(response.data); 
            
            updateUserData({ 
                full_name: response.data?.profile?.full_name,
            });

            setSuccess('Perfil atualizado com sucesso! 🎉');

        } catch (err) {
            console.error('Erro ao atualizar perfil (PATCH):', err.response?.data || err);
            
            if (err.response && err.response.status === 401) {
                logout(); 
                setError('Sua sessão expirou. Por favor, faça login novamente.');
            } else {
                const message = err.response?.data?.detail || err.message || 'Erro ao salvar as alterações. Verifique os dados.';
                setError(message);
            }

        } finally {
            setLoading(false);
        }
    };
    
    // ====================================================================
    // RENDERIZAÇÃO CONDICIONAL DA SEÇÃO ATIVA
    // ====================================================================
    const renderActiveSection = () => {
        // Seções para Clientes
        if (!user?.is_professional) {
            switch (activeSection) {
                case 'demandas':
                    // return <MyDemandsSection />; // Descomente
                    return <Alert variant="info">Seção de Suas Demandas (Para Clientes) - Em breve você poderá criar e gerenciar seus pedidos de serviço aqui!</Alert>;
                case 'seguindo':
                    // return <FollowingProfessionalsList />; // Descomente
                    return <Alert variant="secondary">Seção de Profissionais Seguidos - Acompanhe os profissionais que você favoritou.</Alert>;
                case 'chat':
                    // return <ChatSection />; // Descomente
                    return <Alert variant="warning">Seção de Chat (Estilo WhatsApp) - Converse com os profissionais sobre seus serviços. 💬</Alert>;
                case 'perfil':
                default:
                    return renderProfileForm(); 
            }
        } 
        
        // Seções para Profissionais (Ajuste conforme necessário)
        // Seções para Profissionais teriam links para /meu-portfolio, Configurações de Serviço, etc.
        if (user?.is_professional) {
             switch (activeSection) {
                case 'portfolio':
                    return (
                        <Card className="p-4 shadow">
                            <Card.Title className="text-dark">Gerenciar Portfólio</Card.Title>
                            <Alert variant="warning">Você é um profissional. Gerencie seus serviços e portfólio.</Alert>
                            <Button as={Link} to="/meu-portfolio" variant="success" className="w-100"><Briefcase size={20} className="me-2"/> Ir para o Portfólio</Button>
                        </Card>
                    );
                case 'chat':
                    // return <ChatSection />; // Descomente
                    return <Alert variant="warning">Seção de Chat (Estilo WhatsApp) - Converse com seus clientes sobre os serviços. 💬</Alert>;
                case 'perfil':
                default:
                    return renderProfileForm(); 
            }
        }
    };
    
    // Sub-componente para o formulário de perfil e foto (Usado em renderActiveSection)
    const renderProfileForm = () => (
        <Card className="bg-vagali-dark-card p-4 shadow mb-4">
            <Card.Title className="border-bottom border-primary pb-2 mb-3 text-dark">
                Informações Pessoais e Foto 
            </Card.Title>
            
            {/* Seção de Foto de Perfil */}
            <Row className="mb-4 d-flex align-items-center">
                <Col xs={12} md={3} className="text-center">
                    <div className="position-relative d-inline-block">
                        <img
                            src={imagePreview || "/default-avatar.png"} // Use uma imagem padrão se não houver
                            alt="Foto de Perfil"
                            className="rounded-circle border border-primary border-4"
                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        />
                        <label htmlFor="profileImageInput" className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-1" style={{ cursor: 'pointer' }}>
                             <Camera size={20} color="white" />
                        </label>
                        <input
                            type="file"
                            id="profileImageInput"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                        />
                    </div>
                    {imagePreview && (
                        <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="mt-2"
                            onClick={handlePhotoDelete}
                            disabled={loading}
                        >
                            <Trash2 size={16} className="me-1"/> Remover
                        </Button>
                    )}
                </Col>
                <Col xs={12} md={9}>
                    <Form onSubmit={handlePhotoUpload}>
                        <Form.Group className="mt-3 mt-md-0">
                            <Form.Label className="text-muted">Upload de Nova Foto:</Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="form-control-dark mb-2"
                            />
                        </Form.Group>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="sm"
                            disabled={loading || !profileImage}
                        >
                            {loading && profileImage ? <Spinner animation="border" size="sm" /> : 'Salvar Nova Foto'}
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Formulário de Detalhes Pessoais */}
            <Collapse in={openProfile}>
                <div>
                    <Form onSubmit={handleProfileUpdate}>
                        <Row>
                            <Form.Group as={Col} md={6} controlId="formFullName" className="mb-3">
                                <Form.Label className="text-muted">Nome Completo</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    value={profileData?.profile?.full_name || ''} 
                                    onChange={handleChange}
                                    className="form-control-dark"
                                    required
                                />
                            </Form.Group>
                            
                            <Form.Group as={Col} md={6} controlId="formLocation" className="mb-3">
                                <Form.Label className="text-muted">Localização (Cidade/Estado)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="location"
                                    value={profileData?.profile?.location || ''} 
                                    onChange={handleChange}
                                    className="form-control-dark"
                                />
                            </Form.Group>

                            <Form.Group as={Col} md={12} controlId="formBio" className="mb-3">
                                <Form.Label className="text-muted">Biografia / Sobre Você</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="bio"
                                    value={profileData?.profile?.bio || ''} 
                                    onChange={handleChange}
                                    className="form-control-dark"
                                />
                            </Form.Group>
                        </Row>

                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="w-100 fw-bold mt-3 py-2"
                            disabled={loading}
                        >
                            {loading && !profileImage ? <Spinner animation="border" size="sm" /> : 'Salvar Detalhes'}
                        </Button>
                    </Form>
                </div>
            </Collapse>
        </Card>
    );

    // ====================================================================
    // RENDERIZAÇÃO PRINCIPAL
    // ====================================================================
    if (loading || !profileData) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" /> 
                <p className="text-muted mt-2">Carregando perfil...</p> 
            </Container>
        );
    }

    const currentRole = user?.is_professional ? 'Profissional' : 'Cliente';
    const nextRole = user?.is_professional ? 'Cliente' : 'Profissional';
    
    return (
        <Container className="my-5">
            <h2 className="text-dark mb-4">Gerenciamento de Conta: <span className="text-primary">{user?.full_name || 'Usuário'}</span></h2> 
            
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                {/* === COLUNA DE NAVEGAÇÃO LATERAL === */}
                <Col md={4} className="mb-4">
                    
                    {/* Botões de Navegação */}
                    <Card className="p-3 shadow-sm mb-3">
                        <Nav variant="pills" className="flex-column">
                            {/* Perfil */}
                            <Nav.Link 
                                eventKey="perfil" 
                                active={activeSection === 'perfil'} 
                                onClick={() => setActiveSection('perfil')}
                                className="d-flex align-items-center mb-1 bg-light text-dark"
                            >
                                <User size={20} className="me-2" /> Editar Perfil & Foto
                            </Nav.Link>
                            
                            {/* Chat */}
                            <Nav.Link 
                                eventKey="chat" 
                                active={activeSection === 'chat'} 
                                onClick={() => setActiveSection('chat')}
                                className="d-flex align-items-center mb-1 bg-light text-dark"
                            >
                                <MessageSquare size={20} className="me-2" /> Mensagens
                            </Nav.Link>

                            {/* Links Condicionais (Cliente vs Profissional) */}
                            {!user?.is_professional ? (
                                <>
                                    {/* Demandas (Cliente) */}
                                    <Nav.Link 
                                        eventKey="demandas" 
                                        active={activeSection === 'demandas'} 
                                        onClick={() => setActiveSection('demandas')}
                                        className="d-flex align-items-center mb-1 bg-light text-dark"
                                    >
                                        <ListChecks size={20} className="me-2" /> Suas Demandas
                                    </Nav.Link>
                                    {/* Seguindo (Cliente) */}
                                    <Nav.Link 
                                        eventKey="seguindo" 
                                        active={activeSection === 'seguindo'} 
                                        onClick={() => setActiveSection('seguindo')}
                                        className="d-flex align-items-center mb-1 bg-light text-dark"
                                    >
                                        <Heart size={20} className="me-2" /> Profissionais Seguidos
                                    </Nav.Link>
                                </>
                            ) : (
                                // Link para Portfólio (Profissional)
                                <Nav.Link 
                                    eventKey="portfolio" 
                                    active={activeSection === 'portfolio'} 
                                    onClick={() => setActiveSection('portfolio')}
                                    className="d-flex align-items-center mb-1 bg-light text-dark"
                                >
                                    <Briefcase size={20} className="me-2" /> Gerenciar Portfólio
                                </Nav.Link>
                            )}

                        </Nav>
                    </Card>

                    {/* === CARD PARA MUDANÇA DE PAPEL === */}
                    <Card className="p-3 shadow-sm mt-3 border border-secondary">
                        <Button 
                            variant={user?.is_professional ? 'info' : 'success'} 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center"
                            onClick={handleRoleSwitch}
                            disabled={loading}
                        >
                            <Repeat size={20} className="me-2" /> 
                            Mudar para {nextRole}
                        </Button>
                        <p className="small text-muted mt-2 text-center">
                            Seu papel atual: <span className="fw-bold text-primary">{currentRole}</span>
                        </p>
                    </Card>

                    {/* BOTÃO LOGOUT */}
                    <Card className="p-3 shadow-sm mt-3">
                        <Button 
                            variant="outline-danger" 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center"
                            onClick={logout}
                        >
                            <LogOut size={20} className="me-2" /> Sair da Conta
                        </Button>
                    </Card>

                </Col>

                {/* === COLUNA DE CONTEÚDO PRINCIPAL === */}
                <Col md={8}>
                    {renderActiveSection()}
                </Col>
            </Row>
        </Container>
    );
};

export default ProfileManagement;