import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
// Importação dos novos ícones para mídia e áudio
import { Send, MessageSquare, ChevronRight, Search, Mic, Paperclip } from 'lucide-react'; 
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// 🚨 SIMULAÇÃO DE DADOS 🚨
// O ID do usuário logado é CRUCIAL para diferenciar 'eu' (right) e 'outro' (left)
const SIMULATED_LOGGED_USER_ID = 999; 

// --- DADOS SIMULADOS DE CONVERSAS ---
const MOCKED_CONVERSATIONS = [
    { id: 1, professional_id: 123, name: 'Marcos Eletricista Silva', service: 'Eletricidade', lastMessage: 'Estou disponível para a visita amanhã.', unread: 1, timestamp: '10:30' },
    { id: 2, professional_id: 456, name: 'Ana Pintora Souza', service: 'Pintura', lastMessage: 'Qual é a cor que você prefere para o quarto?', unread: 0, timestamp: 'Ontem' },
    { id: 3, professional_id: 789, name: 'Pedro Hidráulico Gomes', service: 'Hidráulica', lastMessage: 'Ok, fechado! Envio o orçamento final.', unread: 2, timestamp: '01/11/2025' },
];

// --- DADOS SIMULADOS DE MENSAGENS POR CHAT ID ---
const MOCKED_MESSAGES_INITIAL = {
    1: [
        { id: 1, sender_id: 123, text: 'Olá, sou o Marcos. Gostaria de saber mais sobre o serviço de elétrica.', timestamp: '14:00', is_read: true },
        { id: 2, sender_id: 999, text: 'Oi Marcos! A área é no centro. Qual o preço para a troca de fiação de 50m²?', timestamp: '14:02', is_read: true },
        { id: 3, sender_id: 123, text: 'O valor inicial ficaria entre R$800 e R$1200.', timestamp: '14:05', is_read: false },
    ],
    2: [
        { id: 10, sender_id: 456, text: 'Oi! Qual é a cor que você prefere para o quarto?', timestamp: 'Ontem', is_read: true },
        { id: 11, sender_id: 999, text: 'Queria um tom de cinza claro, por favor.', timestamp: 'Ontem', is_read: true },
    ],
    3: [], 
};

// --- DADOS SIMULADOS DE PROFISSIONAIS (Para a busca) ---
const MOCKED_PROFESSIONALS = [
    { id: 100, name: 'João Pedreiro Santos', service: 'Construção' },
    { id: 101, name: 'Mariana Designer Web', service: 'Design Gráfico' },
    { id: 102, name: 'Felipe Encanador', service: 'Hidráulica' },
    { id: 103, name: 'Carla Jardineira Flor', service: 'Jardinagem' },
];
// ------------------------------------------------------

// Componente para a Lista Lateral de Chats (Inclui a Busca)
const ChatListPanel = ({ conversations, selectedChatId, onSelectChat, onStartNewChat }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    
    // Lógica de busca simulada
    useEffect(() => {
        if (searchTerm.length > 2) {
            // Filtra os profissionais por nome ou serviço
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
    const displayList = isSearching ? searchResults : conversations;

    const handleItemClick = (item) => {
        if (isSearching) {
            onStartNewChat(item); // Inicia novo chat com o profissional encontrado
            setSearchTerm(''); 
        } else {
            onSelectChat(item.id); // Seleciona chat existente
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
                            className="d-flex justify-content-between align-items-start"
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
    
    const [conversations, setConversations] = useState(MOCKED_CONVERSATIONS);
    const [mockedMessages, setMockedMessages] = useState(MOCKED_MESSAGES_INITIAL);
    
    const selectedChatId = id ? parseInt(id) : null; 
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Efeito para carregar mensagens e rolar para o final
    useEffect(() => {
        scrollToBottom();
    }, [selectedChatId, mockedMessages]);
    
    const messages = selectedChatId ? mockedMessages[selectedChatId] || [] : [];

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !selectedChatId) return;

        const newMsg = {
            id: Date.now(), 
            sender_id: SIMULATED_LOGGED_USER_ID,
            text: newMessage.trim(),
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            is_read: true,
        };

        // Simulação de envio: atualiza o estado de mensagens
        setMockedMessages(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), newMsg]
        }));
        
        // Atualiza a última mensagem na lista de conversas
        setConversations(prev => prev.map(conv => 
            conv.id === selectedChatId ? { ...conv, lastMessage: newMsg.text, timestamp: newMsg.timestamp } : conv
        ));
        
        setNewMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    // Handler para Upload de Mídia (Foto/Vídeo)
    const handleMediaUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        console.log(`[Upload Mídia] Arquivo selecionado: ${file.name}, Tipo: ${file.type}`);
        
        // ⚠️ Placeholder: Aqui é onde a lógica real de upload (FormData + Axios POST para o backend) deve ir.
        alert(`Simulação: Iniciando upload de ${file.name}. Você precisa implementar a chamada à API de upload aqui.`);
        
        // Limpa o input para permitir uploads repetidos
        event.target.value = null; 
    };

    // Handler para Gravação de Áudio
    const handleAudioRecording = () => {
        console.log(`[Gravação Áudio] Iniciando gravação para o chat ${selectedChatId}`);
        
        // ⚠️ Placeholder: Aqui é onde a lógica real de gravação (MediaRecorder do navegador) e upload deve ir.
        alert("Simulação: Iniciando gravação de áudio. Implemente o controle de gravação (start/stop) e a lógica de upload.");
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
        // 💡 Adicionado bloco de estilo para definir variáveis de cor e garantir visibilidade
        <>
            <style jsx global>{`
                :root {
                    --primary-color: #007bff; /* Azul */
                    --secondary-color: #6c757d; /* Cinza */
                    --accent-color: #ffc107; /* Amarelo (Envio) */
                    --dark-bg-app: #f8f9fa; /* Fundo principal */
                    --dark-bg: #343a40; /* Fundo escuro lateral */
                    --dark-bg-card: #495057; /* Card lateral */
                    --header-bg: #212529; /* Input e Headers escuros */
                    --light-text: #f8f9fa; /* Texto claro */
                    --dark-text: #212529; /* Texto escuro */
                    --light-bg: #ffffff; /* Fundo de mensagens */
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
                                    messages.map(msg => (
                                        <div 
                                            key={msg.id} 
                                            className={`d-flex ${msg.sender_id === SIMULATED_LOGGED_USER_ID ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                                        >
                                            <div className={`p-2 rounded-3 text-break shadow-sm`} 
                                                style={{ 
                                                    maxWidth: '70%',
                                                    backgroundColor: msg.sender_id === SIMULATED_LOGGED_USER_ID ? 'var(--accent-color)' : 'var(--secondary-color)',
                                                    color: msg.sender_id === SIMULATED_LOGGED_USER_ID ? '#000' : '#fff'
                                                }}>
                                                {msg.text}
                                                <div className="text-end mt-1" style={{ fontSize: '0.7em', opacity: 0.7, color: msg.sender_id === SIMULATED_LOGGED_USER_ID ? '#444' : '#eee' }}>
                                                    {msg.timestamp}
                                                </div>
                                            </div>
                                        </div>
                                    ))
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
                                    disabled={!selectedChatId}
                                />
                                {/* 💡 CORREÇÃO DE ESTILO: Usando variant="info" para destaque e garantia de visibilidade */}
                                <Button 
                                    variant="info" // Cor info (azul claro) para o clipe
                                    className="me-2 p-2 text-white" // Adicionado text-white para contraste
                                    onClick={() => document.getElementById('media-input').click()}
                                    disabled={!selectedChatId}
                                    style={{ height: '45px', border: 'none' }} // Remove border e usa cor padrão do Bootstrap info
                                >
                                    <Paperclip size={20} />
                                </Button>
                                
                                {/* Campo de Texto Principal */}
                                <InputGroup className="flex-grow-1">
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
                                    {/* Botão de Envio de Texto */}
                                    <Button 
                                        variant="warning" 
                                        onClick={handleSendMessage}
                                        disabled={newMessage.trim() === '' || !selectedChatId}
                                        className="fw-bold"
                                        style={{ height: '45px' }}
                                    >
                                        <Send size={20} />
                                    </Button>
                                </InputGroup>

                                {/* Botão de Áudio (Microfone) */}
                                {/* Fica desativado se houver texto no input, imitando o comportamento do WhatsApp */}
                                <Button 
                                    variant="danger" 
                                    className="ms-2 p-2"
                                    onClick={handleAudioRecording}
                                    disabled={!selectedChatId || newMessage.trim() !== ''}
                                    style={{ height: '45px' }}
                                >
                                    <Mic size={20} />
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