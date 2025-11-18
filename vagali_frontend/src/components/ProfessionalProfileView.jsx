import React, { useState, useEffect, useCallback, createContext } from 'react'; 
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse, Pagination } from 'react-bootstrap'; 
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { Briefcase, User, Repeat, Settings, ListChecks, MapPin, Camera, ChevronDown, ChevronUp, MessageSquare, LogOut, Heart } from 'lucide-react'; 

// ====================================================================
// MOCK DE DEPENDÊNCIAS (Para o ambiente de arquivo único)
// ====================================================================

// 1. MOCK: AuthContext (Simulação de Autenticação)
const AuthContext = createContext();

const useAuth = () => {
    // Retorna valores mockados que o ProfessionalProfileView usa:
    return {
        // Mock Token/User para que o fetchProfile não falhe imediatamente
        token: 'mock-auth-token-123',
        isUserProfessional: false,
        user: { email: 'user@example.com', id: 'mockUserId123' },
        userId: 'mockUserId123',
        
        // Funções mockadas (para evitar erros de 'is not a function')
        setUserRole: (isPro) => console.log(`[MOCK] Set user role to: ${isPro}`),
        logout: () => alert("Logout mockado!"),
        setUserName: (name) => console.log(`[MOCK] Set user name to: ${name}`),
    };
};

// 2. MOCK: FollowingProfessionalsList (Profissionais Seguidos)
const FollowingProfessionalsList = () => (
    <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-light d-flex align-items-center" style={{ color: 'var(--dark-text)' }}>
            <Heart size={20} className="me-2 text-danger"/> Profissionais Seguidos
        </Card.Header>
        <Card.Body>
            <p className="small text-muted">Esta é uma lista mockada. Não há profissionais seguidos (mock).</p>
            <Button variant="outline-primary" className="w-100" as={Link} to="/search-professionals">
                Encontrar Profissionais
            </Button>
        </Card.Body>
    </Card>
);

// 3. MOCK: MyDemandsSection (Minhas Demandas)
const MyDemandsSection = ({ currentPage, itemsPerPage }) => (
    <Card className="shadow-sm mb-4">
        <Card.Header className="fw-bold bg-light d-flex align-items-center" style={{ color: 'var(--dark-text)' }}>
            <ListChecks size={20} className="me-2 text-primary"/> Minhas Demandas (Mock)
        </Card.Header>
        <Card.Body>
            <p>Exibindo demandas de {((currentPage - 1) * itemsPerPage) + 1} a {currentPage * itemsPerPage}.</p>
            <Alert variant="info" className="small">
                A lógica real de listagem de demandas seria implementada aqui.
            </Alert>
            <Button as={Link} to="/create-demand" variant="primary">
                Criar Nova Demanda
            </Button>
        </Card.Body>
    </Card>
);

// ====================================================================
// COMPONENTE PRINCIPAL
// ====================================================================

// CONSTANTES E URLS
const VIACEP_URL = 'https://viacep.com.br/ws/';
const API_BASE_URL = '/api/v1/accounts/perfil/me/'; 
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/007bff/ffffff?text=FOTO';

const ProfessionalProfileView = () => { 
    
    const navigate = useNavigate();
    
    // USANDO O HOOK MOCKADO
    const { 
        token, 
        setUserRole, 
        logout,
        user,
        setUserName
    } = useAuth(); 

    // ESTADOS DE CONTROLE
    const [isInfoCollapsed, setIsInfoCollapsed] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [apiError, setApiError] = useState(null);
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    
    // Bloqueia re-fetch após a navegação para perfil nulo
    const [isNavigating, setIsNavigating] = useState(false); 
    
    // NOVO ESTADO CRÍTICO PARA QUEBRAR O LOOP 200
    const [isProfileFetched, setIsProfileFetched] = useState(false); 

    // ESTADOS PARA PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const [totalDemands, setTotalDemands] = useState(23); // Substitua 23 pela contagem real
    
    // Calcula o número total de páginas
    const totalPages = Math.ceil(totalDemands / itemsPerPage);
    
    // ESTADO DO FORMULÁRIO (MATCHING BACKEND SERIALIZER FIELDS)
    const [profileData, setProfileData] = useState({
        // DADOS DO USER
        email: '', 
        is_professional: false,
        // DADOS DO PROFILE
        full_name: '', 
        phone_number: '', 
        cpf: '',
        bio: '',
        cep: '', 
        cidade: '', 
        estado: '', 
        // Campos de Endereço (temporários/frontend-side)
        street: '', 
        number: '', 
        complement: '', 
        neighborhood: '', 
        profilePictureUrl: DEFAULT_AVATAR, 
    });

    // ----------------------------------------------------
    // LÓGICA DE PAGINAÇÃO (Mantida dentro do escopo)
    // ----------------------------------------------------
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // A função renderPagination FOI REMOVIDA
    // ----------------------------------------------------
    // FIM DA LÓGICA DE PAGINAÇÃO
    // ----------------------------------------------------

    // ----------------------------------------------------
    // LÓGICA DE BUSCA DO CEP
    // ----------------------------------------------------
    const fetchAddressByCep = useCallback(async (cep) => {
        const cleanedCep = cep.replace(/\D/g, '');
        if (cleanedCep.length !== 8) {
            setCepError(null);
            return;
        }
        setCepLoading(true);
        setCepError(null);
        
        // Mock de Requisição: Simula a busca de endereço para que a UI funcione
        try {
             // Mock de atraso e resultado de sucesso
            await new Promise(resolve => setTimeout(resolve, 500)); 

            setProfileData(prev => ({
                ...prev,
                street: 'Rua Mockada',
                neighborhood: 'Bairro Teste',
                cidade: 'Cidade Mock', 
                estado: 'ST', 
            }));
            
        } catch (error) {
            setCepError("Erro ao buscar CEP (Mock).");
        } finally {
            setCepLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value, }));

        if (name === 'cep') {
            if (value.replace(/\D/g, '').length === 8) {
                fetchAddressByCep(value);
            }
        }
    };
    
    // ----------------------------------------------------
    // LÓGICA DE CARREGAMENTO DE DADOS (GET)
    // ----------------------------------------------------
    const fetchProfile = useCallback(async () => {
        
        if (!user || !token) { 
            setIsLoading(false);
            if (!token) navigate('/login');
            return; 
        }
        
        setIsLoading(true);
        setApiError(null);

        // MOCK DE BUSCA REAL (Substituir axios.get)
        try {
            // Simula uma resposta de API
            const apiData = {
                email: user.email,
                is_professional: false, 
                profile: {
                    full_name: 'Usuário Teste Mockado', 
                    phone_number: '11999999999',
                    cpf: '12345678900',
                    bio: 'Este é um perfil mockado de cliente.',
                    cep: '01001000', 
                    cidade: 'São Paulo', 
                    estado: 'SP', 
                    profile_picture_url: DEFAULT_AVATAR,
                },
            };
            
            const profile = apiData.profile || {}; 
            const profilePictureUrl = profile.profile_picture_url || DEFAULT_AVATAR;
            
            setProfileData({
                email: apiData.email,
                is_professional: apiData.is_professional,
                
                full_name: profile.full_name || '',
                phone_number: profile.phone_number || '',
                cpf: profile.cpf || '',
                bio: profile.bio || '',
                cep: profile.cep || '', 
                cidade: profile.cidade || '',
                estado: profile.estado || '',

                street: '', 
                number: '',
                complement: '', 
                neighborhood: '',
                
                profilePictureUrl: profilePictureUrl,
            });

            if(typeof setUserRole === 'function') {
                setUserRole(apiData.is_professional);
            }
            
            setIsProfileFetched(true); 

        } catch (error) {
            // Em um ambiente real, o erro do axios seria tratado aqui
            setApiError("Falha ao carregar dados do perfil (Mock). Tente recarregar a página.");
            console.error("Erro ao buscar perfil:", error);
        } finally {
            setIsLoading(false); 
        }
    }, [token, user, navigate, setUserRole, setIsNavigating, setIsProfileFetched]); 
    
    // ----------------------------------------------------
    // LÓGICA DE EFEITO (useEffect)
    // ----------------------------------------------------
    useEffect(() => {
        if (user && !isNavigating && !isProfileFetched) { 
            fetchProfile();
        } else if (!token) {
            setIsLoading(false);
            navigate('/login');
        }
    }, [user, token, navigate, fetchProfile, isNavigating, isProfileFetched]); 
    
    
    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfilePictureFile(file);
        setApiError(null);
        
        // Simulação de pré-visualização imediata
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, profilePictureUrl: reader.result }));
        };
        reader.readAsDataURL(file);

        alert("Simulação: Foto de perfil seria enviada aqui.");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setApiError(null);
        
        // Simulação de envio
        await new Promise(resolve => setTimeout(resolve, 800)); 

        try {
            if (typeof setUserName === 'function') {
                setUserName(profileData.full_name); 
            }
            
            alert("Perfil atualizado com sucesso! (Simulação)");

        } catch (error) {
            setApiError("Erro ao salvar alterações. (Simulação)");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRole = async () => {
        if (!token) return;
        
        const newStatus = !profileData.is_professional; 
        
        // Simulação de alteração de papel
        await new Promise(resolve => setTimeout(resolve, 500)); 
        
        try {
            if (typeof setUserRole === 'function') {
                setUserRole(newStatus);
            }
            
            setProfileData(prev => ({ ...prev, is_professional: newStatus }));

            alert(`Status alterado para: ${newStatus ? 'Profissional' : 'Cliente'}! (Simulação)`);

            if (newStatus === true && user?.id) { 
                navigate(`/professional/${user.id}`); 
            }

        } catch (error) {
            setApiError(`Falha ao alternar papel. (Simulação)`);
        }
    };
    
    const handleLogout = () => {
        if (typeof logout === 'function') {
            logout(); 
        }
    };
    
    if (isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status" className="text-primary"/>
                <p className="mt-2">Carregando dados do perfil... (Mock)</p>
            </Container>
        );
    }
    
    const nextRole = profileData.is_professional ? 'Cliente' : 'Profissional';
    const currentRole = profileData.is_professional ? 'Profissional' : 'Cliente';
    const currentRoleIcon = profileData.is_professional ? <Briefcase size={20} className="me-2" /> : <User size={20} className="me-2" />;
    
    return (
        <Container className="my-5">
            <h1 className="mb-4 d-flex align-items-center" style={{ color: 'var(--primary-color)' }}>
                <Settings size={32} className="me-2" /> Gerenciamento de Perfil
            </h1>
            
            {apiError && <Alert variant="danger">{apiError}</Alert>}
            
            <Row>
                <Col md={8}>
                    {/* CARD DE FOTO DE PERFIL E NOME */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body className="d-flex align-items-center">
                            <img 
                                src={profileData.profilePictureUrl} 
                                alt="Foto de Perfil"
                                className="rounded-circle me-4"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', border: '2px solid #007bff' }}
                            />
                            <div>
                                <h5 className="mb-1">{profileData.full_name}</h5>
                                
                                <label htmlFor="profile-picture-upload" className="btn btn-outline-primary btn-sm mt-1">
                                    <Camera size={16} className="me-1" /> Alterar Foto
                                </label>
                                <input 
                                    type="file" id="profile-picture-upload" accept="image/*" 
                                    onChange={handlePictureUpload} 
                                    style={{ display: 'none' }} 
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    {/* CARD DE INFORMAÇÕES BÁSICAS - COM COLAPSO */}
                    <Card className="shadow-sm mb-4">
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
                        
                        <Collapse in={!isInfoCollapsed}>
                            <div id="info-collapse-body">
                                <Card.Body>
                                    <Form onSubmit={handleSubmit}>
                                        
                                        {/* DADOS PESSOAIS */}
                                        <h5 className="mb-3 text-muted">Dados Pessoais</h5>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Label>Nome Completo</Form.Label>
                                                <Form.Control type="text" name="full_name" value={profileData.full_name} onChange={handleChange} required />
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
                                            <Form.Control type="text" name="phone_number" value={profileData.phone_number} onChange={handleChange} />
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label>CPF</Form.Label>
                                            <Form.Control type="text" name="cpf" value={profileData.cpf} onChange={handleChange} maxLength={11} required />
                                        </Form.Group>

                                        {/* DADOS DE ENDEREÇO */}
                                        <hr />
                                        <h5 className="mb-3 text-muted d-flex align-items-center"><MapPin size={20} className="me-2"/> Endereço</h5>

                                        <Row className="mb-3">
                                            <Col md={4}>
                                                <Form.Label>CEP</Form.Label>
                                                <Form.Control 
                                                    type="text" name="cep" value={profileData.cep} onChange={handleChange} maxLength={9} placeholder="Ex: 01001-000" required 
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
                                                <Form.Control type="text" name="cidade" value={profileData.cidade} onChange={handleChange} disabled={cepLoading} required />
                                            </Col>
                                            <Col md={2}>
                                                <Form.Label>Estado (UF)</Form.Label>
                                                <Form.Control type="text" name="estado" value={profileData.estado} onChange={handleChange} disabled={cepLoading} maxLength={2} required />
                                            </Col>
                                            <Col md={3}>
                                                <Form.Label>Número</Form.Label> 
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
                    {!profileData.is_professional && (
                        <>
                            <MyDemandsSection 
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                            />
                            
                            {/* RENDERIZAÇÃO DA PAGINAÇÃO (CORREÇÃO FINAL DE ESCOPO/IMPLEMENTAÇÃO) */}
                            {totalDemands > itemsPerPage && (
                                <div className="d-flex justify-content-center mt-4 mb-4">
                                    <Pagination>
                                        <Pagination.First 
                                            onClick={() => handlePageChange(1)} 
                                            disabled={currentPage === 1} 
                                        />
                                        <Pagination.Prev 
                                            onClick={() => handlePageChange(currentPage - 1)} 
                                            disabled={currentPage === 1} 
                                        />
                                        
                                        {/* Renderiza os botões de página diretamente no JSX */}
                                        {[...Array(totalPages).keys()].map(number => (
                                            <Pagination.Item 
                                                key={number + 1} 
                                                active={number + 1 === currentPage}
                                                onClick={() => handlePageChange(number + 1)}
                                            >
                                                {number + 1}
                                            </Pagination.Item>
                                        ))}
                                        
                                        <Pagination.Next 
                                            onClick={() => handlePageChange(currentPage + 1)} 
                                            disabled={currentPage === totalPages} 
                                        />
                                        <Pagination.Last 
                                            onClick={() => handlePageChange(totalPages)} 
                                            disabled={currentPage === totalPages} 
                                        />
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}

                    {/* CARD DE CONFIGURAÇÕES DE PROFISSIONAL (SÓ PARA PROFISSIONAIS) */}
                    {profileData.is_professional && (
                        <Card className="shadow-sm mb-4 border-success">
                            <Card.Header className="fw-bold bg-success text-white">
                                Configurações de Profissional
                            </Card.Header>
                            <Card.Body>
                                <p>Gerencie suas especialidades, preços e disponibilidade.</p>
                                <Button as={Link} to={`/professional/${user.id}`} variant="outline-success" className="me-2">
                                    Editar Portfólio
                                </Button>
                                <Button as={Link} to={`/professional/${user.id}/schedule`} variant="outline-success">
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
                            <Alert variant={profileData.is_professional ? "info" : "warning"} className="fw-bold d-flex justify-content-center align-items-center">
                                {currentRoleIcon} {currentRole}
                            </Alert>
                            <p className="small text-muted">Mude seu papel para Cliente ou Profissional.</p>
                            <Button 
                                variant="primary" 
                                className="w-100 mt-2 fw-bold d-flex justify-content-center align-items-center" 
                                onClick={toggleRole} 
                            >
                                <Repeat size={18} className="me-2" />
                                Mudar para: {nextRole}
                            </Button>
                        </Card.Body>
                    </Card>
                    
                    {/* BLOCO 1: PROFISSIONAIS SEGUIDOS (APENAS PARA CLIENTES) */}
                    {!profileData.is_professional && (
                        <FollowingProfessionalsList />
                    )}
                    
                    {/* BLOCO 2: MENSAGENS (APENAS PARA CLIENTES) */}
                    {!profileData.is_professional && (
                        <Card className="shadow-sm mb-4">
                            <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>
                                Comunicação
                            </Card.Header>
                            <Card.Body>
                                <Button 
                                    as={Link} 
                                    to="/mensagens" 
                                    variant="warning" 
                                    className="w-100 fw-bold d-flex justify-content-center align-items-center"
                                >
                                    <MessageSquare size={20} className="me-2" /> Minhas Mensagens
                                </Button>
                            </Card.Body>
                        </Card>
                    )}

                    {/* CARD DE SEGURANÇA */}
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="fw-bold bg-light" style={{ color: 'var(--dark-text)' }}>
                            Segurança
                        </Card.Header>
                        <Card.Body className="d-grid gap-2">
                            <Button as={Link} to="/change-password" variant="danger" className="w-100">
                                Mudar Senha
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                className="w-100 d-flex justify-content-center align-items-center mt-2 fw-bold"
                                onClick={handleLogout} 
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

export default ProfessionalProfileView;
