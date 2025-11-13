import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

// 🚨 SIMULAÇÃO DE DADOS 🚨
// O ID do usuário logado é CRUCIAL para diferenciar 'eu' (right) e 'outro' (left)
const SIMULATED_LOGGED_USER_ID = 999; 

const MOCKED_MESSAGES = [
    { id: 1, sender_id: 123, text: 'Olá, sou o Marcos. Gostaria de saber mais sobre o serviço de elétrica que você postou. Qual seria a área de serviço?', timestamp: '14:00', is_read: true },
    { id: 2, sender_id: 999, text: 'Oi Marcos! A área é no centro de São Paulo. Você poderia me passar uma estimativa de preço para a troca de fiação de um apartamento de 50m²?', timestamp: '14:02', is_read: true },
    { id: 3, sender_id: 123, text: 'Certo. Preciso de mais detalhes, mas o valor inicial ficaria entre R$800 e R$1200, dependendo da complexidade. Podemos agendar uma visita sem compromisso?', timestamp: '14:05', is_read: false },
];

// ==========================================================
// ESTILOS CUSTOMIZADOS
// ==========================================================
// Estes estilos são necessários para criar a aparência de balão de chat
const styles = {
    // Estilo base do balão de mensagem
    messageBubble: {
        padding: '8px 12px',
        borderRadius: '15px',
        maxWidth: '80%',
        marginBottom: '10px',
        wordWrap: 'break-word',
    },
    // Estilo para mensagens enviadas pelo usuário logado (EU)
    myMessage: {
        backgroundColor: 'var(--primary-color)', // Ex: Amarelo/Laranja
        color: 'var(--dark-text)',
        marginLeft: 'auto', // Alinha à direita
        borderBottomRightRadius: '3px',
    },
    // Estilo para mensagens recebidas (PROFISSIONAL)
    otherMessage: {
        backgroundColor: 'var(--light-text-secondary)', // Ex: Cinza Claro
        color: 'var(--dark-text)',
        marginRight: 'auto', // Alinha à esquerda
        borderBottomLeftRadius: '3px',
    },
    // Estilo para a área de scroll das mensagens
    messagesArea: {
        height: 'calc(100vh - 200px)', // Altura ajustável
        overflowY: 'auto',
        padding: '15px',
        backgroundColor: 'var(--header-bg-dark)',
        borderRadius: '5px',
    }
};

// ==========================================================
// COMPONENTE PRINCIPAL: CHAT WRAPPER
// ==========================================================
const ChatWrapper = () => {
    const navigate = useNavigate();
    const { id: conversationIdFromUrl } = useParams();
    const location = useLocation();

    // Dados passados da ChatList. Se não houver, voltamos
    const conversationData = location.state?.professional || {
        full_name: 'Profissional', 
        servico_principal: 'Serviço',
        id: conversationIdFromUrl
    };

    const [messages, setMessages] = useState(MOCKED_MESSAGES);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Referência para manter o scroll no final da lista de mensagens
    const messagesEndRef = useRef(null);

    // Efeito para rolar automaticamente para a mensagem mais recente
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); 

    // 1. Lógica de Envio de Mensagem
    const handleSendMessage = useCallback(async () => {
        if (newMessage.trim() === '') return;

        const messageToSend = {
            id: Date.now(), // ID temporário
            sender_id: SIMULATED_LOGGED_USER_ID, // Você é o remetente
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            is_read: true,
            // conversation_id: conversationIdFromUrl, // Necessário para a API real
        };

        // 🚨 PASSO CRUCIAL: Adicionar a nova mensagem ao estado
        setMessages(prev => [...prev, messageToSend]);
        setNewMessage(''); // Limpa o campo de input
        
        // 🚨 LÓGICA DE API (Para implementação futura) 🚨
        // try {
        //     await axios.post(`/api/v1/chat/messages/`, messageToSend);
        // } catch (err) {
        //     console.error("Erro ao enviar mensagem:", err);
        //     // Opcional: Remover a mensagem do estado se o envio falhar
        // }
    }, [newMessage]);


    // 2. Função para Envio via Tecla Enter
    const handleKeyPress = (e) => {
        // Se a tecla pressionada for 'Enter' e não for o Shift (para permitir quebra de linha)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Impede o comportamento padrão do Enter (nova linha)
            handleSendMessage();
        }
    };

    // 3. Renderização do Balão de Mensagem Individual
    const renderMessage = (msg) => {
        const isMe = msg.sender_id === SIMULATED_LOGGED_USER_ID;
        const bubbleStyle = isMe ? styles.myMessage : styles.otherMessage;
        const alignment = isMe ? 'd-flex justify-content-end' : 'd-flex justify-content-start';

        return (
            <div key={msg.id} className={alignment}>
                <div style={{ ...styles.messageBubble, ...bubbleStyle }}>
                    <p className="mb-1">{msg.text}</p>
                    <small className="float-end text-muted" style={{ fontSize: '0.65rem' }}>{msg.timestamp}</small>
                </div>
            </div>
        );
    };
    
    // Se o conversationData não estiver disponível (usuário acessou a URL diretamente), 
    // podemos simular o carregamento.
    // Para simplificar, vamos apenas exibir o nome que veio da URL ou um placeholder.

    return (
        <Container className="py-5" style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Card className="shadow-lg border-0" style={{ backgroundColor: 'var(--header-bg)', height: 'calc(100vh - 100px)' }}>
                        
                        {/* HEADER DO CHAT */}
                        <Card.Header className="d-flex align-items-center p-3" style={{ backgroundColor: 'var(--dark-bg)', color: 'var(--light-text)' }}>
                            <Button variant="link" onClick={() => navigate('/chats')} className="p-0 me-3 text-warning">
                                <ArrowLeft size={24} />
                            </Button>
                            <div>
                                <h5 className="mb-0 fw-bold" style={{ color: 'var(--accent-color)' }}>
                                    {conversationData.full_name}
                                </h5>
                                <small className="text-muted">{conversationData.servico_principal}</small>
                            </div>
                        </Card.Header>

                        {/* ÁREA DE MENSAGENS (Scroll) */}
                        <div style={styles.messagesArea}>
                            {loading && <Spinner animation="border" variant="warning" />}
                            {error && <Alert variant="danger">{error}</Alert>}
                            
                            {messages.map(renderMessage)}
                            
                            {/* Scroll Anchor */}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* FOOTER: CAMPO DE INPUT */}
                        <Card.Footer className="p-3" style={{ backgroundColor: 'var(--dark-bg)' }}>
                            <InputGroup>
                                <Form.Control
                                    as="textarea"
                                    placeholder="Digite sua mensagem..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress} // 🚨 AÇÃO DE ENTER APLICADA AQUI 🚨
                                    rows={1}
                                    style={{ resize: 'none', backgroundColor: 'var(--header-bg)', color: 'var(--light-text)', borderColor: 'var(--accent-color)' }}
                                />
                                <Button 
                                    variant="warning" 
                                    onClick={handleSendMessage}
                                    disabled={newMessage.trim() === ''}
                                    className="fw-bold"
                                >
                                    <Send size={20} />
                                </Button>
                            </InputGroup>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ChatWrapper;