import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
// Importação do Pagination e Switch adicionado aqui:
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Pagination } from 'react-bootstrap'; 
// Importação de icones
import { Star, CalendarCheck, Share2, MessageSquare, MapPin, Zap, AlertTriangle, Pencil, Camera, Trash2, X, Check, Clock, Edit, CheckCircle, ListChecks } from 'lucide-react'; 

// Endpoint para buscar o perfil 
const BASE_PROFILE_URL = '/api/v1/accounts/profissionais/';

// Simulação de Dados de Mídia para o modo de edição (Atualizado para incluir a propriedade 'type')
const initialMedia = [
    // Substituindo a cor por uma URL de placeholder para simular imagem
    { id: 1, label: 'Cozinha', url: 'https://via.placeholder.com/100/ffb564/000000?text=Cozinha_1', type: 'image' }, 
    { id: 2, label: 'Banheiro', url: 'https://via.placeholder.com/100/87ceeb/000000?text=Banheiro_2', type: 'image' }, 
    { id: 3, label: 'Sala', url: 'https://via.placeholder.com/100/90ee90/000000?text=Sala_3', type: 'image' }, 
    { id: 4, label: 'Elétrica', url: 'https://via.placeholder.com/100/ff6961/000000?text=Eletrica_4', type: 'image' }, 
    { id: 5, label: 'Pintura', url: 'https://via.placeholder.com/100/a0a0a0/000000?text=Pintura_5', type: 'image' }, 
    { id: 6, label: 'Jardim', url: 'https://via.placeholder.com/100/66bb6a/000000?text=Jardim_6', type: 'image' },
    { id: 7, label: 'Telhado', url: 'https://via.placeholder.com/100/795548/000000?text=Telhado_7', type: 'image' },
    { id: 8, label: 'Piscina', url: 'https://via.placeholder.com/100/03a9f4/000000?text=Piscina_8', type: 'image' },
    { id: 9, label: 'Garagem', url: 'https://via.placeholder.com/100/78909c/000000?text=Garagem_9', type: 'image' },
    { id: 10, label: 'Varanda', url: 'https://via.placeholder.com/100/ff8a65/000000?text=Varanda_10', type: 'image' }, 
    { id: 11, label: 'Escada', url: 'https://via.placeholder.com/100/ba68c8/000000?text=Escada_11', type: 'image' }, 
    { id: 12, label: 'Sótão', url: 'https://via.placeholder.com/100/ffee58/000000?text=Sotao_12', type: 'image' }, 
];

const ProfessionalProfileView = () => {
    const { id } = useParams(); 
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [shareMessage, setShareMessage] = useState(null); 
    
    // NOVO ESTADO: Verifica se é o dono do perfil para habilitar a edição/dashboard
    const [isOwner, setIsOwner] = useState(true); // Simulação: Assume que o usuário é o dono
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({});
    const [activeDemandFilter, setActiveDemandFilter] = useState('Ativo'); // Estado para o filtro de demandas
    const [media, setMedia] = useState(initialMedia);
    
    // NOVO ESTADO: Foto de Perfil (Simulação)
    const [profilePicture, setProfilePicture] = useState(null);
    // NOVO ESTADO: Status de Disponibilidade
    const [isAvailable, setIsAvailable] = useState(true);

    // ESTADOS DE PAGINAÇÃO
    const [currentPage, setCurrentPage] = useState(1); // Inicia na página 1
    const itemsPerPage = 6; // 6 itens por página

    // Dados de Exemplo (Estes campos devem existir no JSON retornado pela sua API)
    const rating = professional?.rating || 4.8; 
    const feedbackCount = professional?.feedback_count || 15;
    const isClientLoggedIn = localStorage.getItem('userToken'); // Simulação de login
    const satisfactionRate = Math.round((rating / 5) * 100); 
    const demandsCompleted = professional?.demands_completed || 42; 

    // Simulação de demandas (para o novo bloco)
    const demandCounts = {
        Ativo: 5,
        'Em Negociação': 12,
        Concluídas: 42,
    };
    
    // Simulação da Agenda (Dias da Semana)
    const initialSchedule = {
        segunda: true,
        terca: true,
        quarta: true,
        quinta: true,
        sexta: true,
        sabado: false,
        domingo: false,
    };
    const [schedule, setSchedule] = useState(initialSchedule);


    // ----------------------------------------------------
    // LÓGICA DE PAGINAÇÃO
    // ----------------------------------------------------
    const totalPages = Math.ceil(media.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMedia = media.slice(indexOfFirstItem, indexOfLastItem);
    
    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };
    
    // Função auxiliar para renderizar os itens de paginação (Mantida)
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
    // FUNÇÕES DE FETCH E EDIÇÃO (Mantidas)
    // ----------------------------------------------------

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_PROFILE_URL}${id}/`);
            setProfessional(response.data); 
            setEditableData(response.data); 
        } catch (err) {
            console.error("Erro ao carregar perfil:", err.response || err);
            setError("Não foi possível carregar o perfil. Verifique a conexão.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id, fetchProfile]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setEditableData(professional);
        }
    };
    
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Simulação: Incluir o status na chamada de save (isAvailable)
            const dataToSave = { ...editableData, is_available: isAvailable };
            // await axios.patch(`${BASE_PROFILE_URL}${id}/`, dataToSave); 
            
            // Simulação de sucesso
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
    
    // ----------------------------------------------------
    // FUNÇÃO DE MUDANÇA DE FOTO DE PERFIL (Mantida)
    // ----------------------------------------------------
    const handleProfilePictureChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = (upload) => {
                setProfilePicture(upload.target.result); // Simula o upload da imagem
                showShareMessage('Nova foto de perfil selecionada!', 'info');
            };
            
            reader.readAsDataURL(file);
        }
    };

    // ----------------------------------------------------
    // FUNÇÃO DE ADICIONAR MÍDIA REAL (NOVA)
    // ----------------------------------------------------
    
    const handleFileSelection = (e) => {
        const files = e.target.files;
        if (!files.length) return;

        let filesProcessed = 0;
        
        // Use Promise.all ou um loop com contador para garantir a ordem/estado correto após todos os uploads
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = (upload) => {
                const newMediaItem = {
                    id: Date.now() + i, // Garante ID único mesmo em uploads múltiplos
                    label: file.name,
                    url: upload.target.result, // Data URL para exibição local
                    type: file.type.startsWith('video/') ? 'video' : 'image', // Define o tipo de renderização
                };
                
                setMedia(prev => {
                    const newMedia = [...prev, newMediaItem];
                    
                    // Se a adição criar uma nova página, move para ela (logica ajustada)
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
        setMedia(prev => {
            const newMedia = prev.filter(item => item.id !== idToDelete);
            
            // Após remover, verifica se a página atual existe, senão volta uma página
            const newTotalPages = Math.ceil(newMedia.length / itemsPerPage);
            if (currentPage > newTotalPages && newTotalPages > 0) {
                setCurrentPage(newTotalPages);
            } else if (newTotalPages === 0) {
                setCurrentPage(1); // Garante que a página seja 1 se todos forem excluídos
            }
            
            return newMedia;
        });
        showShareMessage('Item de mídia removido!', 'success');
    };


    // ----------------------------------------------------
    // FUNÇÕES GERAIS DE UI (Mantidas)
    // ----------------------------------------------------

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

    if (error) {
        return (
            <Container className="py-4" style={{ minHeight: '80vh' }}>
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    if (!professional) return null;

    const displayName = isEditing ? (editableData.full_name || 'Profissional Sem Nome') : (professional.full_name || 'Profissional Sem Nome');


    return (
        // Aplicando cores de tema CLARO para o container de texto
        <Container className="py-4" style={{ color: 'var(--dark-text)' }}> 
            
            {shareMessage && (
                <Alert variant={shareMessage.variant} onClose={() => setShareMessage(null)} dismissible className="sticky-top mb-3 shadow-lg" style={{ top: '15px', zIndex: 10 }}> 
                    {shareMessage.message}
                </Alert>
            )}

            <Row className="justify-content-center">
                <Col lg={11} xl={10}>
                    {/* CABEÇALHO DO PERFIL (Mantido shadow-lg, conforme solicitado) */}
                    <Card className="bg-vagali-dark-card mb-3 p-3 shadow-lg" style={{ borderColor: 'var(--header-bg)' }}> 
                        <Row className="align-items-center">
                            
                            <Col md={8} className="d-flex align-items-center">
                                {/* Avatar/Iniciais com Lógica de Edição */}
                                <div 
                                    className="rounded-circle d-inline-flex align-items-center justify-content-center me-3 shadow-sm flex-shrink-0" 
                                    style={{ 
                                        width: '70px', 
                                        height: '70px', 
                                        backgroundColor: 'var(--header-bg)',
                                        border: `2px solid var(--primary-color)`,
                                        position: 'relative' // Necessário para posicionar o botão da câmera
                                    }}
                                >
                                    {profilePicture ? (
                                        <img 
                                            src={profilePicture} 
                                            alt="Foto de Perfil" 
                                            className="rounded-circle"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    ) : (
                                        <h3 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}> 
                                            {displayName ? displayName[0] : 'P'}
                                        </h3>
                                    )}
                                    
                                    {/* Botão de Câmera (Trocar Foto) */}
                                    {isOwner && isEditing && (
                                        <>
                                            <input
                                                type="file"
                                                id="profilePictureInput"
                                                accept="image/*"
                                                onChange={handleProfilePictureChange}
                                                style={{ display: 'none' }}
                                            />
                                            <label 
                                                htmlFor="profilePictureInput" 
                                                className="rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: '24px',
                                                    height: '24px',
                                                    backgroundColor: 'var(--accent-color)',
                                                    cursor: 'pointer',
                                                    border: '2px solid white',
                                                    color: 'white'
                                                }}
                                            >
                                                <Camera size={14} />
                                            </label>
                                        </>
                                    )}
                                </div>
                                
                                <div className="flex-grow-1">
                                    {isEditing ? (
                                        <Form.Group className="mb-1">
                                            <Form.Control
                                                type="text"
                                                name="full_name"
                                                value={editableData.full_name || ''}
                                                onChange={handleChange}
                                                className="form-control-dark"
                                                placeholder="Nome Completo"
                                            />
                                        </Form.Group>
                                    ) : (
                                        <h3 className="fw-bold mb-0" style={{ color: 'var(--dark-text)' }}>{displayName}</h3> 
                                    )}

                                    <p className="fs-6 mb-1" style={{ color: 'var(--primary-color)' }}>
                                        <Zap size={16} className="me-1" />
                                        {professional.servico_principal || 'Serviço Principal'}
                                    </p>

                                    {isEditing ? (
                                        <Form.Group className="mb-0">
                                            <Row className="g-1">
                                                <Col xs={6}>
                                                    <Form.Control
                                                        type="text"
                                                        name="cidade"
                                                        value={editableData.cidade || ''}
                                                        onChange={handleChange}
                                                        className="form-control-dark small"
                                                        placeholder="Cidade"
                                                    />
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Control
                                                        type="text"
                                                        name="estado"
                                                        value={editableData.estado || ''}
                                                        onChange={handleChange}
                                                        className="form-control-dark small"
                                                        placeholder="Estado"
                                                    />
                                                </Col>
                                            </Row>
                                        </Form.Group>
                                    ) : (
                                        <p className="mb-0 small" style={{ color: 'var(--light-text)' }}>
                                            <MapPin size={14} className="me-1" />
                                            {professional.cidade || 'Cidade não informada'}, {professional.estado || 'Estado'}
                                        </p>
                                    )}
                                </div>
                            </Col>
                            
                            <Col md={4} className="text-end d-flex flex-column align-items-end mt-2 mt-md-0">
                                {/* Botão de Edição (Somente para o dono) */}
                                {isOwner && (
                                    <Button 
                                        variant={isEditing ? 'danger' : 'primary'} 
                                        size="sm" 
                                        className="mb-2 w-75 fw-bold" 
                                        onClick={handleEditToggle}
                                    >
                                        {isEditing ? (<><X size={16} className="me-1" /> CANCELAR</>) : (<><Pencil size={16} className="me-1" /> EDITAR PERFIL</>)}
                                    </Button>
                                )}
                                
                                <div className="mb-2">
                                    {/* Estrelas de Avaliação */}
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} fill={i < Math.floor(rating) ? "var(--primary-color)" : "#ccc"} color={i < Math.floor(rating) ? "var(--primary-color)" : "#ccc"} size={18} className="mx-0" />
                                    ))}
                                    <span className="ms-2 small" style={{ color: 'var(--dark-text)' }}>({rating.toFixed(1)}/5)</span>
                                </div>
                                
                                {!isOwner && isClientLoggedIn && ( // Somente se for cliente e não o dono
                                    <Button size="sm" variant="outline-primary" className="mb-2 w-75 fw-bold" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>
                                        + SEGUIR
                                    </Button>
                                )}
                                
                                <Button size="sm" variant="outline-secondary" onClick={handleShare} className="w-75" style={{ borderColor: 'var(--light-text)', color: 'var(--light-text)' }}>
                                    <Share2 size={16} className="me-2" /> Compartilhar
                                </Button>
                            </Col>
                        </Row>
                        {isEditing && (
                            <div className="mt-3 text-end">
                                <Button 
                                    variant="success" 
                                    size="sm" 
                                    className="fw-bold" 
                                    onClick={handleSaveProfile}
                                >
                                    <Check size={16} className="me-1" /> SALVAR ALTERAÇÕES
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* CONTEÚDO PRINCIPAL E AÇÕES */}
                    <Row>
                        
                        {/* Coluna de Conteúdo (Esquerda) - 7/12 */}
                        <Col md={7}>
                            
                            {/* Seção de Estatísticas Rápidas (Compacta) */}
                            {/* Mantido: 3 cards lado a lado (md=4) */}
                            <Row className="mb-3 g-2"> 
                                <Col xs={12} md={4}> 
                                    {/* Satisfação */}
                                    <Card className="bg-vagali-dark-card p-3 text-center h-100 shadow-lg"> 
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>{satisfactionRate}%</h5>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Satisfação</p>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}> 
                                    {/* Demandas */}
                                    <Card className="bg-vagali-dark-card p-3 text-center h-100 shadow-lg"> 
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--accent-color)' }}>{demandsCompleted}</h5>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Demandas</p>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}> 
                                    {/* Status (Ativo/Inativo) - NOVO COMPONENTE */}
                                    <Card className="bg-vagali-dark-card p-2 text-center h-100 shadow-lg d-flex flex-column justify-content-center"> 
                                        {isOwner && isEditing ? (
                                            <Form.Group className="d-flex align-items-center justify-content-center flex-column h-100">
                                                <Form.Check 
                                                    type="switch"
                                                    id="availability-switch"
                                                    label=""
                                                    checked={isAvailable}
                                                    onChange={() => setIsAvailable(!isAvailable)}
                                                    className="mb-1"
                                                />
                                                <span className="fw-bold small" style={{ color: isAvailable ? 'green' : 'red' }}>
                                                    {isAvailable ? 'ATIVO' : 'INATIVO'}
                                                </span>
                                            </Form.Group>
                                        ) : (
                                            <>
                                                <h5 className="mb-0 fw-bold" style={{ color: isAvailable ? 'green' : 'red' }}>
                                                    {isAvailable ? 'Ativo' : 'Inativo'}
                                                </h5> 
                                                <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Status</p>
                                            </>
                                        )}
                                    </Card>
                                </Col>
                            </Row>
                            
                            {/* Seção Sobre o Profissional - Com shadow-lg (Mantida) */}
                            <Card className="bg-vagali-dark-card p-3 mb-3 shadow-lg"> 
                                <h4 className="border-bottom pb-2 mb-3 fw-bold d-flex justify-content-between align-items-center" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    Sobre o Profissional
                                    {isOwner && isEditing && <Edit size={16} style={{ color: 'var(--primary-color)' }} />}
                                </h4>
                                
                                {isEditing ? (
                                    <Form.Group>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            name="descricao_servicos"
                                            value={editableData.descricao_servicos || ''}
                                            onChange={handleChange}
                                            className="form-control-dark small"
                                            placeholder="Descreva sua experiência, formação e serviços. Use linhas para separar as informações."
                                        />
                                    </Form.Group>
                                ) : (
                                    <p style={{ color: 'var(--light-text)', whiteSpace: 'pre-line' }} className="small">
                                        {professional.descricao_servicos || "Nenhuma descrição detalhada fornecida ainda. Aqui será exibida a formação, experiência e CNPJ, se fornecidos."}
                                    </p>
                                )}
                                <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>CNPJ: {professional.cnpj || 'Não Informado'}</p>
                            </Card>

                            {/* Seção de Portfólio/Mídia - Com shadow-lg (Atualizada) */}
                            <Card className="bg-vagali-dark-card mb-3 p-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold d-flex justify-content-between align-items-center" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    Portfólio & Mídia
                                    {isOwner && isEditing && (
                                        <>
                                            {/* Input oculto para seleção de arquivos */}
                                            <input
                                                type="file"
                                                id="portfolioMediaInput"
                                                accept="image/*,video/*"
                                                multiple
                                                onChange={handleFileSelection}
                                                style={{ display: 'none' }}
                                            />
                                            {/* Botão Adicionar, ligado ao Input Oculto */}
                                            <label htmlFor="portfolioMediaInput" style={{ cursor: 'pointer' }}>
                                                <Button size="sm" variant="outline-primary" as="span">
                                                    <Camera size={16} /> Adicionar
                                                </Button>
                                            </label>
                                        </>
                                    )}
                                </h4>
                                <Row className="gx-2">
                                    {/* Mapeamento usando APENAS a mídia da página atual */}
                                    {currentMedia.map((item) => ( 
                                        <Col 
                                            // 3 por linha
                                            xs={4} 
                                            className="mb-2" 
                                            key={item.id}
                                        >
                                            <div 
                                                style={{ 
                                                    height: '100px', 
                                                    borderRadius: '6px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    position: 'relative', 
                                                    overflow: 'hidden',
                                                    backgroundColor: '#333' // Fundo escuro para mídias
                                                }}
                                                className="small text-dark fw-bold shadow-sm"
                                            >
                                                {/* Conteúdo de Mídia */}
                                                {item.type === 'video' ? (
                                                    <video 
                                                        src={item.url} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                        controls={false} 
                                                        muted 
                                                        loop 
                                                        autoPlay 
                                                    />
                                                ) : (
                                                    <img 
                                                        src={item.url} 
                                                        alt={item.label} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                    />
                                                )}
                                                
                                                {/* Overlay para o label e botão de exclusão */}
                                                <div style={{
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Overlay escuro
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    textShadow: '1px 1px 2px #000'
                                                }}>
                                                    <span className="text-center px-1 small text-truncate w-100">{item.label}</span>
                                                    {item.type === 'video' && <span className="small">(Video)</span>}

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
                            
                            {/* Seção de Agenda (Novo bloco, visível apenas para o profissional em edição) - Com shadow-lg (Mantida) */}
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
                                    <Alert variant="info" className="small mt-3 mb-0 p-2 text-center" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--dark-text)' }}>
                                        Clique para alternar entre Disponível (Verde) e Indisponível (Cinza).
                                    </Alert>
                                </Card>
                            )}

                            {/* Seção de Feedbacks - Com shadow-lg (Mantida) */}
                            <Card className="bg-vagali-dark-card p-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>Feedbacks ({feedbackCount})</h4>
                                <p style={{ color: 'var(--light-text)' }} className="small mb-0">Aqui serão exibidos os comentários dos clientes com estrelas e datas.</p>
                            </Card>

                        </Col>
                        
                        {/* Coluna das Ações Flutuantes (Direita) - 5/12 */}
                        <Col md={5} className="mt-3 mt-md-0">
                            
                            {/* Bloco de Contato/Ações (Opções Rápidas) - Com shadow-lg (Mantida) */}
                            <Card className="bg-vagali-dark-card p-3 shadow-lg mb-3"> 
                                <h5 className="text-center mb-3 fw-bold" style={{ color: 'var(--dark-text)' }}>
                                    {isOwner ? 'Opções Rápidas' : 'Entre em Contato'}
                                </h5>
                                
                                {/* BOTÃO PRINCIPAL DE AÇÃO (Gerenciar Meus Dados ou Solicitar Serviços) */}
                                {isOwner ? (
                                    <Button 
                                        as={Link} // Link para a tela de Gerenciamento de Dados Pessoais
                                        to="/meu-perfil"
                                        variant="warning" 
                                        size="md" 
                                        className="w-100 mb-2 fw-bold text-white" 
                                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                    >
                                        <Edit size={16} className="me-1" /> GERENCIAR MEUS DADOS
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="warning" 
                                        size="md" 
                                        className="w-100 mb-2 fw-bold text-white" 
                                        style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                    >
                                        SOLICITAR SERVIÇOS
                                    </Button>
                                )}

                                
                                {/* BOTÃO CONSULTAR AGENDA */}
                                <Button 
                                    as={Link}
                                    to={`/professional/${id}/schedule`}
                                    variant="outline-warning" 
                                    size="md" 
                                    className="w-100 mb-2 fw-bold" 
                                    style={{ color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                >
                                    <CalendarCheck size={16} className="me-2" /> CONSULTAR AGENDA
                                </Button>
                                
                                {/* BOTÃO ENVIAR MENSAGEM */}
                                <Button 
                                    variant="outline-primary" 
                                    size="md" 
                                    className="w-100 mb-2 fw-bold" 
                                    style={{ color: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                                >
                                    <MessageSquare size={16} className="me-2" /> ENVIAR MENSAGEM
                                </Button>
                                
                                <Button variant="link" className="small w-100 mt-2 text-muted" style={{ color: 'var(--light-text)' }}> 
                                    <AlertTriangle size={14} className="me-1" style={{ color: 'red' }} /> DENUNCIAR CONTA
                                </Button>
                            </Card>

                            {/* Bloco de Gerenciamento de Demandas - Com shadow-lg (Mantida) */}
                            {isOwner && (
                                <Card className="bg-vagali-dark-card p-3 shadow-lg"> 
                                    <h5 className="text-center mb-3 fw-bold" style={{ color: 'var(--dark-text)' }}>
                                        <ListChecks size={18} className="me-1" style={{ color: 'var(--accent-color)' }}/> 
                                        Minhas Demandas
                                    </h5>
                                    
                                    {/* Ajuste fino mantido para estabilidade */}
                                    <Row className="justify-content-between g-1 mb-2">
                                        {['Ativo', 'Em Negociação', 'Concluídas'].map(filter => {
                                            const isActive = activeDemandFilter === filter;
                                            
                                            // Abreviação mantida para garantir a estabilidade do layout em colunas menores
                                            const displayText = filter === 'Em Negociação' ? 'Negoc.' : filter.split(' ')[0];

                                            return (
                                                <Col key={filter} xs={4} className="d-grid"> 
                                                    <Button
                                                        size="sm"
                                                        variant={isActive ? 'primary' : 'outline-secondary'}
                                                        onClick={() => setActiveDemandFilter(filter)}
                                                        className="fw-bold px-0 small" 
                                                        style={{ 
                                                            borderColor: isActive ? 'var(--primary-color)' : 'var(--header-bg)',
                                                            backgroundColor: isActive ? 'var(--primary-color)' : 'transparent',
                                                            color: isActive ? 'white' : 'var(--dark-text)', 
                                                            transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                                            transition: 'all 0.2s ease-in-out',
                                                            lineHeight: '1.2' 
                                                        }}
                                                    >
                                                        {displayText} ({demandCounts[filter]})
                                                    </Button>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                    <Alert variant="light" className="small text-center mb-0 p-2" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--dark-text)' }}>
                                        Visualizando: <strong>{activeDemandFilter}</strong>
                                    </Alert>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalProfileView;