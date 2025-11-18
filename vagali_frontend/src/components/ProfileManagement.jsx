import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, User, Repeat, Settings, ListChecks, MapPin, Camera, ChevronDown, ChevronUp, MessageSquare, LogOut, Heart } from 'lucide-react';

// ====================================================================
// IMPORTAÇÕES (Ajuste o caminho conforme a sua estrutura)
// ====================================================================
// Assumindo que estes estão no mesmo nível ou acessíveis como "./"
import { useAuth } from "./AuthContext"; 
import FollowingProfessionalsList from "./FollowingProfessionalsList"; 
import MyDemandsSection from "./MyDemandsSection"; 

// ====================================================================
// CONSTANTES E URLS
// ====================================================================
const VIACEP_URL = 'https://viacep.com.br/ws/';
// URL para GET/PUT do perfil
const API_BASE_URL = '/api/v1/accounts/perfil/me/'; 
// URL para PATCH de alteração de papel/role
const API_ROLE_URL = '/api/v1/accounts/role/'; 
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/007bff/ffffff?text=FOTO';

const ProfileManagement = () => { 
    
    const navigate = useNavigate();
    
    // USANDO O HOOK DE AUTENTICAÇÃO REAL
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
    const [isNavigating, setIsNavigating] = useState(false); 
    const [isProfileFetched, setIsProfileFetched] = useState(false); 

    // ESTADOS PARA PAGINAÇÃO (Simulação)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const [totalDemands, setTotalDemands] = useState(23); 
    const totalPages = Math.ceil(totalDemands / itemsPerPage);
    
    // ESTADO DO FORMULÁRIO
    const [profileData, setProfileData] = useState({
        email: '', 
        is_professional: false,
        full_name: '', 
        phone_number: '', 
        cpf: '',
        bio: '',
        cep: '', 
        cidade: '', 
        estado: '', 
        street: '', 
        number: '', 
        complement: '', 
        neighborhood: '', 
        profilePictureUrl: DEFAULT_AVATAR, 
    });

    // ----------------------------------------------------
    // LÓGICA DE PAGINAÇÃO
    // ----------------------------------------------------
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // ----------------------------------------------------
    // LÓGICA DE BUSCA DO CEP (ViaCEP)
    // ----------------------------------------------------
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
            
            if (response.data.erro) {
                setCepError("CEP não encontrado.");
                return;
            }
            
            setProfileData(prev => ({
                ...prev,
                street: response.data.logradouro || '',
                neighborhood: response.data.bairro || '',
                cidade: response.data.localidade || '', 
                estado: response.data.uf || '', 
            }));
            
        } catch (error) {
            setCepError("Erro ao buscar CEP. Verifique sua conexão.");
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
    // LÓGICA DE CARREGAMENTO DE DADOS (GET - AUTOMÁTICO)
    // ----------------------------------------------------
    const fetchProfile = useCallback(async () => {
        
        if (!user || !token) { 
            setIsLoading(false);
            if (!token) navigate('/login');
            return; 
        }
        
        setIsLoading(true);
        setApiError(null);

        try {
            const response = await axios.get(API_BASE_URL, {
                headers: {
                    Authorization: `Token ${token}` 
                }
            });
            
            const apiData = response.data;
            const profile = apiData.profile || {}; 
            const profilePictureUrl = profile.profile_picture_url || DEFAULT_AVATAR;
            
            // ATUALIZA O ESTADO LOCAL DO PERFIL
            setProfileData({
                email: apiData.email,
                // <--- PONTO CRUCIAL: PEGA is_professional DO BACKEND
                is_professional: apiData.is_professional, 
                
                full_name: profile.full_name || '',
                phone_number: profile.phone_number || '',
                cpf: profile.cpf || '',
                bio: profile.bio || '',
                cep: profile.cep || '', 
                cidade: profile.cidade || '',
                estado: profile.estado || '',

                street: profile.street || '', 
                number: profile.number || '',
                complement: profile.complement || '', 
                neighborhood: profile.neighborhood || '',
                
                profilePictureUrl: profilePictureUrl,
            });

            // ATUALIZA O ESTADO NO CONTEXTO
            if(typeof setUserRole === 'function') {
                setUserRole(apiData.is_professional);
            }
            
            setIsProfileFetched(true); 

        } catch (error) {
            if (error.response?.status === 401) {
                alert("Sessão expirada. Redirecionando para login.");
                if(typeof logout === 'function') logout();
                navigate('/login');
            }
            setApiError("Falha ao carregar dados do perfil. Verifique as credenciais da API.");
            console.error("Erro ao buscar perfil:", error);
        } finally {
            setIsLoading(false); 
        }
    }, [token, user, navigate, setUserRole, logout]); 
    
    // ----------------------------------------------------
    // LÓGICA DE EFEITO (useEffect)
    // ----------------------------------------------------
    useEffect(() => {
        if (user && token && !isNavigating && !isProfileFetched) { 
            fetchProfile();
        } else if (!token && !isLoading) { 
            navigate('/login');
        }
    }, [user, token, navigate, fetchProfile, isNavigating, isProfileFetched, isLoading]); 
    
    
    const handlePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setProfilePictureFile(file);
        setApiError(null);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, profilePictureUrl: reader.result }));
        };
        reader.readAsDataURL(file);

        // LÓGICA DE UPLOAD (MOCK)
        alert("A foto de perfil seria enviada para a API aqui.");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setApiError(null);
        
        const dataToSubmit = {
            full_name: profileData.full_name,
            phone_number: profileData.phone_number,
            cpf: profileData.cpf,
            bio: profileData.bio,
            cep: profileData.cep,
            cidade: profileData.cidade,
            estado: profileData.estado,
            street: profileData.street,
            number: profileData.number,
            complement: profileData.complement,
            neighborhood: profileData.neighborhood,
        };

        try {
            await axios.put(API_BASE_URL, dataToSubmit, {
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Atualiza o nome no AuthContext após salvar com sucesso
            if (typeof setUserName === 'function') {
                setUserName(profileData.full_name); 
            }
            
            alert("Perfil atualizado com sucesso!");

        } catch (error) {
            setApiError("Erro ao salvar alterações. Verifique o console para mais detalhes.");
            console.error("Erro ao salvar perfil:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // ----------------------------------------------------
    // FUNÇÃO DE ALTERAÇÃO DE PAPEL (CORRIGIDA)
    // ----------------------------------------------------
    const toggleRole = async () => {
        if (!token) return;
        
        const newStatus = !profileData.is_professional; 
        
        try {
            // 1. CHAMA A API PARA MUDAR O PAPEL
            await axios.patch(API_ROLE_URL, { is_professional: newStatus }, {
                headers: { Authorization: `Token ${token}` }
            });

            // 2. FORÇA O RECARREGAMENTO COMPLETO DOS DADOS DO PERFIL
            // Isso garante que o is_professional mais atualizado do backend 
            // seja puxado para o profileData e o AuthContext (via fetchProfile).
            await fetchProfile(); // <--- CHAVE PARA SINCRONIZAÇÃO
            
            alert(`Status alterado para: ${newStatus ? 'Profissional' : 'Cliente'}!`);

            // 3. REDIRECIONAMENTO CONDICIONAL
            if (newStatus === true && user?.id) { 
                navigate(`/professional/${user.id}`); 
            }

        } catch (error) {
            setApiError(`Falha ao alternar papel. Erro: ${error.response?.data?.detail || error.message}`);
            console.error("Erro ao alterar papel:", error);
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
                <p className="mt-2">Carregando dados do perfil...</p>
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
                            {/* Componente MyDemandsSection importado localmente */}
                            <MyDemandsSection 
                                currentPage={currentPage}
                                itemsPerPage={itemsPerPage}
                            />
                            
                            {/* RENDERIZAÇÃO DA PAGINAÇÃO */}
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

export default ProfileManagement;