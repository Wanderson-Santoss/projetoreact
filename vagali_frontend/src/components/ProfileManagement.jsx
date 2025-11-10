import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
// Importação de novos ícones Lucide: DollarSign e Trash2
import { User, Pencil, LogOut, Camera, MapPin, Zap, ListChecks, Wrench, HandCoins, Send, DollarSign, Trash2 } from 'lucide-react'; 
import axios from 'axios';

// --- Variáveis de Configuração ---
const ME_URL = '/api/v1/accounts/me/'; 
const DEMANDS_API_URL = '/api/v1/demandas/'; 
const SERVICES_API_URL = '/api/v1/servicos/'; 

// Mapeamento de nomes de serviço para ícones (Mantenha a consistência)
const CATEGORY_ICON_MAP = {
    'Eletricidade': Zap,
    'Pintura': Wrench,
    'Hidráulica': HandCoins, 
    'Outros': Send,
    'Limpeza': Wrench,
};

// ----------------------------------------------------------------------
// COMPONENTE AUXILIAR: SEÇÃO DE DEMANDAS (ATUALIZADO PARA EDIÇÃO/EXCLUSÃO/LAYOUT)
// ----------------------------------------------------------------------
const MyDemandsSection = ({ profileData, onNewDemandClick, demands, loadingDemands, onEdit, onDelete }) => {
    const isClient = !profileData.is_professional;
    
    // Formatação de moeda
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'Aguardando Oferta';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Mapeia o nome do serviço (service_name) para um ícone Lucide
    const getIconForCategory = (serviceName) => {
        const IconComponent = CATEGORY_ICON_MAP[serviceName] || ListChecks;
        return <IconComponent className="me-2" size={18} />;
    };

    if (!isClient) return null;

    return (
        <Card className="mt-5 bg-vagali-dark-card p-4 shadow-lg border-primary border">
            <h3 className="text-primary mb-3 d-flex align-items-center">
                <ListChecks className="me-2" /> Minhas Demandas
            </h3>
            
            <div className="d-grid gap-2 mb-3">
                 <Button 
                    variant="warning"
                    onClick={onNewDemandClick}
                    className="fw-bold py-2"
                    style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                >
                    + Criar Nova Demanda
                </Button>
            </div>
            
            {loadingDemands ? (
                <div className="text-center py-4">
                    <Spinner animation="border" variant="warning" size="sm" />
                    <p className="text-white-50 mt-2">Carregando suas demandas...</p>
                </div>
            ) : demands.length === 0 ? (
                <Alert variant="info" className="text-center">
                    Você ainda não possui nenhuma demanda cadastrada.
                </Alert>
            ) : (
                <div className="space-y-3">
                    {demands.map(demand => {
                        const isPendente = demand.status === 'pendente';
                        const statusDisplay = demand.status.charAt(0).toUpperCase() + demand.status.slice(1).replace('_', ' ');

                        return (
                            <Card 
                                key={demand.id} 
                                className="bg-vagali-card-demand border-secondary mb-3" 
                            >
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        
                                        {/* TÍTULO E DESCRIÇÃO */}
                                        <div>
                                            <Card.Title className="text-white fs-6 mb-1 d-flex align-items-center">
                                                {getIconForCategory(demand.service_name)} **{demand.titulo}**
                                            </Card.Title>
                                            <p className="small text-white-75 mb-1 ms-4 ps-1">
                                                {demand.descricao.substring(0, 80)}{demand.descricao.length > 80 ? '...' : ''}
                                            </p>
                                        </div>
                                        
                                        {/* STATUS */}
                                        <span 
                                            className={`badge ${isPendente ? 'bg-info' : demand.status === 'concluida' ? 'bg-success' : 'bg-primary'} fw-bold flex-shrink-0`}
                                        >
                                            {statusDisplay}
                                        </span>
                                    </div>
                                    
                                    {/* DETALHES E VALOR */}
                                    <Row className="align-items-center pt-2 border-top border-secondary-subtle">
                                        <Col xs={12} md={6} className="text-white-50 small mb-2 mb-md-0 d-flex align-items-center">
                                            <MapPin size={14} className="me-1" /> CEP: <span className="text-info fw-bold">{demand.cep || 'Não informado'}</span>
                                        </Col>
                                        
                                        {/* VALOR (NOVO CAMPO) */}
                                        <Col xs={12} md={6} className="text-end mb-2 mb-md-0">
                                            <span className="text-warning fw-bold d-flex align-items-center justify-content-end">
                                                <DollarSign size={16} className="me-1" />
                                                Valor: {formatCurrency(demand.accepted_offer_value)}
                                            </span>
                                        </Col>
                                    </Row>
                                    
                                    {/* BOTÕES DE EDIÇÃO/EXCLUSÃO (APENAS SE 'PENDENTE') */}
                                    {isPendente && (
                                        <div className="d-flex justify-content-end gap-2 mt-3 border-top border-secondary-subtle pt-3">
                                            <Button 
                                                variant="outline-warning" 
                                                size="sm"
                                                onClick={() => onEdit(demand.id)} // Chama a função de edição
                                                disabled={loadingDemands}
                                            >
                                                <Pencil size={14} className="me-1" /> Editar
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm"
                                                onClick={() => onDelete(demand.id)} // Chama a função de exclusão
                                                disabled={loadingDemands}
                                            >
                                                <Trash2 size={14} className="me-1" /> Excluir
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

// ----------------------------------------------------------------------
// COMPONENTE PRINCIPAL: GERENCIAMENTO DE PERFIL
// ----------------------------------------------------------------------
function ProfileManagement() {
    // Estado inicial com todos os campos, incluindo os novos
    const [profileData, setProfileData] = useState({
        full_name: '', email: '', cpf: '', phone_number: '', is_professional: false,
        bio: '', address: '', cnpj: '', palavras_chave: '',
        cep: '', 
        profile_picture_url: null,
    });
    const [demands, setDemands] = useState([]); 
    const [loadingDemands, setLoadingDemands] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const navigate = useNavigate();
    const userToken = localStorage.getItem('userToken'); 

    // --- FUNÇÕES DE AÇÃO DE DEMANDA ---

    // Função para redirecionar para o formulário de demanda
    const handleNewDemandClick = useCallback(() => {
        navigate('/criar-demanda'); 
    }, [navigate]);

    // Função para EXCLUIR demanda
    const handleDeleteDemand = async (demandId) => {
        if (!window.confirm("Tem certeza que deseja EXCLUIR esta demanda? Esta ação não pode ser desfeita.")) {
            return;
        }

        setError(null);
        setSuccessMessage(null);
        
        try {
            await axios.delete(`${DEMANDS_API_URL}${demandId}/`, {
                headers: { 'Authorization': `Bearer ${userToken}` },
            });
            
            setSuccessMessage(`Demanda #${demandId} excluída com sucesso!`);
            // Atualiza a lista removendo a demanda excluída
            setDemands(prev => prev.filter(d => d.id !== demandId));

        } catch (err) {
            console.error("Erro ao excluir demanda:", err.response || err);
            const errorMsg = err.response?.data?.detail || "Não foi possível excluir. Verifique se o status é 'Pendente'.";
            setError(errorMsg);
        }
    };
    
    // Função para REDIRECIONAR PARA EDIÇÃO
    const handleEditDemand = (demandId) => {
        // Assume que você terá uma rota '/editar-demanda/:id'
        navigate(`/editar-demanda/${demandId}`); 
    };
    
    // --- FUNÇÕES DE PERFIL ---

    const handleToggleEdit = () => {
         setIsEditing(prev => !prev);
         setError(null);
         setSuccessMessage(null);
    };

    // FUNÇÃO PARA BUSCAR AS DEMANDAS DO USUÁRIO CLIENTE
    const fetchDemands = useCallback(async (isProfessional) => {
        if (!userToken || isProfessional) return; 

        setLoadingDemands(true);
        try {
            const response = await axios.get(DEMANDS_API_URL, {
                headers: { 'Authorization': `Bearer ${userToken}` },
            });
            setDemands(response.data); 
        } catch (err) {
            console.error("Erro ao carregar demandas:", err.response || err);
            if (err.response && err.response.status === 401) {
                 setError("Sessão expirada. Redirecionando para login.");
                 localStorage.removeItem('userToken'); 
                 navigate('/login');
            }
        } finally {
            setLoadingDemands(false);
        }
    }, [userToken, navigate]); 

    // --- EFEITO PRINCIPAL DE CARREGAMENTO (Perfil + Demandas) ---
    useEffect(() => {
        const fetchProfileAndDemands = async () => {
            setLoading(true);

            if (!userToken) {
                navigate('/login');
                setLoading(false);
                return;
            }
            
            try {
                // CHAMADA REAL PARA BUSCAR O PERFIL (Substitua esta simulação)
                // const profileResponse = await axios.get(ME_URL, { headers: { 'Authorization': `Bearer ${userToken}` } });
                // const mockData = profileResponse.data;
                
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockData = {
                    full_name: 'Usuário Teste Vagali', email: 'sab@gmail.com',
                    is_professional: false, 
                    cpf: '123.456.789-00', phone_number: '(99) 99999-9999',
                    profile: { bio: '...', address: 'São Gonçalo, RJ', cep: '24400-000', cnpj: '', palavras_chave: [] },
                };

                const mappedData = {
                    ...mockData,
                    ...mockData.profile,
                    palavras_chave: mockData.profile?.palavras_chave.join(', ') || '',
                };
                setProfileData(mappedData);
                
                if (!mockData.is_professional) {
                    // Passa o status de profissional para o fetchDemands
                    await fetchDemands(mockData.is_professional); 
                }

            } catch (err) {
                console.error("Erro ao carregar perfil:", err.response || err);
                
                if (err.response && err.response.status === 401) {
                    setError("Sessão expirada. Faça login novamente.");
                    localStorage.removeItem('userToken'); 
                    navigate('/login');
                    return;
                }

                setError("Erro ao carregar o perfil. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndDemands();
    }, [navigate, userToken, fetchDemands]); 

    const handleChange = (e) => {
        const { id, value } = e.target;
        setProfileData(prev => ({ ...prev, [id]: value }));
        setSuccessMessage(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        
        const dataToSend = {
             // ... (Corpo da requisição de salvar perfil)
        };

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simula salvamento
            setSuccessMessage("Perfil atualizado com sucesso!");
            setIsEditing(false);
        } catch (err) {
            console.error("Erro ao salvar perfil:", err.response || err);
            setError("Não foi possível salvar as alterações. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken'); // Limpa o token
        navigate('/login');
    };
    
    if (loading) {
        return (
            <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" variant="warning" />
                <p className="ms-2 text-white-50">Carregando perfil...</p>
            </Container>
        );
    }
    
    return (
        <Container className="py-5">
             <Card className="bg-vagali-dark-card p-4 shadow-lg mx-auto border-warning border-top-0 border-end-0 border-bottom-0 border-5" style={{ maxWidth: '800px' }}>
                <h2 className="text-center mb-4 text-white fw-bold">
                    <User className="me-2 text-warning" /> Meu Perfil ({profileData.is_professional ? 'Profissional' : 'Cliente'})
                </h2>

                {/* BOTÕES DE AÇÃO (EDITAR/SAIR) */}
                <div className="d-flex justify-content-end gap-2 mb-4">
                    <Button 
                        variant={isEditing ? "danger" : "warning"}
                        onClick={handleToggleEdit} 
                        disabled={isSaving}
                        className="fw-bold"
                        style={!isEditing ? { backgroundColor: '#f59e0b', borderColor: '#f59e0b' } : {}}
                    >
                        {isEditing ? 'Cancelar' : <><Pencil className="me-2" size={18} /> Editar</>}
                    </Button>
                     <Button 
                        variant="secondary"
                        onClick={handleLogout} 
                        className="fw-bold"
                    >
                        <LogOut className="me-2" size={18} /> Sair
                    </Button>
                </div>

                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSave}>
                    
                    {/* Visualização da Foto de Perfil */}
                    <div className="text-center mb-4">
                        <div 
                            className="mx-auto bg-secondary d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '10px' }}
                        >
                            {profileData.profile_picture_url ? (
                                <img src={profileData.profile_picture_url} alt="Foto de Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <Camera size={40} className="text-white-50" />
                            )}
                        </div>
                        {isEditing && (
                            <Button variant="link" size="sm" className="text-warning">
                                Alterar Foto
                            </Button>
                        )}
                    </div>

                    {/* DADOS BASE DO USUÁRIO */}
                    <h5 className="text-white-50 border-bottom border-secondary pb-2 mb-3 mt-3">Informações Pessoais</h5>
                    <Row>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="text-white-50">Nome Completo:</Form.Label><Form.Control type="text" id="full_name" className="form-control-dark" value={profileData.full_name} onChange={handleChange} readOnly={!isEditing} required/></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="text-white-50">E-mail (Acesso):</Form.Label><Form.Control type="email" className="form-control-dark" value={profileData.email} readOnly disabled/></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="text-white-50">CPF:</Form.Label><Form.Control type="text" id="cpf" className="form-control-dark" value={profileData.cpf} onChange={handleChange} readOnly={!isEditing} required maxLength={14}/></Form.Group></Col>
                        <Col md={6}><Form.Group className="mb-3"><Form.Label className="text-white-50">Telefone:</Form.Label><Form.Control type="tel" id="phone_number" className="form-control-dark" value={profileData.phone_number} onChange={handleChange} readOnly={!isEditing}/></Form.Group></Col>
                    </Row>
                    
                    {/* NOVO: CEP e Endereço */}
                    <h5 className="text-white-50 border-bottom border-secondary pb-2 mb-3 mt-3"><MapPin className="me-2" size={18}/> Localização</h5>
                    <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">CEP:</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    id="cep"
                                    className="form-control-dark" 
                                    value={profileData.cep}
                                    onChange={handleChange}
                                    readOnly={!isEditing}
                                    maxLength={9}
                                    placeholder="00000-000"
                                />
                                <Form.Text className="text-white-50">Usado para cálculo de distância.</Form.Text>
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Endereço de Atendimento (Cidade/Bairro):</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    id="address"
                                    className="form-control-dark" 
                                    value={profileData.address}
                                    onChange={handleChange}
                                    readOnly={!isEditing}
                                    placeholder="Ex: Rio de Janeiro, Copacabana"
                                />
                            </Form.Group>
                          </Col>
                    </Row>
                    
                    {/* DADOS DO PERFIL PROFISSIONAL */}
                    {profileData.is_professional && (
                        <div className="professional-fields-block pt-3 mt-4">
                            <h5 className="text-warning border-bottom border-warning pb-2 mb-3">Perfil Profissional</h5>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Sobre Mim (Bio):</Form.Label>
                                <Form.Control as="textarea" rows={3} id="bio" className="form-control-dark" value={profileData.bio} onChange={handleChange} readOnly={!isEditing}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">CNPJ (Opcional):</Form.Label>
                                <Form.Control type="text" id="cnpj" className="form-control-dark" value={profileData.cnpj} onChange={handleChange} readOnly={!isEditing} maxLength={18}/>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-white-50">Palavras-Chave (Separadas por vírgula):</Form.Label>
                                <Form.Control type="text" id="palavras_chave" className="form-control-dark" value={profileData.palavras_chave} onChange={handleChange} readOnly={!isEditing} placeholder="Ex: Eletricista, Reformas, Encanador"/>
                            </Form.Group>
                        </div>
                    )}
                    
                    {/* BOTÃO DE SALVAR */}
                    {isEditing && (
                        <div className="mt-4">
                            <Button 
                                type="submit" 
                                className="w-100 fw-bold py-2"
                                style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
                                disabled={isSaving}
                            >
                                {isSaving ? <Spinner animation="border" size="sm" /> : 'Salvar Alterações'}
                            </Button>
                        </div>
                    )}
                </Form>
                
                {/* --- SEÇÃO DE DEMANDAS --- */}
                <MyDemandsSection 
                    profileData={profileData} 
                    onNewDemandClick={handleNewDemandClick}
                    demands={demands} 
                    loadingDemands={loadingDemands}
                    onEdit={handleEditDemand} 
                    onDelete={handleDeleteDemand}
                />
                
            </Card>
        </Container>
    );
}

export default ProfileManagement;