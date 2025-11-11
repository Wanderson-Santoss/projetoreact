import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
// Importação do Pagination adicionado aqui:
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, Pagination } from 'react-bootstrap'; 
// CORREÇÃO: Ícones adicionados para evitar tela branca
import { Star, CalendarCheck, Share2, MessageSquare, MapPin, Zap, AlertTriangle, Pencil, Camera, Trash2, X, Check, Clock, Edit, CheckCircle, ListChecks } from 'lucide-react'; 

// Endpoint para buscar o perfil 
const BASE_PROFILE_URL = '/api/v1/accounts/profissionais/';

// Simulação de Dados de Mídia para o modo de edição (Aumentado para testar a paginação)
const initialMedia = [
    { id: 1, label: 'Cozinha', color: '#ffb564', url: 'https://via.placeholder.com/100/ffb564/000000?text=Cozinha_1' }, 
    { id: 2, label: 'Banheiro', color: '#87ceeb', url: 'https://via.placeholder.com/100/87ceeb/000000?text=Banheiro_2' }, 
    { id: 3, label: 'Sala', color: '#90ee90', url: 'https://via.placeholder.com/100/90ee90/000000?text=Sala_3' }, 
    { id: 4, label: 'Elétrica', color: '#ff6961', url: 'https://via.placeholder.com/100/ff6961/000000?text=Eletrica_4' }, 
    { id: 5, label: 'Pintura', color: '#a0a0a0', url: 'https://via.placeholder.com/100/a0a0a0/000000?text=Pintura_5' }, 
    { id: 6, label: 'Jardim', color: '#66bb6a', url: 'https://via.placeholder.com/100/66bb6a/000000?text=Jardim_6' },
    { id: 7, label: 'Telhado', color: '#795548', url: 'https://via.placeholder.com/100/795548/000000?text=Telhado_7' },
    { id: 8, label: 'Piscina', color: '#03a9f4', url: 'https://via.placeholder.com/100/03a9f4/000000?text=Piscina_8' },
    { id: 9, label: 'Garagem', color: '#78909c', url: 'https://via.placeholder.com/100/78909c/000000?text=Garagem_9' },
    { id: 10, label: 'Varanda', color: '#ff8a65', url: 'https://via.placeholder.com/100/ff8a65/000000?text=Varanda_10' }, 
    { id: 11, label: 'Escada', color: '#ba68c8', url: 'https://via.placeholder.com/100/ba68c8/000000?text=Escada_11' }, 
    { id: 12, label: 'Sótão', color: '#ffee58', url: 'https://via.placeholder.com/100/ffee58/000000?text=Sotao_12' }, 
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
    
    // Função auxiliar para renderizar os itens de paginação
    const renderPaginationItems = () => {
        let items = [];
        const maxVisiblePages = 5; 

        if (totalPages <= maxVisiblePages) {
            // Mostrar todos os números
            for (let number = 1; number <= totalPages; number++) {
                items.push(
                    <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                        {number}
                    </Pagination.Item>
                );
            }
        } else {
            // Lógica para mostrar '...'
            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages, currentPage + 1);

            // Item 1
            if (currentPage > 1) {
                items.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
                if (startPage > 2) {
                    items.push(<Pagination.Ellipsis key="start-ellipsis" />);
                }
            } else {
                items.push(<Pagination.Item key={1} active={true} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
            }

            // Páginas no meio
            for (let number = Math.max(2, startPage); number <= endPage; number++) {
                if (number < totalPages) {
                    items.push(
                        <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
                            {number}
                        </Pagination.Item>
                    );
                }
            }

            // Item Final
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
            // API call para salvar os dados:
            // await axios.patch(`${BASE_PROFILE_URL}${id}/`, editableData); 
            
            // Simulação de sucesso
            setProfessional(editableData);
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
    // FUNÇÕES DE MÍDIA
    // ----------------------------------------------------
    
    const handleAddMedia = (e) => {
        // Simulação de adicionar nova mídia
        const newMediaItem = {
            id: Date.now(),
            label: `Novo Item ${media.length + 1}`,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            url: `https://via.placeholder.com/100/${Math.floor(Math.random()*16777215).toString(16)}/000000?text=Novo`
        };
        setMedia(prev => [...prev, newMediaItem]);
        showShareMessage('Item de mídia adicionado (Simulado)!', 'success');
        
        // Se a adição criar uma nova página, move para ela
        if ((media.length + 1) > totalPages * itemsPerPage) {
             setCurrentPage(totalPages + 1);
        }
    };

    const handleDeleteMedia = (idToDelete) => {
        setMedia(prev => prev.filter(item => item.id !== idToDelete));
        showShareMessage('Item de mídia removido!', 'success');
        // Após remover, verifica se a página atual existe, senão volta uma página
        const newTotalPages = Math.ceil((media.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages);
        } else if (newTotalPages === 0) {
            setCurrentPage(1); // Garante que a página seja 1 se todos forem excluídos
        }
    };


    // ----------------------------------------------------
    // FUNÇÕES GERAIS DE UI
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
                                {/* Avatar/Iniciais */}
                                <div 
                                    className="rounded-circle d-inline-flex align-items-center justify-content-center me-3 shadow-sm flex-shrink-0" 
                                    style={{ 
                                        width: '70px', 
                                        height: '70px', 
                                        backgroundColor: 'var(--header-bg)', // Fundo claro para UI sutis
                                        border: `2px solid var(--primary-color)` 
                                    }}
                                >
                                    <h3 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}> 
                                        {displayName ? displayName[0] : 'P'}
                                    </h3>
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
                                    {/* shadow-lg mantido */}
                                    <Card className="bg-vagali-dark-card p-3 text-center h-100 shadow-lg"> 
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>{satisfactionRate}%</h5>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Satisfação</p>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}> 
                                    {/* shadow-lg mantido */}
                                    <Card className="bg-vagali-dark-card p-3 text-center h-100 shadow-lg"> 
                                        <h5 className="mb-0 fw-bold" style={{ color: 'var(--accent-color)' }}>{demandsCompleted}</h5>
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Demandas</p>
                                    </Card>
                                </Col>
                                <Col xs={12} md={4}> 
                                    {/* shadow-lg mantido */}
                                    <Card className="bg-vagali-dark-card p-3 text-center h-100 shadow-lg"> 
                                        <h5 className="text-success mb-0 fw-bold">Ativo</h5> 
                                        <p className="small text-muted mb-0" style={{ color: 'var(--light-text)' }}>Status</p>
                                    </Card>
                                </Col>
                            </Row>
                            
                            {/* Seção Sobre o Profissional - Com shadow-lg */}
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

                            {/* Seção de Portfólio/Mídia - Com shadow-lg */}
                            <Card className="bg-vagali-dark-card mb-3 p-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold d-flex justify-content-between align-items-center" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>
                                    Portfólio & Mídia
                                    {isOwner && isEditing && (
                                        <Button size="sm" variant="outline-primary" onClick={handleAddMedia}>
                                            <Camera size={16} /> Adicionar
                                        </Button>
                                    )}
                                </h4>
                                <Row className="gx-2">
                                    {/* Mapeamento usando APENAS a mídia da página atual */}
                                    {currentMedia.map((item, i) => ( 
                                        <Col 
                                            // 3 por linha
                                            xs={4} 
                                            className="mb-2" 
                                            key={item.id} // Chave deve ser única (usando item.id)
                                        >
                                            <div 
                                                style={{ 
                                                    // Altura ajustada
                                                    height: '100px', 
                                                    backgroundColor: item.color, 
                                                    borderRadius: '6px', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    position: 'relative', 
                                                    overflow: 'hidden' 
                                                }}
                                                className="small text-dark fw-bold shadow-sm"
                                            >
                                                {item.label}
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
                                        </Col>
                                    ))}
                                </Row>
                                
                                {/* Controles de Paginação */}
                                {totalPages > 1 && renderPaginationItems()}

                            </Card>
                            
                            {/* Seção de Agenda (Novo bloco, visível apenas para o profissional em edição) - Com shadow-lg */}
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

                            {/* Seção de Feedbacks - Com shadow-lg */}
                            <Card className="bg-vagali-dark-card p-3 shadow-lg">
                                <h4 className="border-bottom pb-2 mb-3 fw-bold" style={{ color: 'var(--dark-text)', borderBottomColor: 'var(--header-bg) !important' }}>Feedbacks ({feedbackCount})</h4>
                                <p style={{ color: 'var(--light-text)' }} className="small mb-0">Aqui serão exibidos os comentários dos clientes com estrelas e datas.</p>
                            </Card>

                        </Col>
                        
                        {/* Coluna das Ações Flutuantes (Direita) - 5/12 */}
                        <Col md={5} className="mt-3 mt-md-0">
                            
                            {/* Bloco de Contato/Ações (Opções Rápidas) - Com shadow-lg */}
                            <Card className="bg-vagali-dark-card p-3 shadow-lg mb-3"> 
                                <h5 className="text-center mb-3 fw-bold" style={{ color: 'var(--dark-text)' }}>
                                    {isOwner ? 'Opções Rápidas' : 'Entre em Contato'}
                                </h5>
                                
                                {/* BOTÃO PRINCIPAL DE AÇÃO */}
                                <Button 
                                    variant="warning" 
                                    size="md" 
                                    className="w-100 mb-2 fw-bold text-white" 
                                    style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                                >
                                    {isOwner ? (<><Edit size={16} className="me-1" /> GERENCIAR MEUS DADOS</>) : 'SOLICITAR SERVIÇOS'}
                                </Button>
                                
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

                            {/* Bloco de Gerenciamento de Demandas - Com shadow-lg */}
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