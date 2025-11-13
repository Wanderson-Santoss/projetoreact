import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Pagination } from 'react-bootstrap'; 
import { Star, CalendarCheck, Share2, MessageSquare, MapPin, Zap, AlertTriangle, Pencil, Camera, Trash2, X, Check, Clock, Edit, CheckCircle, ListChecks, UserPlus } from 'lucide-react'; 

// 🚨 CORREÇÃO 1: Importação de Autenticação (CRÍTICA)
import { useAuth } from './AuthContext'; 

// Endpoint para buscar o perfil 
const BASE_PROFILE_URL = '/api/v1/accounts/profissionais/';

// --- SIMULAÇÃO DE DADOS ---
// Defina aqui o ID do usuário logado para simular o modo proprietário.
// ATENÇÃO: Use este mesmo ID (ou o ID real do usuário logado) nos arquivos de Profile e Header.
// const SIMULATED_LOGGED_IN_USER_ID = '2024'; // <--- LINHA COMENTADA/IGNORADA
// const isClientLoggedIn = true; // <--- LINHA COMENTADA/IGNORADA
// --------------------------

// Simulação de Dados de Mídia (Mantido)
const initialMedia = [
    { id: 1, label: 'Cozinha', url: 'https://via.placeholder.com/100/ffb564/000000?text=Cozinha_1', type: 'image' }, 
    { id: 2, label: 'Banheiro', url: 'https://via.placeholder.com/100/87ceeb/000000?text=Banheiro_2', type: 'image' }, 
    { id: 3, label: 'Sala', url: 'https://via.placeholder.com/100/90ee90/000000?text=Sala_3', type: 'image' }, 
];

// Dados de Padrão/Fallback
const DEFAULT_PROFILE_DATA = {
    user_id: 999,
    full_name: "PROFISSIONAL GENÉRICO (FALHA API)", // Nome de fallback mais claro
    servico_principal: "Serviços Diversos",
    cidade: "São Gonçalo",
    estado: "RJ",
    rating: 4.2,
    feedback_count: 5,
    demands_completed: 10,
    descricao_servicos: "Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos.",
    cnpj: '00.000.000/0000-00',
};


const ProfessionalProfileView = () => {
    // 🚨 CORREÇÃO 2: Obter dados reais do AuthContext
    const { userId, isAuthenticated } = useAuth(); // Obtém o ID real
    const { id } = useParams(); 
    const navigate = useNavigate(); 
    
    // CÁLCULO REAL DE PROPRIEDADE
    const isProfileOwner = isAuthenticated && userId?.toString() === id; 
    const isClientLoggedIn = isAuthenticated; // Usa o estado real de autenticação

    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareMessage, setShareMessage] = useState(null); 
    
    // isOwner agora inicializa com o valor real
    const [isOwner, setIsOwner] = useState(isProfileOwner); // CORRIGIDO
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({});
    const [activeDemandFilter, setActiveDemandFilter] = useState('Ativo'); 
    const [media, setMedia] = useState(initialMedia);
    
    const [profilePicture, setProfilePicture] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false); 
    
    const [currentPage, setCurrentPage] = useState(1); 
    const itemsPerPage = 6; 
    const initialSchedule = {
        segunda: true, terca: true, quarta: true, quinta: true, 
        sexta: true, sabado: false, domingo: false,
    };
    const [schedule, setSchedule] = useState(initialSchedule);


    // Dados derivados (Usando optional chaining: ?. )
    const rating = professional?.rating || 0; 
    const feedbackCount = professional?.feedback_count || 0;
    const satisfactionRate = Math.round((rating / 5) * 100); 
    const demandsCompleted = professional?.demands_completed || 0; 
    const demandCounts = { Ativo: 5, 'Em Negociação': 12, Concluídas: 42 };

    // ----------------------------------------------------
    // LÓGICA DE PAGINAÇÃO (Mantida)
    // ----------------------------------------------------
    const totalPages = Math.ceil(media.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMedia = media.slice(indexOfFirstItem, indexOfLastItem);
    
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };
    
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5; 

        if (totalPages <= maxVisiblePages) {
            for (let number = 1; number <= totalPages; number++) {
                items.push(
                    <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                        {number}
                    </Pagination.Item>
                );
            }
        } else {
            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages, currentPage + 1);

            if (currentPage > 1) {
                items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
                if (startPage > 2) {
                    items.push(<Pagination.Ellipsis key="start-ellipsis" />);
                }
            } else {
                items.push(<Pagination.Item key={1} active={true} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
            }

            for (let number = Math.max(2, startPage); number <= endPage; number++) {
                if (number < totalPages) {
                    items.push(
                        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                            {number}
                        </Pagination.Item>
                    );
                }
            }

            if (currentPage < totalPages) {
                 if (endPage < totalPages - 1) {
                    items.push(<Pagination.Ellipsis key="end-ellipsis" />);
                }
                items.push(<Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
            } else if (totalPages > 1) {
                 items.push(<Pagination.Item key={totalPages} active={true} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
            }
        }
        
        return (
            <Pagination className="justify-content-center mt-3" size="sm">
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {items}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            </Pagination>
        );
    };

    // ----------------------------------------------------
    // FUNÇÕES DE FETCH E EDIÇÃO 
    // ----------------------------------------------------

    const fetchProfile = useCallback(async () => {
        if (!id) {
             setError("ID do profissional ausente na URL.");
             setLoading(false);
             return;
        }
        
        setLoading(true);
        setError(null);
        
        const detailUrl = `${BASE_PROFILE_URL}${id}/`;

        // LÓGICA DE PROPRIEDADE DE FALLBACK/SIMULAÇÃO:
        // 🚨 LINHA REMOVIDA
        // const fallbackIsOwner = id === SIMULATED_LOGGED_IN_USER_ID; 
        // setIsOwner(fallbackIsOwner); 
        
        try {
            const response = await axios.get(detailUrl);
            const responseData = response.data;
            
            setProfessional(responseData); 
            setEditableData(responseData); 
            
            // Revalida o isOwner (usando o valor real calculado no topo)
            setIsOwner(isProfileOwner);
            
            // Simulação de Acompanhamento (Seguir)
            if (!isOwner && isClientLoggedIn) { 
                 setIsFollowing(responseData.id === 1); 
            } else {
                 setIsFollowing(false); 
            }
            
        } catch (err) {
            console.error(`Erro ao carregar perfil (ID: ${id}):`, err.response || err);
            
            if (err.response && (err.response.status === 404 || err.response.status === 400)) {
                 setError("Perfil não encontrado ou inválido. Exibindo dados de fallback.");
                 
                 setProfessional({ ...DEFAULT_PROFILE_DATA, user_id: id }); 
                 setEditableData({ ...DEFAULT_PROFILE_DATA, user_id: id });
                 // isOwner já foi definido (isProfileOwner)
            } else {
                 setError(`Não foi possível carregar o perfil do ID ${id}. Verifique a conexão ou a API.`);
                 setProfessional(null); 
            }

        } finally {
            setLoading(false); 
        }
    }, [id, isClientLoggedIn, isProfileOwner, userId]); // Adicionado userId e isProfileOwner às dependências

    useEffect(() => {
        setIsEditing(false); 
        // 🚨 CORREÇÃO 3: Garantir que o estado interno 'isOwner' esteja sincronizado
        setIsOwner(isProfileOwner);
        fetchProfile();
    }, [id, isProfileOwner, fetchProfile]); // Adicionado isProfileOwner como dependência

    const handleEditToggle = () => {
        if (isOwner) {
            setIsEditing(!isEditing);
            if (isEditing) {
                // Ao cancelar, restaura os dados originais
                setEditableData(professional);
            }
        }
    };
    
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const dataToSave = { ...editableData, is_available: isAvailable };
            // AQUI VOCÊ FARIA O PATCH REAL
            // await axios.patch(`${BASE_PROFILE_URL}${id}/`, dataToSave); 
            
            setProfessional(dataToSave);
            setIsEditing(false);
            showShareMessage('Perfil atualizado com sucesso!', 'success');
        } catch (err) {
            showShareMessage('Erro ao salvar o perfil.', 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleScheduleChange = (day) => {
        setSchedule(prev => ({ ...prev, [day]: !prev[day] }));
    };
    
    const handleFollowToggle = () => {
        if (!isClientLoggedIn) {
            showShareMessage('Para seguir um profissional, você precisa estar logado! Por favor, faça login ou crie uma conta.', 'warning');
            return;
        }

        const newState = !isFollowing;
        setIsFollowing(newState);

        if (newState) {
            const name = professional?.full_name?.split(' ')[0] || 'o profissional';
            showShareMessage(`Você começou a seguir ${name}!`, 'success');
        } else {
            const name = professional?.full_name?.split(' ')[0] || 'o profissional';
            showShareMessage(`Você deixou de seguir ${name}.`, 'info');
        }
    };

    const handleServiceRequest = () => {
        if (!isClientLoggedIn) {
             showShareMessage('Para solicitar um serviço, você precisa estar logado! Por favor, faça login ou crie uma conta.', 'warning');
             return;
        }
        
        navigate('/criar-demanda', { 
            state: { 
                professional: { 
                    id: professional.id, 
                    full_name: professional.full_name,
                    servico_principal: professional.servico_principal,
                } 
            } 
        });
    };


    const handleProfilePictureChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (upload) => {
                setProfilePicture(upload.target.result); 
                showShareMessage('Nova foto de perfil selecionada!', 'info');
            };
            
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelection = (e) => {
        if (!isOwner) return; 
        const files = e.target.files;
        if (!files.length) return;

        let filesProcessed = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (upload) => {
                const newMediaItem = {
                    id: Date.now() + i, 
                    label: file.name,
                    url: upload.target.result, 
                    type: file.type.startsWith('video/') ? 'video' : 'image', 
                };
                
                setMedia(prev => {
                    const newMedia = [...prev, newMediaItem];
                    
                    const newTotalPages = Math.ceil(newMedia.length / itemsPerPage);
                    if (currentPage < newTotalPages) {
                         setCurrentPage(newTotalPages);
                    }
                    
                    return newMedia;
                });
                
                filesProcessed++;
                if (filesProcessed === files.length) {
                    showShareMessage(`${files.length} item(ns) de mídia adicionado(s) (Simulado)!`, 'success');
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const handleDeleteMedia = (idToDelete) => {
        if (!isOwner) return; 
        setMedia(prev => {
            const newMedia = prev.filter(item => item.id !== idToDelete);
            
            const newTotalPages = Math.ceil(newMedia.length / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalPages === 0) {
                setCurrentPage(1);
            }
            
            return newMedia;
        });
        showShareMessage('Item de mídia removido!', 'success');
    };


    const showShareMessage = (message, variant = 'info') => {
        setShareMessage({ message, variant });
        setTimeout(() => {
            setShareMessage(null);
        }, 3000); 
    };

    const handleShare = async () => {
        const profileUrl = window.location.href;
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(profileUrl);
                showShareMessage('Link do perfil copiado para a área de transferência!', 'success');
                return;
            } catch (err) {
                console.warn('Falha ao usar navigator.clipboard, tentando fallback:', err);
            }
        } 
        try {
            document.execCommand('copy', false, profileUrl);
            showShareMessage('Link do perfil copiado (fallback executado)!', 'success');
        } catch (err) {
            showShareMessage('Seu navegador não suporta cópia automática.', 'warning');
        }
    };


    // ----------------------------------------------------
    // RENDERIZAÇÃO
    // ----------------------------------------------------

    if (loading) {
        return (
            <Container className="text-center py-4" style={{ minHeight: '80vh', color: 'var(--dark-text)' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="mt-2" style={{ color: 'var(--light-text)' }}>Carregando perfil...</p>
            </Container>
        );
    }

    if (!professional) return null; 

    
    const displayName = isEditing 
        ? (editableData.full_name || 'Profissional Sem Nome') 
        : (professional?.full_name || 'Profissional Sem Nome'); 


    return (
        <Container className="py-4" style={{ color: 'var(--dark-text)' }}> 
            
            {/* INDICADORES DE DEBUG NO TOPO - ADICIONADO PARA AJUDAR NA SUA VALIDAÇÃO */}
            <Row className="mb-2">
                <Col>
                    <Alert variant="info" className="p-1 text-center small mb-0">
                        DEBUG: Dono: <strong className={isProfileOwner ? 'text-success' : 'text-danger'}>{isProfileOwner.toString()}</strong> | 
                        Editando: <strong className={isEditing ? 'text-success' : 'text-danger'}>{isEditing.toString()}</strong> | 
                        Usuário Logado ID: <strong>{userId || 'N/A'}</strong> | Perfil ID: <strong>{id}</strong>
                    </Alert>
                </Col>
            </Row>
            {/* FIM INDICADORES DE DEBUG */}


            {shareMessage && (
                <Alert variant={shareMessage.variant} onClose={() => setShareMessage(null)} dismissible className="sticky-top mb-3 shadow-lg" style={{ top: '15px', zIndex: 10 }}> 
                    {shareMessage.message}
                </Alert>
            )}
            
            {error && professional?.user_id?.toString() !== DEFAULT_PROFILE_DATA.user_id.toString() && (
                <Alert variant="danger" className="mb-3 text-center">
                    {error}
                </Alert>
            )}
            {/* Este alerta é acionado se a API falhar e retornar o nome genérico */}
            {professional?.full_name?.toString() === DEFAULT_PROFILE_DATA.full_name.toString() && (
                 <Alert variant="danger" className="mb-3 text-center">
                    Não foi possível carregar os dados reais do profissional (ID: {id}). A API falhou. Exibindo perfil genérico!
                </Alert>
            )}


            <Row className="justify-content-center">
                <Col lg={11} xl={10}>
                    {/* CABEÇALHO DO PERFIL */}
                    <Card className="bg-vagali-dark-card mb-3 p-3 shadow-lg" style={{ borderColor: 'var(--header-bg)' }}>
                        <Row className="align-items-center">
                            <Col md={8} className="d-flex align-items-center">
                                {/* Avatar/Iniciais com Lógica de Edição */}
                                <div className="rounded-circle d-inline-flex align-items-center justify-content-center me-3 shadow-sm flex-shrink-0" style={{ width: '70px', height: '70px', backgroundColor: 'var(--header-bg)', border: `2px solid var(--primary-color)`, position: 'relative' }} >
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Foto de Perfil" className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                                            {/* Usa optional chaining aqui também, apenas por segurança */}
                                            {displayName ? displayName[0] : 'P'}
                                        </h3>
                                    )}
                                    {/* Botão de Câmera (Trocar Foto) - Somente Dono e Editando */}
                                    {isOwner && isEditing && (
                                        <>
                                            <input type="file" id="profilePictureInput" accept="image/*" onChange={handleProfilePictureChange} style={{ display: 'none' }} />
                                            <label htmlFor="profilePictureInput" className="rounded-circle d-flex align-items-center justify-content-center" style={{ position: 'absolute', bottom: 0, right: 0, width: '25px', height: '25px', backgroundColor: 'var(--primary-color)', color: 'white', cursor: 'pointer', zIndex: 5, border: '2px solid var(--header-bg)' }}>
                                                <Camera size={14} />
                                            </label>
                                        </>
                                    )}
                                </div>
                                {/* Informações Principais */}
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ color: 'var(--dark-text)' }}>
                                        {displayName}
                                    </h2>
                                    {isEditing ? (
                                        <Form.Control 
                                            type="text" 
                                            name="servico_principal" 
                                            value={editableData.servico_principal || ''} 
                                            onChange={handleChange} 
                                            className="form-control-dark small mt-1" 
                                            placeholder="Serviço Principal"
                                        />
                                    ) : (
                                        <p className="lead small mb-1 fw-medium text-warning">{professional.servico_principal || 'Serviço Não Definido'}</p>
                                    )}
                                    
                                    <p className="small text-muted mb-0 d-flex align-items-center" style={{ color: 'var(--light-text)' }}>
                                        <MapPin size={14} className="me-1" style={{ color: 'var(--primary-color)' }} /> 
                                        {isEditing ? (
                                            <>
                                                <Form.Control 
                                                    type="text" 
                                                    name="cidade" 
                                                    value={editableData.cidade || ''} 
                                                    onChange={handleChange} 
                                                    className="form-control-dark small me-1" 
                                                    placeholder="Cidade"
                                                    style={{ width: '120px', display: 'inline' }}
                                                />
                                                /
                                                <Form.Control 
                                                    type="text" 
                                                    name="estado" 
                                                    value={editableData.estado || ''} 
                                                    onChange={handleChange} 
                                                    className="form-control-dark small ms-1" 
                                                    placeholder="Estado"
                                                    style={{ width: '50px', display: 'inline' }}
                                                />
                                            </>
                                        ) : (
                                            `${professional.cidade || 'Não Informada'}, ${professional.estado || 'UF'}`
                                        )}
                                    </p>
                                </div>
                            </Col>
                            
                            {/* Coluna de Ações (Direita) */}
                            <Col md={4} className="d-flex flex-column align-items-end mt-2 mt-md-0">
                                {/* BOTÃO PRINCIPAL DO CABEÇALHO */}
                                {isOwner ? (
                                    /* Opções de Edição para o Dono (EDITAR PERFIL / CANCELAR) */
                                    <Button 
                                        variant={isEditing ? 'danger' : 'primary'} 
                                        size="sm" 
                                        className="mb-2 w-75 fw-bold"
                                        onClick={handleEditToggle} // ESTE BOTÃO CONTROLA O MODO EDIÇÃO INLINE
                                    >
                                        {isEditing ? (<><X size={16} className="me-1" /> CANCELAR</>) : (<><Pencil size={16} className="me-1" /> EDITAR PERFIL</>)}
                                    </Button>
                                ) : (
                                    /* Botão SEGUIR para o Cliente/Visitante */
                                    <Button 
                                        size="sm" 
                                        variant={isFollowing ? 'success' : 'outline-primary'} 
                                        className="mb-2 w-75 fw-bold"
                                        onClick={handleFollowToggle}
                                        style={isFollowing ? { color: 'white' } : { borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                                    >
                                        {isFollowing ? (
                                            <><Check size={16} className="me-1" /> SEGUINDO</>
                                        ) : (
                                            <><UserPlus size={16} className="me-1" /> SEGUIR</>
                                        )}
                                    </Button>
                                )}

                                <div className="mb-2">
                                    {/* Estrelas de Avaliação */}
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            fill={i < Math.floor(rating) ? "var(--primary-color)" : "#ccc"} 
                                            color={i < Math.floor(rating) ? "var(--primary-color)" : "#ccc"} 
                                            size={18} 
                                            className="mx-0" 
                                        />
                                    ))}
                                    <span className="ms-2 small" style={{ color: 'var(--dark-text)' }}>({rating.toFixed(1)}/5)</span>
                                </div>
                                <Button size="sm" variant="outline-secondary" onClick={handleShare} className="w-75" style={{ borderColor: 'var(--light-text)', color: 'var(--light-text)' }}>
                                    <Share2 size={16} className="me-2" /> Compartilhar
                                </Button>
                            </Col>
                        </Row>
                        {isOwner && isEditing && (
                            <div className="mt-3 text-end">
                                <Button variant="success" size="sm" className="fw-bold" onClick={handleSaveProfile} >
                                    <Check size={16} className="me-1" /> SALVAR ALTERAÇÕES
                                </Button>
                            </div>
                        )}
                    </Card>

                    <Row>
                        <Col md={7}>
                            {/* Card de Estatísticas */}
                            <Card className="bg-vagali-dark-card p-3 mb-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    <Zap size={18} className="me-1" style={{ color: 'var(--primary-color)' }} /> Destaques
                                </h4>
                                <Row className="text-center">
                                    <Col xs={4}>
                                        <div className="fw-bold fs-5 text-warning">{demandsCompleted}</div>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Serviços Comp.</p>
                                    </Col>
                                    <Col xs={4}>
                                        <div className="fw-bold fs-5" style={{ color: 'var(--dark-text)' }}>{feedbackCount}</div>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Avaliações</p>
                                    </Col>
                                    <Col xs={4}>
                                        <div className="fw-bold fs-5" style={{ color: 'var(--dark-text)' }}>{satisfactionRate}%</div>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Satisfação</p>
                                    </Col>
                                </Row>
                                
                                {isOwner && isEditing && (
                                    <div className="mt-3 border-top pt-3" style={{ borderTopColor: 'var(--header-bg) !important' }}>
                                        <h5 className="small fw-bold" style={{ color: 'var(--dark-text)' }}>Status de Atendimento</h5>
                                        <Form.Check 
                                            type="switch"
                                            id="custom-switch"
                                            label={isAvailable ? "Disponível para novos projetos" : "Indisponível (Pausado)"}
                                            checked={isAvailable}
                                            onChange={() => setIsAvailable(!isAvailable)}
                                            className={isAvailable ? 'text-success' : 'text-danger'}
                                        />
                                    </div>
                                )}
                                
                            </Card>

                            {/* Seção Sobre o Profissional */}
                            <Card className="bg-vagali-dark-card p-3 mb-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold d-flex justify-content-between align-items-center" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    Sobre o Profissional {isOwner && isEditing && <Edit size={16} style={{ color: 'var(--primary-color)' }} />}
                                </h4>
                                {isEditing ? (
                                    <Form.Group>
                                        <Form.Control as="textarea" rows={5} name="descricao_servicos" value={editableData.descricao_servicos || ''} onChange={handleChange} className="form-control-dark small" placeholder="Descreva sua experiência, formação e serviços. Use linhas para separar as informações." />
                                    </Form.Group>
                                ) : (
                                    <p style={{ color: 'var(--light-text)', whiteSpace: 'pre-line' }} className="small">
                                        {professional?.descricao_servicos || "Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos."}
                                    </p>
                                )}
                                <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>CNPJ: {professional?.cnpj || 'Não Informado'}</p>
                            </Card>

                            {/* Seção de Portfólio/Mídia */}
                            <Card className="bg-vagali-dark-card mb-3 p-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold d-flex justify-content-between align-items-center" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    Portfólio & Mídia {isOwner && isEditing && (
                                        <>
                                            {/* Input oculto para seleção de arquivos */}
                                            <input type="file" id="portfolioMediaInput" accept="image/*,video/*" multiple onChange={handleFileSelection} style={{ display: 'none' }} />
                                            {/* Botão Adicionar, ligado ao Input Oculto - Visível apenas para o Dono em Edição */}
                                            <label htmlFor="portfolioMediaInput" style={{ cursor: 'pointer' }}>
                                                <Button size="sm" variant="outline-primary" as="span">
                                                    <Camera size={16} /> Adicionar
                                                </Button>
                                            </label>
                                        </>
                                    )}
                                </h4>
                                <Row className="g-3">
                                    {currentMedia.map(item => (
                                        <Col key={item.id} md={4} xs={6}>
                                            <div className="ratio ratio-1x1 bg-dark rounded shadow-sm overflow-hidden" style={{ border: '1px solid var(--header-bg)' }}>
                                                {/* Container do Item de Mídia */}
                                                <div className="d-flex align-items-center justify-content-center position-relative">
                                                    {item.type === 'video' ? (
                                                        <video src={item.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    )}
                                                    {/* Badge de Tipo/Nome */}
                                                    <span className="badge bg-warning text-dark position-absolute bottom-0 start-0 m-1 small">
                                                        {item.label} {item.type === 'video' ? '(Video)' : '(Foto)'}
                                                    </span>
                                                    {isOwner && isEditing && (
                                                        <Button 
                                                            variant="danger" 
                                                            size="sm" 
                                                            className="p-0 rounded-circle position-absolute top-0 end-0 m-1" 
                                                            style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            onClick={() => handleDeleteMedia(item.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                    {currentMedia.length === 0 && (
                                        <Col xs={12} className="text-center text-muted small p-4">
                                            Nenhuma mídia adicionada.
                                        </Col>
                                    )}
                                </Row>
                                {/* Controles de Paginação */}
                                {totalPages > 1 && renderPaginationItems()}
                            </Card>

                            {/* Seção de Agenda - Visível apenas para o profissional em edição */}
                            {isOwner && isEditing && (
                                <Card className="bg-vagali-dark-card p-3 mb-3 shadow-lg">
                                    <h4 className="border-bottom pb-2 mb-3 fw-bold" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                        <CalendarCheck size={18} className="me-1" style={{ color: 'var(--primary-color)' }} /> Disponibilidade de Trabalho
                                    </h4>
                                    <div className="d-flex flex-wrap justify-content-start g-2">
                                        {Object.keys(schedule).map(day => (
                                            <Button 
                                                key={day} 
                                                size="sm" 
                                                variant={schedule[day] ? 'success' : 'outline-secondary'} 
                                                className="me-2 mb-2 fw-bold"
                                                style={schedule[day] ? { color: 'var(--dark-text)' } : {}}
                                                onClick={() => handleScheduleChange(day)}
                                            >
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </Button>
                                        ))}
                                    </div>
                                    <Alert variant="info" className="small mt-3 mb-0 p-2 text-center text-muted">
                                        Clique para definir os dias da semana em que você costuma estar disponível para trabalho.
                                    </Alert>
                                </Card>
                            )}
                            
                        </Col> 
                        
                        {/* Coluna das Ações Flutuantes (Direita) - 5/12 */}
                        <Col md={5} className="mt-3 mt-md-0">
                            {/* Bloco de Contato/Ações (Opções Rápidas) */}
                            <Card className="bg-vagali-dark-card p-3 shadow-lg mb-3">
                                <h5 className="text-center mb-3 fw-bold" style={{ color: 'var(--dark-text)' }}>
                                    {isOwner ? 'Opções Rápidas' : 'Entre em Contato'}
                                </h5>

                                {/* BOTÃO PRINCIPAL DE AÇÃO */}
                                {isOwner ? (
                                    /* Dono: Gerenciar Meus Serviços */
                                    <Button 
                                        as={Link} 
                                        to={`/profile-management`} 
                                        variant="warning" 
                                        size="md" 
                                        className="w-100 mb-2 fw-bold text-dark"
                                    >
                                        <ListChecks size={16} className="me-2" /> GERENCIAR PERFIL
                                    </Button>
                                ) : (
                                    /* Visitante: Solicitar Serviço */
                                    <Button 
                                        variant="primary" 
                                        size="md" 
                                        className="w-100 mb-2 fw-bold"
                                        onClick={handleServiceRequest}
                                        disabled={!isAvailable || !isClientLoggedIn}
                                    >
                                        <CalendarCheck size={16} className="me-2" /> SOLICITAR SERVIÇO
                                    </Button>
                                )}
                                
                                {/* BOTÃO CONSULTAR AGENDA (Apenas para Visitantes) */}
                                {!isOwner && (
                                    <Button 
                                        variant="outline-secondary" 
                                        size="md" 
                                        className="w-100 mb-2 fw-bold" 
                                        disabled={true} 
                                    >
                                        <CalendarCheck size={16} className="me-2" /> CONSULTAR AGENDA
                                    </Button>
                                )}
                                
                                {/* BOTÃO ENVIAR MENSAGEM */}
                                <Button 
                                    variant="outline-primary" 
                                    size="md" 
                                    className="w-100 mb-2 fw-bold" 
                                    style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                                    disabled={!isClientLoggedIn} 
                                >
                                    <MessageSquare size={16} className="me-2" /> ENVIAR MENSAGEM
                                </Button>
                                
                                {/* DENUNCIAR CONTA - SÓ APARECE SE ESTIVER LOGADO E NÃO FOR O DONO */}
                                {!isOwner && isClientLoggedIn && (
                                    <Button variant="link" className="small w-100 mt-2 text-muted" style={{ color: 'var(--light-text)' }}> 
                                        <AlertTriangle size={14} className="me-1" style={{ color: 'red' }} /> DENUNCIAR CONTA
                                    </Button>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalProfileView;