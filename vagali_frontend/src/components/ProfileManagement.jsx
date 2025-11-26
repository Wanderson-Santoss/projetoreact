import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Collapse, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, User, Repeat, Settings, ListChecks, MapPin, Camera, ChevronDown, ChevronUp, MessageSquare, LogOut, Heart } from 'lucide-react';

// ====================================================================
// IMPORTAÇÕES (Ajuste o caminho conforme a sua estrutura)
// ====================================================================
import { useAuth } from "./AuthContext"; 
// import FollowingProfessionalsList from "./FollowingProfessionalsList"; 
// import MyDemandsSection from "./MyDemandsSection"; 

// ====================================================================
// CONSTANTES E URLS
// ====================================================================
// URL para GET/PATCH do perfil (USADA PARA BUSCAR DADOS E ATUALIZAR PERFIL)
const API_BASE_URL = '/api/v1/accounts/perfil/me/'; 

// 🔑 CORREÇÃO AQUI: Usaremos o mesmo endpoint para a troca de papel
const API_ROLE_URL = API_BASE_URL; // '/api/v1/accounts/perfil/me/' 

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
    const [openProfile, setOpenProfile] = useState(true);

    // ====================================================================
    // FUNÇÃO REUTILIZÁVEL PARA BUSCAR O PERFIL (GET) - ROBUSTA CONTRA 401
    // ====================================================================
    const fetchProfile = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            if (!isAuthenticated) navigate('/login');
            return;
        }

        try {
            // Linha 33
            const response = await axios.get(API_BASE_URL); 
            setProfileData(response.data);
            
            // Acesso seguro usando Optional Chaining (?.)
            const isProfessionalFromAPI = response.data?.user?.is_professional || response.data?.is_professional;
            const fullNameFromAPI = response.data?.profile?.full_name;
            
            const dataToUpdate = {};

            if (fullNameFromAPI) {
                dataToUpdate.full_name = fullNameFromAPI;
            }
            if (isProfessionalFromAPI !== undefined) {
                dataToUpdate.is_professional = isProfessionalFromAPI; 
            }
            
            if (Object.keys(dataToUpdate).length > 0) {
                 updateUserData(dataToUpdate); 
            }

        } catch (err) {
            console.error("Erro ao carregar perfil (GET):", err);
            
            // 🔑 Tratamento de 401: Força o logout e redireciona.
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
    // Linha 57
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
    // FUNÇÃO PARA ALTERAR O PAPEL (CLIENTE <-> PROFISSIONAL)
    // ====================================================================
    const handleRoleSwitch = async () => {
        // Garantindo que user não é nulo antes de acessar is_professional
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
            // 🔑 Requisição PATCH para o endpoint do perfil, usando API_ROLE_URL
            // O backend deve aceitar a atualização do campo is_professional neste endpoint.
            const response = await axios.patch(API_ROLE_URL, { 
                is_professional: newRoleStatus 
            }); 
            
            // 1. Atualiza o Contexto Global com o novo status
            updateUserData({ 
                is_professional: response.data.is_professional,
            });
            
            // 2. Re-sincroniza o estado local do ProfileManagement (opcional, mas bom)
            await fetchProfile(); 
            
            setSuccess(`Papel alterado com sucesso para ${newRoleName}! 🎉`);
            
        } catch (err) {
            console.error('Erro ao alternar papel (PATCH):', err.response?.data || err);
            
            // 🔑 Tratamento de 401 e erros genéricos
            if (err.response && err.response.status === 401) {
                logout(); 
                setError('Sua sessão expirou. Por favor, faça login novamente.');
            } else {
                // Mensagem de erro mais clara em caso de 404/Outro erro
                const message = err.response?.data?.detail || err.message || 'Erro ao alterar o papel. O endpoint pode estar incorreto ou o backend exige mais informações.';
                setError(message);
            }

        } finally {
            setLoading(false);
        }
    };

    // ====================================================================
    // FUNÇÃO PARA ATUALIZAR O PERFIL (PATCH - Nome, Bio, etc.)
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
            
            // 🔑 Tratamento de 401 no PATCH de perfil
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
    
    
    // ... (restante da UI permanece igual) ...
    if (loading || !profileData) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="warning" />
                <p className="text-white-50 mt-2">Carregando perfil...</p>
            </Container>
        );
    }

    const currentRole = user?.is_professional ? 'Profissional' : 'Cliente';
    const nextRole = user?.is_professional ? 'Cliente' : 'Profissional';
    
    return (
        <Container className="my-5">
            <h2 className="text-white mb-4">Gerenciamento de Perfil</h2>
            
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={4} className="mb-4">
                    
                    {/* CARD DE NAVEGAÇÃO / LOGOUT */}
                    <Card className="bg-vagali-dark-card p-3 shadow-sm mt-3">
                         <Button 
                            variant="warning" 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center mb-2"
                            onClick={() => setOpenProfile(!openProfile)}
                        >
                            <User size={20} className="me-2" /> Meu Perfil {openProfile ? <ChevronUp size={20} className="ms-auto" /> : <ChevronDown size={20} className="ms-auto" />}
                        </Button>
                    </Card>

                    {/* === CARD PARA MUDANÇA DE PAPEL === */}
                    <Card className="bg-vagali-dark-card p-3 shadow-sm mt-3">
                        <Button 
                            // Alterna a cor do botão para o papel que está prestes a ser ativado
                            variant={user.is_professional ? 'outline-warning' : 'success'} 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center"
                            onClick={handleRoleSwitch}
                            disabled={loading}
                        >
                            <Repeat size={20} className="me-2" /> 
                            Mudar para {nextRole}
                        </Button>
                        <p className="small text-white-50 mt-2 text-center">
                            Seu papel atual: <span className="fw-bold text-warning">{currentRole}</span>
                        </p>
                    </Card>

                    {/* BOTÃO LOGOUT (Mantenha este por último ou onde desejar) */}
                    <Card className="bg-vagali-dark-card p-3 shadow-sm mt-3">
                        <Button 
                            variant="outline-danger" 
                            className="w-100 fw-bold d-flex justify-content-center align-items-center"
                            onClick={logout}
                        >
                            <LogOut size={20} className="me-2" /> Sair da Conta
                        </Button>
                    </Card>

                </Col>

                <Col md={8}>
                    {/* CARD PRINCIPAL DE PERFIL */}
                    <Card className="bg-vagali-dark-card p-4 shadow mb-4">
                        <Card.Title className="border-bottom border-warning pb-2 mb-3">
                            Informações Pessoais 
                        </Card.Title>

                        <Collapse in={openProfile}>
                            <div>
                                <Form onSubmit={handleProfileUpdate}>
                                     <Row>
                                        <Form.Group as={Col} md={6} controlId="formFullName" className="mb-3">
                                            <Form.Label className="text-white-50">Nome Completo</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="full_name"
                                                value={profileData?.profile?.full_name || ''} 
                                                onChange={handleChange}
                                                className="form-control-dark"
                                                required
                                            />
                                        </Form.Group>

                                        <Form.Group as={Col} md={12} controlId="formBio" className="mb-3">
                                            <Form.Label className="text-white-50">Biografia / Sobre Você</Form.Label>
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
                                        variant="warning" 
                                        className="w-100 fw-bold mt-3 py-2"
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : 'Salvar Alterações'}
                                    </Button>
                                </Form>
                            </div>
                        </Collapse>
                    </Card>
                    
                </Col>
            </Row>
        </Container>
    );
};

export default ProfileManagement;