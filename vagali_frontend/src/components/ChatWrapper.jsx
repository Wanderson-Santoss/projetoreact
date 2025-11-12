import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, InputGroup, Form, Button, ListGroup } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
// Ícones Lucide: Send, Mic, Phone, Video, MoreVertical, Search, ChevronLeft
import { Send, Mic, Phone, Video, MoreVertical, Search, ChevronLeft, User } from 'lucide-react'; 

// --- Variáveis de Configuração (Simulação) ---
const CURRENT_USER_ID = 1; // ID do usuário logado (cliente) - para simulação

// --- DADOS SIMULADOS DE CONTATOS E MENSAGENS ---
const MOCKED_CONTACTS = [
    { id: 2, full_name: 'Marcos Eletricista', service: 'Eletricidade', last_message: 'Fechado! Começo amanhã.', last_time: '12:30', avatar: 'M' },
    { id: 3, full_name: 'Ana Pintora', service: 'Pintura', last_message: 'Sim, o orçamento ficou em R$ 800.', last_time: 'Ontem', avatar: 'A' },
    { id: 4, full_name: 'José Encanador', service: 'Hidráulica', last_message: 'O áudio não carregou.', last_time: 'Seg', avatar: 'J' },
    { id: 5, full_name: 'Clara Designer', service: 'Design Gráfico', last_message: 'Obrigada!', last_time: '18/09', avatar: 'C' },
];

const MOCKED_MESSAGES = (contactId) => {
    // Simula mensagens para o chat
    const messages = {
        2: [ // Marcos
            { id: 1, sender_id: 2, content: 'Olá! Vc está livre para um serviço de emergência?', type: 'text', timestamp: '10:00' },
            { id: 2, sender_id: CURRENT_USER_ID, content: 'Para qual dia seria?', type: 'text', timestamp: '10:01' },
            { id: 3, sender_id: 2, content: 'Agora! Caiu a luz da minha cozinha.', type: 'text', timestamp: '10:02' },
        ],
        3: [ // Ana
            { id: 1, sender_id: 3, content: 'Olá! Recebi sua demanda de pintura.', type: 'text', timestamp: '15:00' },
            { id: 2, sender_id: CURRENT_USER_ID, content: 'Ótimo! Vc tem disponibilidade para a próxima semana?', type: 'text', timestamp: '15:05' },
        ],
        // Retorna um array vazio se o ID for novo
    };
    return messages[contactId] || [];
};

// ==========================================================
// COMPONENTE AUXILIAR: MENSAGEM INDIVIDUAL (Balões)
// ==========================================================
const ChatBubble = ({ message }) => {
    const isSent = message.sender_id === CURRENT_USER_ID;
    const isAudio = message.type === 'audio';
    
    // Estilos do WhatsApp-like usando as cores do App.css
    // Nota: Usei 'bg-success' para a cor do balão enviado (verde/verde musgo)
    const bubbleClass = isSent 
        ? 'ms-auto bg-success text-white' 
        : 'me-auto bg-vagali-dark-card text-light'; 

    const bubbleStyle = {
        maxWidth: '80%',
        borderRadius: '10px',
        padding: '8px 10px',
        marginBottom: '6px',
        fontSize: '0.9rem',
        wordBreak: 'break-word',
    };

    return (
        <div className={`d-flex ${isSent ? 'justify-content-end' : 'justify-content-start'}`}>
            <div className={bubbleClass} style={bubbleStyle}>
                {isAudio ? (
                    <div className="d-flex align-items-center">
                        <Mic size={18} className="me-2" />
                        <span>[Áudio: {message.duration || '0:35'}]</span>
                    </div>
                ) : (
                    <>
                        {message.content}
                        <div className="text-end" style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                            {message.timestamp}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// ==========================================================
// COMPONENTE AUXILIAR: CHAT WINDOW
// ==========================================================
const ChatWindow = ({ professional, onSend, currentMessages, isRecording, toggleRecording }) => {
    const [inputContent, setInputContent] = useState('');
    const messagesEndRef = React.useRef(null);
    const navigate = useNavigate();

    // Scroll para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]);

    const handleSend = (e) => {
        if (e) e.preventDefault();
        if (inputContent.trim()) {
            onSend(inputContent.trim(), 'text');
            setInputContent('');
        }
    };
    
    // Renderiza o ícone de entrada (Mic ou Send)
    const renderInputIcon = () => {
        // Se estiver gravando, o ícone é o Mic vermelho
        if (isRecording) {
            return <Mic size={24} color="red" />;
        }
        // Se houver texto, é o Send
        return inputContent.trim() ? <Send size={24} /> : <Mic size={24} />;
    };

    // Função para lidar com o clique no botão do input
    const handleInputButtonClick = () => {
        if (inputContent.trim()) {
            handleSend(null); // Envia texto
        } else {
            // Inicia/Para a simulação de gravação
            toggleRecording();
            
            // Simulação de envio de áudio após 3s
            if (!isRecording) { // Se acabou de iniciar a gravação
                 setTimeout(() => {
                    // Se o estado ainda estiver em gravação após o timeout, envia
                    if (document.querySelector('.input-mic-button[data-recording="true"]')) {
                        onSend('', 'audio', '0:05'); 
                        toggleRecording(); // Para a simulação de gravação
                    }
                }, 3000);
            }
        }
    };

    if (!professional) {
        return (
            <Col md={8} className="d-flex flex-column align-items-center justify-content-center text-light bg-dark" style={{ minHeight: '80vh' }}>
                <Send size={48} className="mb-3" style={{ color: 'var(--primary-color)' }} />
                <h3>Selecione um contato para iniciar a conversa</h3>
                <p className="text-secondary">Seus chats com profissionais solicitados ou seguidos aparecerão na lateral.</p>
            </Col>
        );
    }
    
    const chatBackgroundStyle = {
        backgroundColor: '#111', // Fundo escuro
        minHeight: 'calc(80vh - 60px)', 
        maxHeight: 'calc(100vh - 120px)', // Ajuste baseado no header e input
        overflowY: 'auto',
        padding: '10px',
    };

    return (
        <Col md={8} className="d-flex flex-column p-0" style={{ maxHeight: '100vh' }}>
            {/* Header do Chat */}
            <div className="d-flex align-items-center p-3 shadow-sm" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--light-bg)' }}>
                <Button variant="link" onClick={() => navigate(-1)} className="p-0 me-3 text-white">
                    <ChevronLeft size={24} />
                </Button>
                {/* Avatar */}
                <div className="rounded-circle me-3 text-center text-dark fw-bold" style={{ width: '40px', height: '40px', lineHeight: '40px', backgroundColor: 'var(--accent-color)' }}>
                    {professional.full_name[0]}
                </div>
                {/* Nome e Status */}
                <div className="flex-grow-1">
                    <h5 className="mb-0 text-white">{professional.full_name}</h5>
                    <small className="text-success" style={{fontSize: '0.8rem'}}>Online</small>
                </div>
                {/* Botões de Ação */}
                <Button variant="link" className="text-white me-2"><Phone size={20} /></Button>
                <Button variant="link" className="text-white me-2"><Video size={20} /></Button>
                <Button variant="link" className="text-white"><MoreVertical size={20} /></Button>
            </div>

            {/* Corpo do Chat (Mensagens) */}
            <div className="flex-grow-1" style={chatBackgroundStyle}>
                {currentMessages.map((msg, index) => (
                    <ChatBubble key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
                {isRecording && (
                    <div className="text-center text-muted small mt-2">
                        Gravando áudio... (Clique novamente no microfone para cancelar/enviar simulado)
                    </div>
                )}
            </div>

            {/* Input do Chat */}
            <div className="p-3" style={{ backgroundColor: 'var(--header-bg)' }}>
                <InputGroup>
                    <Form.Control
                        as="textarea"
                        rows={1}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        placeholder={isRecording ? "Gravando áudio..." : "Digite uma mensagem..."}
                        className="form-control-dark rounded-pill me-2"
                        style={{ height: 'auto', maxHeight: '100px', resize: 'none' }}
                        disabled={isRecording}
                    />
                    <Button 
                        variant="warning" 
                        className="input-mic-button rounded-circle d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '45px', height: '45px', backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                        onClick={handleInputButtonClick}
                        data-recording={isRecording}
                    >
                        {renderInputIcon()}
                    </Button>
                </InputGroup>
            </div>
        </Col>
    );
};

// ==========================================================
// COMPONENTE AUXILIAR: LISTA DE CONTATOS
// ==========================================================
const ContactList = ({ contacts, selectedContactId, onSelectContact }) => {
    return (
        <Col md={4} className="p-0 border-end border-secondary" style={{ backgroundColor: 'var(--vagali-dark-card)', minHeight: '80vh', maxHeight: '100vh', overflowY: 'auto' }}>
            {/* Header da Lista de Contatos */}
            <div className="p-3 d-flex align-items-center shadow-sm" style={{ backgroundColor: 'var(--header-bg)', color: 'var(--light-bg)' }}>
                <h4 className="mb-0 me-auto">Chats</h4>
                <Button variant="link" className="text-white"><MoreVertical size={20} /></Button>
            </div>

            {/* Campo de Busca */}
            <div className="p-2" style={{ backgroundColor: 'var(--header-bg)' }}>
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Buscar profissional..."
                        className="form-control-dark rounded-pill"
                    />
                    <Button variant="link" className="text-secondary"><Search size={18} /></Button>
                </InputGroup>
            </div>

            {/* Lista de Contatos */}
            <ListGroup variant="flush">
                {contacts.map(contact => (
                    <ListGroup.Item
                        key={contact.id}
                        action
                        onClick={() => onSelectContact(contact)}
                        active={contact.id === selectedContactId}
                        className={`d-flex align-items-center py-3 ${contact.id === selectedContactId ? 'bg-secondary' : 'bg-vagali-dark-card text-light'} border-secondary`}
                        style={{cursor: 'pointer'}}
                    >
                        <div className="rounded-circle me-3 text-center text-dark fw-bold" style={{ width: '50px', height: '50px', lineHeight: '50px', backgroundColor: 'var(--accent-color)' }}>
                            {contact.avatar}
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                                <h6 className={`mb-0 ${contact.id === selectedContactId ? 'text-white' : 'text-white'}`}>{contact.full_name}</h6>
                                <small className="text-muted">{contact.last_time}</small>
                            </div>
                            <small className="text-truncate" style={{ display: 'block', maxWidth: '90%' }}>
                                {contact.last_message}
                            </small>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Col>
    );
};

// ==========================================================
// COMPONENTE PRINCIPAL: CHAT WRAPPER (Gerencia Estados)
// ==========================================================
const ChatWrapper = () => {
    const location = useLocation();
    
    // Profissional passado pelo 'Enviar Mensagem' do perfil
    const initialProfessional = location.state?.professional || null;
    
    // Lista de contatos (simulada)
    const [contacts, setContacts] = useState(MOCKED_CONTACTS);
    
    // Contato atualmente selecionado no chat
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    
    // Mensagens do chat atual
    const [messages, setMessages] = useState([]);
    
    // Estado para simular a gravação de áudio
    const [isRecording, setIsRecording] = useState(false);

    // Efeito para adicionar o profissional inicial aos contatos e selecioná-lo
    useEffect(() => {
        let currentSelected = initialProfessional;

        if (initialProfessional) {
            const exists = contacts.find(c => c.id === initialProfessional.id);
            if (!exists) {
                const newContact = { 
                    id: initialProfessional.id, 
                    full_name: initialProfessional.full_name, 
                    service: initialProfessional.servico_principal || 'Profissional', 
                    last_message: 'Inicie sua conversa!', 
                    last_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), 
                    avatar: initialProfessional.full_name[0]
                };
                // Adiciona na frente da lista
                setContacts(prev => [newContact, ...prev.filter(c => c.id !== initialProfessional.id)]);
                currentSelected = newContact;
            } else {
                currentSelected = exists;
            }
        }
        
        // Seleciona o contato inicial ou o primeiro da lista
        setSelectedProfessional(currentSelected || contacts[0]);
    }, [initialProfessional]);


    // Efeito para carregar as mensagens quando um contato é selecionado
    useEffect(() => {
        if (selectedProfessional) {
            // Simula a busca de mensagens do servidor
            const fetchedMessages = MOCKED_MESSAGES(selectedProfessional.id);
            setMessages(fetchedMessages);
        } else {
            setMessages([]);
        }
    }, [selectedProfessional]);
    

    const handleSelectContact = (contact) => {
        setSelectedProfessional(contact);
    };

    const handleSend = (content, type, duration) => {
        if (!selectedProfessional) return;

        const newId = messages.length + 1;
        const newMessage = {
            id: newId,
            sender_id: CURRENT_USER_ID, 
            content: content,
            type: type,
            duration: duration,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        
        // Atualiza as mensagens do chat
        setMessages(prev => [...prev, newMessage]);
        
        // Atualiza a prévia na lista de contatos e move para o topo
        setContacts(prevContacts => {
            const currentContact = prevContacts.find(c => c.id === selectedProfessional.id);
            if (currentContact) {
                 // Atualiza a última mensagem/tempo
                const updatedContact = {
                    ...currentContact,
                    last_message: type === 'audio' ? '[Áudio]' : content,
                    last_time: newMessage.timestamp
                };
                const otherContacts = prevContacts.filter(c => c.id !== selectedProfessional.id);
                return [updatedContact, ...otherContacts]; // Move para o topo
            }
            return prevContacts;
        });

        // Simulação de resposta do profissional após 1.5s
        setTimeout(() => {
            const reply = {
                id: newId + 1,
                sender_id: selectedProfessional.id,
                content: "Recebi! Aguarde um instante que já te respondo.",
                type: 'text',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, reply]);
            
            // Atualiza a prévia na lista de contatos com a resposta
            setContacts(prevContacts => {
                const currentContact = prevContacts.find(c => c.id === selectedProfessional.id);
                if (currentContact) {
                    const updatedContact = {
                        ...currentContact,
                        last_message: reply.content,
                        last_time: reply.timestamp
                    };
                    const otherContacts = prevContacts.filter(c => c.id !== selectedProfessional.id);
                    return [updatedContact, ...otherContacts]; 
                }
                return prevContacts;
            });
            
        }, 1500);
    };
    
    const toggleRecording = () => {
        setIsRecording(prev => !prev);
    };


    return (
        <Container fluid className="p-0 bg-dark min-vh-100" style={{ maxWidth: '1200px', margin: 'auto' }}>
            <Row className="g-0"> {/* Usando g-0 para remover o gutter */}
                <ContactList 
                    contacts={contacts} 
                    selectedContactId={selectedProfessional?.id}
                    onSelectContact={handleSelectContact}
                />
                <ChatWindow 
                    professional={selectedProfessional} 
                    currentMessages={messages} 
                    onSend={handleSend}
                    isRecording={isRecording}
                    toggleRecording={toggleRecording}
                />
            </Row>
        </Container>
    );
};

export default ChatWrapper;