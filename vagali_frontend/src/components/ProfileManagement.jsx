import React, { useState, useEffect, useCallback } from 'react'; 
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse } from 'react-bootstrap'; 
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios'; 
import { Briefcase, User, Repeat, Settings, ListChecks, MapPin, Camera, Heart, ChevronDown, ChevronUp, MessageSquare, LogOut } from 'lucide-react'; 

import MyDemandsSection from './MyDemandsSection'; 
import { useAuth } from './AuthContext'; // CRÍTICO: Importação do contexto

// CONSTANTES E URLS
const VIACEP_URL = 'https://viacep.com.br/ws/';
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/accounts/perfil/me/'; 
const DEFAULT_AVATAR = 'https://via.placeholder.com/150/007bff/ffffff?text=FOTO';

const ProfileManagement = () => {
    
    const navigate = useNavigate();
    
    // 🚨 CORREÇÃO CRÍTICA: Desestruturando o token e o setUserRole
    const { 
        token, 
        isUserProfessional, 
        setUserRole, // <--- Usando a função correta do contexto
        logout,
        userId // Opcional, para linkar a ProfessionalProfileView
    } = useAuth(); 

    // ESTADOS DE CONTROLE
    const [isInfoCollapsed, setIsInfoCollapsed] = useState(false); 
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [apiError, setApiError] = useState(null);
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState(null);

    // 🚨 ESTADO DO FORMULÁRIO (MATCHING BACKEND SERIALIZER FIELDS)
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
        // Campos de Endereço (temporários/frontend-side, combinados em 'address' se necessário)
        street: '', 
        number: '', 
        complement: '', 
        neighborhood: '', 
        profilePictureUrl: DEFAULT_AVATAR, 
    });

    // ----------------------------------------------------
    // LÓGICA DE BUSCA DO CEP (Inalterada)
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
            const data = response.data;
            if (data.erro) {
                setCepError("CEP não encontrado.");
                setProfileData(prev => ({ ...prev, street: '', neighborhood: '', cidade: '', estado: '', })); 
            } else {
                setProfileData(prev => ({
                    ...prev,
                    street: data.logradouro || '',
                    neighborhood: data.bairro || '',
                    cidade: data.localidade || '', 
                    estado: data.uf || '',         
                }));
            }
        } catch (error) {
            setCepError("Erro ao buscar CEP. Tente novamente.");
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
    useEffect(() => {
        // Se não houver token, redireciona para login ou apenas sai
        if (!token) {
            setIsLoading(false);
            navigate('/login'); 
            return; 
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(API_BASE_URL, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                
                const apiData = response.data;
                const profile = apiData.profile || {}; // Garante que profile existe

                // 🚨 Mapeia os dados da API para o estado do formulário e para o Contexto
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

                    // A API retorna o endereço completo no campo 'address'. 
                    // Se você precisar quebrar em street/number/complement, você precisará de uma função de parse aqui.
                    street: '', 
                    number: '',
                    complement: '', 
                    neighborhood: '',
                    
                    profilePictureUrl: DEFAULT_AVATAR, 
                });

                // 🚨 CRÍTICO: Atualiza o contexto global com o status real do backend
                if(typeof setUserRole === 'function') {
                     setUserRole(apiData.is_professional ? 'Profissional' : 'Cliente');
                }

            } catch (error) {
                setApiError("Falha ao carregar dados do perfil. Tente recarregar a página.");
                console.error("Erro ao buscar perfil:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [token, navigate, setUserRole]); // Dependências

    // ----------------------------------------------------
    // HANDLER DE SUBMISSÃO (PATCH - Salvar Dados Básicos)
    // ----------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setApiError(null);
        
        // Combina os campos de endereço do frontend em um campo 'address' se o seu backend
        // esperar apenas um campo de endereço, ou envie individualmente:
        const addressCombined = `${profileData.street}, ${profileData.number}` + 
                                (profileData.complement ? ` - ${profileData.complement}` : '') + 
                                (profileData.neighborhood ? ` - ${profileData.neighborhood}` : '');
        
        const dataToSend = {
            profile: {
                full_name: profileData.full_name,
                phone_number: profileData.phone_number,
                cpf: profileData.cpf,
                cep: profileData.cep,
                cidade: profileData.cidade,
                estado: profileData.estado,
                // O seu ProfileSerializer precisa aceitar 'address', 'cidade' e 'estado'
                address: addressCombined // Envia o endereço completo
            }
        };
        
        // Remove campos vazios se o PATCH for parcial
        Object.keys(dataToSend.profile).forEach(key => dataToSend.profile[key] === '' && delete dataToSend.profile[key]);

        try {
            const response = await axios.patch(API_BASE_URL, dataToSend, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log("Dados salvos:", response.data);
            alert("Perfil atualizado com sucesso!");

        } catch (error) {
            setApiError("Erro ao salvar alterações. Verifique os dados.");
            console.error("Erro ao salvar perfil:", error.response?.data || error);
        } finally {
            setIsSaving(false);
        }
    };

    // ----------------------------------------------------
    // FUNÇÃO CRÍTICA: TOGGLE ROLE (API CALL)
    // ----------------------------------------------------
    const toggleRole = async () => {
        if (!token) return;
        
        const newStatus = !isUserProfessional;
        
        // 🚨 CRÍTICO: Se estiver mudando para Profissional (true), é bom garantir que os campos
        // obrigatórios (full_name, cpf, etc.) estejam preenchidos antes de enviar.
        
        try {
            await axios.patch(API_BASE_URL, { is_professional: newStatus }, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // 🚨 ATUALIZA O CONTEXTO COM A FUNÇÃO CORRETA
            setUserRole(newStatus ? 'Profissional' : 'Cliente');
            
            // Atualiza o estado local
            setProfileData(prev => ({ ...prev, is_professional: newStatus }));

            alert(`Status alterado para: ${newStatus ? 'Profissional' : 'Cliente'}!`);

        } catch (error) {
            setApiError(`Falha ao alternar papel.`);
            console.error("Erro ao alternar papel:", error.response?.data || error);
        }
    };
    
    const handleLogout = () => {
        if (typeof logout === 'function') {
            logout(); 
        }
    };
    
    // ... (RESTO DO COMPONENTE JSX) ...

    if (isLoading) {
        return (
            <Container className="my-5 text-center">
                <Spinner animation="border" role="status" className="text-primary"/>
                <p className="mt-2">Carregando dados do perfil...</p>
            </Container>
        );
    }
    
    // ... (RESTO DO COMPONENTE JSX) ...

    const nextRole = isUserProfessional ? 'Cliente' : 'Profissional';
    const currentRole = isUserProfessional ? 'Profissional' : 'Cliente';
    const currentRoleIcon = isUserProfessional ? <Briefcase size={20} className="me-2" /> : <User size={20} className="me-2" />;
    
    return (
        <Container className="my-5">
            <h1 className="mb-4 d-flex align-items-center" style={{ color: 'var(--primary-color)' }}>
                <Settings size={32} className="me-2" /> Gerenciamento de Perfil
            </h1>
            
            {apiError && <Alert variant="danger">{apiError}</Alert>}

            <Row>
                <Col md={8}>
                    {/* ... (CARD DE FOTO DE PERFIL - INALTERADO) ... */}
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
                                    // A LÓGICA DE UPLOAD DA FOTO DEVE SER IMPLEMENTADA AQUI
                                    // onChange={handlePictureUpload}
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
                                {/* USANDO userId do contexto */}
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