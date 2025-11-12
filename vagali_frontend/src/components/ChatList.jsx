import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Button, Row, Col, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { MessageSquare, Trash2, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- DADOS SIMULADOS DE CONVERSAS ---
const MOCKED_CONVERSATIONS = [
    { id: 1, professional_id: 123, name: 'Marcos Eletricista Silva', service: 'Eletricidade', lastMessage: 'Estou disponível para a visita amanhã.', unread: 1, timestamp: '10:30' },
    { id: 2, professional_id: 456, name: 'Ana Pintora Souza', service: 'Pintura', lastMessage: 'Qual é a cor que você prefere para o quarto?', unread: 0, timestamp: 'Ontem' },
    { id: 3, professional_id: 789, name: 'Pedro Hidráulico Gomes', service: 'Hidráulica', lastMessage: 'Ok, fechado! Envio o orçamento final.', unread: 0, timestamp: '01/11/2025' },
];

// ==========================================================
// COMPONENTE PRINCIPAL: CHAT LIST
// ==========================================================
const ChatList = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Lógica para carregar as conversas (Simulação)
    const fetchConversations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Simula a busca na API
            await new Promise(resolve => setTimeout(resolve, 500)); 
            setConversations(MOCKED_CONVERSATIONS);
        } catch (err) {
            console.error("Erro ao carregar conversas:", err);
            setError('Não foi possível carregar suas conversas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    // 2. Função para Deletar a Conversa
    const handleDeleteConversation = async (conversationId, professionalName) => {
        
        if (!window.confirm(`Tem certeza que deseja DELETAR a conversa com ${professionalName}? Esta ação não pode ser desfeita e irá APAGAR TODO O HISTÓRICO.`)) {
            return;
        }
        
        try {
            // Simulação de Deletar na API (necessário no ambiente real)
            // await axios.delete(`/api/v1/chat/conversations/${conversationId}/`);
            
            // Atualiza o estado: Remove a conversa da lista
            setConversations(prev => prev.filter(conv => conv.id !== conversationId));
            
            alert(`A conversa com ${professionalName} foi deletada com sucesso (Simulado).`);

        } catch (error) {
            console.error("Erro ao deletar conversa:", error);
            alert("Erro ao deletar conversa. Tente novamente.");
        }
    };

    // 3. Lógica para Abrir o Chat
    const handleOpenChat = (conv) => {
        // Redireciona para o componente ChatWrapper, passando o ID da conversa no estado
        navigate(`/chat/${conv.id}`, { 
            state: { 
                conversationId: conv.id,
                professional: {
                    id: conv.professional_id,
                    full_name: conv.name,
                    servico_principal: conv.service,
                }
            } 
        });
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="warning" />
            </Container>
        );
    }
    
    if (error) {
         return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className="bg-vagali-dark-card p-4 shadow-lg">
                        <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--dark-text)' }}>
                            <MessageSquare size={24} className="me-2" style={{color: 'var(--accent-color)'}} />
                            Minhas Conversas
                        </h2>

                        {conversations.length === 0 ? (
                            <Alert variant="info" className="text-center" style={{ backgroundColor: '#404040', color: 'var(--light-text)', borderColor: 'var(--header-bg)' }}>
                                Você não tem nenhuma conversa ativa.
                            </Alert>
                        ) : (
                            <ListGroup variant="flush">
                                {conversations.map(conv => (
                                    <ListGroup.Item 
                                        key={conv.id}
                                        className="d-flex justify-content-between align-items-center bg-vagali-dark-card p-3 border-bottom border-secondary"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        
                                        {/* Detalhes da Conversa */}
                                        <div onClick={() => handleOpenChat(conv)} className="flex-grow-1 d-flex align-items-center me-3">
                                            {/* Ícone de Avatar/Inicial */}
                                            <div className="rounded-circle me-3 text-center text-dark fw-bold flex-shrink-0" 
                                                style={{ width: '45px', height: '45px', lineHeight: '45px', fontSize: '1.2rem', backgroundColor: 'var(--accent-color)' }}>
                                                {conv.name[0]}
                                            </div>
                                            
                                            <div>
                                                <div className="fw-bold" style={{ color: 'var(--dark-text)' }}>{conv.name}</div>
                                                <div className="small text-muted" style={{ color: 'var(--light-text)' }}>
                                                    {conv.lastMessage}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ações e Status */}
                                        <div className="d-flex align-items-center flex-shrink-0">
                                            {conv.unread > 0 && (
                                                <Badge pill bg="primary" className="me-3" style={{ backgroundColor: 'var(--primary-color)' }}>
                                                    {conv.unread}
                                                </Badge>
                                            )}
                                            
                                            {/* BOTÃO DE DELETAR CONVERSA */}
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="p-1 me-2"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); // Impede o clique de abrir a conversa
                                                    handleDeleteConversation(conv.id, conv.name); 
                                                }}
                                            >
                                                <Trash2 size={18} color="red" />
                                            </Button>

                                            <ChevronRight size={20} color="var(--light-text)" />
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ChatList;