import React, { useState, useEffect } from 'react';
import { Col, Card, Form, InputGroup, ListGroup, Badge } from 'react-bootstrap';
import { MessageSquare, ChevronRight, Search } from 'lucide-react'; 

// 🚨 DADOS SIMULADOS (MANTIDOS) 🚨
// --- DADOS SIMULADOS DE CONVERSAS ---
const MOCKED_CONVERSATIONS = [
    { id: 1, professional_id: 123, name: 'Marcos Eletricista Silva', service: 'Eletricidade', lastMessage: 'Estou disponível para a visita amanhã.', unread: 1, timestamp: '10:30' },
    { id: 2, professional_id: 456, name: 'Ana Pintora Souza', service: 'Pintura', lastMessage: 'Qual é a cor que você prefere para o quarto?', unread: 0, timestamp: 'Ontem' },
    { id: 3, professional_id: 789, name: 'Pedro Hidráulico Gomes', service: 'Hidráulica', lastMessage: 'Ok, fechado! Envio o orçamento final.', unread: 2, timestamp: '01/11/2025' },
];

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
            onStartNewChat(item); 
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