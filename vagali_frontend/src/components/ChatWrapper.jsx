import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, ListGroup } from 'react-bootstrap';
import { Send, MessageSquare, ChevronRight, Search, Mic, Paperclip } from 'lucide-react'; 
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// 🚨 SIMULAÇÃO DE DADOS 🚨
const SIMULATED_LOGGED_USER_ID = 999; 

// --- DADOS SIMULADOS DE CONVERSAS INICIAIS ---
// Adicionamos 'unread' para controlar a bolha
const MOCKED_CONVERSATIONS_INITIAL = [
    { id: 1, professional_id: 123, name: 'Marcos Eletricista Silva', service: 'Eletricidade', lastMessage: 'Estou disponível para a visita amanhã.', unread: 1, timestamp: '10:30' },
    { id: 2, professional_id: 456, name: 'Ana Pintora Souza', service: 'Pintura', lastMessage: 'Qual é a cor que você prefere para o quarto?', unread: 0, timestamp: 'Ontem' },
    { id: 3, professional_id: 789, name: 'Pedro Hidráulico Gomes', service: 'Hidráulica', lastMessage: 'Ok, fechado! Envio o orçamento final.', unread: 2, timestamp: '01/11/2025' },
];

// --- DADOS SIMULADOS DE MENSAGENS POR CHAT ID ---
const MOCKED_MESSAGES_INITIAL = {
    1: [
        { id: 1, sender_id: 123, text: 'Olá, sou o Marcos. Gostaria de saber mais sobre o serviço de elétrica.', timestamp: '14:00', is_read: true },
        { id: 2, sender_id: 999, text: 'Oi Marcos! A área é no centro. Qual o preço para a troca de fiação de 50m²?', timestamp: '14:02', is_read: true },
        // Esta mensagem está como NÃO LIDA pelo usuário (SIMULATED_LOGGED_USER_ID)
        { id: 3, sender_id: 123, text: 'O valor inicial ficaria entre R$800 e R$1200. Podemos agendar?', timestamp: '14:05', is_read: false },
    ],
    2: [
        { id: 10, sender_id: 456, text: 'Oi! Qual é a cor que você prefere para o quarto?', timestamp: 'Ontem', is_read: true },
        { id: 11, sender_id: 999, text: 'Queria um tom de cinza claro, por favor.', timestamp: 'Ontem', is_read: true },
    ],
    3: [
        // Duas mensagens não lidas
        { id: 20, sender_id: 789, text: 'Mensagem 1. Nova!', timestamp: '10:00', is_read: false },
        { id: 21, sender_id: 789, text: 'Mensagem 2. Nova!', timestamp: '10:01', is_read: false },
        { id: 22, sender_id: 999, text: 'Minha resposta.', timestamp: '10:05', is_read: true },
    ], 
};

// --- DADOS SIMULADOS DE PROFISSIONAIS (Para a busca) ---
const MOCKED_PROFESSIONALS = [
    { id: 100, name: 'João Pedreiro Santos', service: 'Construção' },
    { id: 101, name: 'Mariana Designer Web', service: 'Design Gráfico' },
    { id: 102, name: 'Felipe Encanador', service: 'Hidráulica' },
    { id: 103, name: 'Carla Jardineira Flor', service: 'Jardinagem' },
];
// ------------------------------------------------------


// Componente para a Lista Lateral de Chats
const ChatListPanel = ({ conversations, selectedChatId, onSelectChat, onStartNewChat }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    useEffect(() => {
        if (searchTerm.length > 2) {
            const results = MOCKED_PROFESSIONALS.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.service.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const isSearching = searchTerm.length > 2;
    // Ordena as conversas existentes para que as não lidas fiquem em cima
    const sortedConversations = [...conversations].sort((a, b) => b.unread - a.unread);
    const displayList = isSearching ? searchResults : sortedConversations;

    const handleItemClick = (item) => {
        if (isSearching) {
            onStartNewChat(item); 
            setSearchTerm(''); 
        } else {
            onSelectChat(item.id); 
        }
    };

    return (
        <Col md={4} className="p-0 border-end" style={{ height: '80vh', overflowY: 'auto', backgroundColor: 'var(--dark-bg)' }}>
            <Card.Header className="bg-primary text-white fw-bold p-3">
                <MessageSquare size={20} className="me-2" /> Minhas Conversas
            </Card.Header>
            
            {/* CAMPO DE BUSCA */}
            <div className="p-3 border-bottom" style={{backgroundColor: 'var(--dark-bg-card)'}}>
                <InputGroup>
                    <InputGroup.Text style={{backgroundColor: 'var(--header-bg)', borderColor: 'var(--dark-text)'}}>
                        <Search size={16} className='text-muted' />
                    </InputGroup.Text>
                    <Form.Control
                        type="text"
                        placeholder="Buscar profissional..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ backgroundColor: 'var(--header-bg)', color: 'var(--light-text)', borderColor: 'var(--dark-text)' }}
                    />
                </InputGroup>
            </div>
            
            {/* LISTA DE RESULTADOS / CONVERSAS */}
            <ListGroup variant="flush">
                {displayList.length > 0 ? (
                    displayList.map(item => (
                        <ListGroup.Item
                            key={item.id}
                            action
                            onClick={() => handleItemClick(item)}
                            active={!isSearching && item.id === selectedChatId}
                            // Destaque para conversas com mensagens não lidas
                            className={`d-flex justify-content-between align-items-start ${!isSearching && item.unread > 0 ? 'fw-bold' : ''}`}
                            style={{ 
                                cursor: 'pointer', 
                                backgroundColor: (!isSearching && item.id === selectedChatId) ? 'var(--primary-color)' : 'var(--dark-bg-card)', 
                                color: 'var(--light-text)',
                                borderColor: 'var(--dark-text)'
                            }}
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">{item.name}</div>
                                <small className={`text-truncate`} style={{ maxWidth: '180px', display: 'block', color: isSearching ? 'var(--accent-color)' : 'var(--light-text)' }}>
                                    {isSearching ? `Serviço: ${item.service}` : item.lastMessage}
                                </small>
                            </div>
                            {!isSearching && item.unread > 0 && (
                                <Badge bg="danger" pill className="mt-1">
                                    {item.unread}
                                </Badge>
                            )}
                            {isSearching && (
                                <ChevronRight size={20} className="mt-1 text-warning"/>
                            )}
                        </ListGroup.Item>
                    ))
                ) : (
                    <p className="p-3 text-center text-muted">
                        {isSearching ? 'Nenhum profissional encontrado.' : 'Nenhuma conversa ativa. Use a busca para começar!'}
                    </p>
                )}
            </ListGroup>
        </Col>
    );
};


const ChatWrapper = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    
    // --- ESTADOS DE MÍDIA E ÁUDIO ---
    const [isRecording, setIsRecording] = useState(false); 
    const [recordingTime, setRecordingTime] = useState(0); 
    // ---------------------------------
    
    // Usando MOCKED_CONVERSATIONS_INITIAL e MOCKED_MESSAGES_INITIAL
    const [conversations, setConversations] = useState(MOCKED_CONVERSATIONS_INITIAL);
    const [mockedMessages, setMockedMessages] = useState(MOCKED_MESSAGES_INITIAL);
    
    const selectedChatId = id ? parseInt(id) : null; 
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    /**
     * 🟢 Lógica: Marcar mensagens do profissional como lidas
     */
    const markMessagesAsRead = useCallback((chatId) => {
        if (!chatId) return;

        // 1. Marcar as mensagens individuais como lidas
        setMockedMessages(prev => {
            if (!prev[chatId]) return prev;

            const updatedMessages = prev[chatId].map(msg => {
                // Marca como lida apenas se o remetente NÃO for o usuário logado (é o profissional)
                if (msg.sender_id !== SIMULATED_LOGGED_USER_ID && !msg.is_read) {
                    return { ...msg, is_read: true };
                }
                return msg;
            });

            return {
                ...prev,
                [chatId]: updatedMessages
            };
        });

        // 2. Zerar o contador de não lidas na lista lateral
        setConversations(prev => prev.map(conv => 
            conv.id === chatId ? { ...conv, unread: 0 } : conv
        ));
    }, []);

    // Efeito para carregar mensagens, rolar e MARCAR COMO LIDAS
    useEffect(() => {
        scrollToBottom();
        // CHAMADA CRUCIAL: Marca o chat atual como lido
        if (selectedChatId) {
            markMessagesAsRead(selectedChatId);
        }
    }, [selectedChatId, mockedMessages, markMessagesAsRead]);
    
    // 💡 Efeito para gerenciar o timer de gravação de áudio
    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 1);
            }, 1000);
        }
        // Limpa o intervalo ao parar ou desmontar
        return () => clearInterval(timer);
    }, [isRecording]);
    
    const messages = selectedChatId ? mockedMessages[selectedChatId] || [] : [];

    // ----------------------------------------------------------------------
    // --- HANDLERS DE MENSAGEM ---
    // ----------------------------------------------------------------------

    const updateLastMessage = (chatId, text, timestamp) => {
        setConversations(prev => prev.map(conv => 
            conv.id === chatId ? { 
                ...conv, 
                lastMessage: text, 
                timestamp: timestamp,
            } : conv
        ));
    }
    
    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedChatId) return;

        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const newMsg = {
            id: Date.now(), 
            sender_id: SIMULATED_LOGGED_USER_ID,
            text: newMessage.trim(),
            timestamp: timestamp,
            is_read: true, 
        };

        // Simulação de envio: atualiza o estado de mensagens
        setMockedMessages(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
        }));
        
        updateLastMessage(selectedChatId, newMsg.text, timestamp);
        
        setNewMessage('');
    };
    
    /**
     * 📸 Handler para Mídia (Foto/Vídeo)
     */
    const handleMediaUpload = (event) => {
        const file = event.target.files[0];
        if (!file || !selectedChatId) return;

        // Determina o tipo de mídia para exibir (apenas para simulação de texto)
        const mediaType = file.type.startsWith('image/') ? 'Foto' : 
                          file.type.startsWith('video/') ? 'Vídeo' : 'Arquivo';

        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const mediaText = `[${mediaType} Enviada: ${file.name}]`;

        const newMsg = {
            id: Date.now(), 
            sender_id: SIMULATED_LOGGED_USER_ID,
            text: mediaText, // Texto de simulação
            timestamp: timestamp,
            is_read: true,
            // Em um app real, o 'file' seria enviado para o servidor aqui.
        };

        // Adiciona a nova mensagem simulada
        setMockedMessages(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
        }));
        
        updateLastMessage(selectedChatId, mediaText, timestamp);
        
        // Limpa o input file para permitir o upload do mesmo arquivo novamente
        event.target.value = null; 
    };

    /**
     * 🎙️ Handler para Áudio (Simulado)
     */
    const handleAudioRecording = () => {
        if (!selectedChatId) return;

        if (isRecording) {
            // 🛑 Parar Gravação e Enviar
            setIsRecording(false);
            
            // Simula o envio de uma mensagem de áudio
            const simulatedAudioDuration = recordingTime > 0 ? `${recordingTime}s` : '0s';
            const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const audioText = `[🎙️ Áudio Enviado - Duração: ${simulatedAudioDuration}]`;

            // Só envia se houver tempo de gravação
            if (recordingTime > 0) {
                const newMsg = {
                    id: Date.now(), 
                    sender_id: SIMULATED_LOGGED_USER_ID,
                    text: audioText,
                    timestamp: timestamp,
                    is_read: true,
                };

                setMockedMessages(prev => ({
                    ...prev,
                    [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
                }));
                
                updateLastMessage(selectedChatId, audioText, timestamp);
            }

            setRecordingTime(0); // Zera o contador de tempo
        } else {
            // ▶️ Iniciar Gravação
            setIsRecording(true);
            setRecordingTime(0);
        }
    };

    // ----------------------------------------------------------------------
    // --- HANDLERS DE NAVEGAÇÃO E UX ---
    // ----------------------------------------------------------------------

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Handler para iniciar um novo chat (ou abrir um existente)
    const handleStartNewChat = useCallback((professional) => {
        const existingChat = conversations.find(c => c.professional_id === professional.id);

        if (existingChat) {
            navigate(`/mensagens/${existingChat.id}`);
        } else {
            const newChatId = Date.now();
            const newConversation = {
                id: newChatId, 
                professional_id: professional.id, 
                name: professional.name, 
                service: professional.service, 
                lastMessage: 'Nova conversa iniciada. Diga olá!', 
                unread: 0, 
                timestamp: 'Agora' 
            };
            
            setConversations(prev => [newConversation, ...prev]);
            setMockedMessages(prev => ({...prev, [newChatId]: []}));

            navigate(`/mensagens/${newChatId}`);
        }
    }, [conversations, navigate]);
    
    // Handler para selecionar o chat (navega)
    const handleSelectChat = (chatId) => {
        navigate(`/mensagens/${chatId}`);
    };
    
    const selectedConversation = conversations.find(c => c.id === selectedChatId);
    
    return (
        <>
            <style jsx global>{`
                :root {
                    --primary-color: #007bff; /* Azul */
                    --secondary-color: #6c757d; /* Cinza */
                    --accent-color: #ffc107; /* Amarelo (Envio) */
                    --unread-highlight: #dc3545; /* Vermelho (Destaque não lida) */
                    --dark-bg-app: #f8f9fa; 
                    --dark-bg: #343a40; 
                    --dark-bg-card: #495057; 
                    --header-bg: #212529; 
                    --light-text: #f8f9fa; 
                    --dark-text: #212529; 
                    --light-bg: #ffffff; 
                }
            `}</style>
            
            <Container fluid className="mt-4" style={{ backgroundColor: 'var(--dark-bg-app)' }}>
                <Row>
                    
                    {/* LISTA DE CHATS (4 COLUNAS) */}
                    <ChatListPanel 
                        conversations={conversations} 
                        selectedChatId={selectedChatId}
                        onSelectChat={handleSelectChat}
                        onStartNewChat={handleStartNewChat} 
                    />
                    
                    {/* PAINEL DE CONVERSA (8 COLUNAS) */}
                    <Col md={8} className="p-0">
                        <Card style={{ height: '80vh' }} className="shadow-lg border-0">
                            {/* HEADER DA CONVERSA */}
                            <Card.Header className="d-flex align-items-center bg-primary text-white fw-bold p-3">
                                {!selectedChatId ? (
                                    <span>Selecione uma Conversa</span>
                                ) : (
                                    <>
                                        <h5 className="mb-0">{selectedConversation?.name || "Conversa"}</h5>
                                        <span className="ms-3 badge bg-info">{selectedConversation?.service}</span>
                                    </>
                                )}
                            </Card.Header>

                            {/* CORPO DAS MENSAGENS */}
                            <Card.Body 
                                className="d-flex flex-column p-3" 
                                style={{ overflowY: 'auto', flexGrow: 1, backgroundColor: 'var(--light-bg)' }}
                            >
                                {selectedChatId ? (
                                    messages.map(msg => {
                                        const isMe = msg.sender_id === SIMULATED_LOGGED_USER_ID;
                                        // Destaque para mensagens não lidas
                                        const isUnreadByMe = !isMe && !msg.is_read; 

                                        const bgColor = isMe 
                                            ? 'var(--accent-color)' 
                                            : isUnreadByMe 
                                                ? 'var(--unread-highlight)' 
                                                : 'var(--secondary-color)';
                                                
                                        const textColor = isMe ? '#000' : '#fff';
                                        
                                        return (
                                            <div 
                                                key={msg.id} 
                                                className={`d-flex ${isMe ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                                            >
                                                <div className={`p-2 rounded-3 text-break shadow-sm`} 
                                                    style={{ 
                                                        maxWidth: '70%',
                                                        backgroundColor: bgColor,
                                                        color: textColor
                                                    }}>
                                                    {msg.text}
                                                    <div className="text-end mt-1" style={{ fontSize: '0.7em', opacity: 0.7, color: isMe ? '#444' : '#eee' }}>
                                                        {msg.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                                        <MessageSquare size={48} className="me-2" />
                                        Clique em uma conversa ao lado ou use a barra de busca.
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </Card.Body>

                            {/* FOOTER: CAMPO DE INPUT COM BOTÕES DE MÍDIA E ÁUDIO */}
                            <Card.Footer className="p-3" style={{ backgroundColor: 'var(--dark-bg)', borderTop: '1px solid var(--dark-text)' }}>
                                <div className="d-flex align-items-end">

                                    {/* Botão de Anexar Mídia (Fotos/Vídeos) */}
                                    <input
                                        type="file"
                                        id="media-input"
                                        style={{ display: 'none' }}
                                        accept="image/*,video/*"
                                        onChange={handleMediaUpload}
                                        disabled={!selectedChatId || isRecording}
                                    />
                                    <Button 
                                        variant="info" 
                                        className="me-2 p-2 text-white" 
                                        onClick={() => document.getElementById('media-input').click()}
                                        disabled={!selectedChatId || isRecording}
                                        style={{ height: '45px', border: 'none' }} 
                                    >
                                        <Paperclip size={20} />
                                    </Button>
                                    
                                    {/* Campo de Texto Principal / Indicador de Gravação */}
                                    <InputGroup className="flex-grow-1">
                                        {isRecording ? (
                                            <div className="d-flex align-items-center justify-content-center w-100 p-2 rounded" 
                                                 style={{ backgroundColor: '#fff3cd', color: '#856404', height: '45px', border: '1px solid #ffeeba' }}>
                                                <Mic size={20} className="me-2 text-danger"/>
                                                **Gravando...** ({recordingTime}s)
                                            </div>
                                        ) : (
                                            <Form.Control
                                                as="textarea"
                                                placeholder="Digite sua mensagem..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                rows={1}
                                                style={{ resize: 'none', backgroundColor: 'var(--header-bg)', color: 'var(--light-text)', borderColor: 'var(--accent-color)' }}
                                                disabled={!selectedChatId}
                                            />
                                        )}
                                        
                                        {/* Botão de Envio de Texto (só aparece se NÃO estiver gravando) */}
                                        {!isRecording && (
                                            <Button 
                                                variant="warning" 
                                                onClick={handleSendMessage}
                                                disabled={newMessage.trim() === '' || !selectedChatId}
                                                className="fw-bold"
                                                style={{ height: '45px' }}
                                            >
                                                <Send size={20} />
                                            </Button>
                                        )}
                                    </InputGroup>

                                    {/* Botão de Áudio (Microfone) - Muda cor e função */}
                                    <Button 
                                        variant={isRecording ? 'success' : 'danger'} // Muda a cor para indicar gravação
                                        className="ms-2 p-2"
                                        onClick={handleAudioRecording}
                                        disabled={!selectedChatId || (!isRecording && newMessage.trim() !== '')} // Não pode gravar se estiver digitando
                                        style={{ height: '45px' }}
                                    >
                                        {isRecording ? <Send size={20} /> : <Mic size={20} />} {/* Ícone muda para Enviar quando gravando */}
                                    </Button>
                                </div>
                            </Card.Footer>
                            
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ChatWrapper;