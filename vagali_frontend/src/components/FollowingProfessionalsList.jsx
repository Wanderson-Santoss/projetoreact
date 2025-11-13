import React, { useState, useMemo } from 'react'; // Adicionado useState e useMemo
import { Card, Button, ListGroup, Form } from 'react-bootstrap'; // Adicionado Form
import { Heart, UserMinus, Search } from 'lucide-react'; // Adicionado Search
import { Link } from 'react-router-dom';

// --- DADOS SIMULADOS (Aumentados para demonstrar a busca) ---
const SIMULATED_FOLLOWING = [
    { id: '1', name: 'Dr. João Saúde', role: 'Médico', avatar: 'https://via.placeholder.com/40/28a745/ffffff?text=J' },
    { id: '2', name: 'Maria Designer', role: 'UX/UI', avatar: 'https://via.placeholder.com/40/007bff/ffffff?text=M' },
    { id: '3', name: 'Pedro Eletricista', role: 'Eletricista', avatar: 'https://via.placeholder.com/40/ffc107/000000?text=P' },
    { id: '4', name: 'Ana Chef Gourmet', role: 'Cozinheira', avatar: 'https://via.placeholder.com/40/fd7e14/ffffff?text=A' },
    { id: '5', name: 'Felipe WebDev', role: 'Desenvolvedor', avatar: 'https://via.placeholder.com/40/6f42c1/ffffff?text=F' }, 
    { id: '6', name: 'Carla Paisagista', role: 'Jardinagem', avatar: 'https://via.placeholder.com/40/20c997/ffffff?text=C' }, 
    { id: '7', name: 'Lucas Mecânico', role: 'Mecânico', avatar: 'https://via.placeholder.com/40/6c757d/ffffff?text=L' }, 
    { id: '8', name: 'Sofia Fotógrafa', role: 'Fotografia', avatar: 'https://via.placeholder.com/40/00bcd4/ffffff?text=S' }, 
];
// -----------------------

const FollowingProfessionalsList = () => {
    // 🚨 NOVO ESTADO: Termo de busca
    const [searchTerm, setSearchTerm] = useState('');
    const followingList = SIMULATED_FOLLOWING; 

    // 🚨 LÓGICA DE FILTRO: Usa useMemo para evitar recalcular a lista a cada renderização
    const filteredList = useMemo(() => {
        if (!searchTerm) {
            return followingList;
        }
        const lowerCaseSearch = searchTerm.toLowerCase();
        return followingList.filter(prof => 
            prof.name.toLowerCase().includes(lowerCaseSearch) ||
            prof.role.toLowerCase().includes(lowerCaseSearch) // Permite buscar por nome ou especialidade
        );
    }, [followingList, searchTerm]);


    // Função dummy para simular o 'Deixar de Seguir'
    const handleUnfollow = (professionalId, professionalName) => {
        if (window.confirm(`Tem certeza que deseja deixar de seguir ${professionalName}?`)) {
            // IMPLEMENTAÇÃO REAL: Chame sua API de unfollow aqui
            console.log(`Deixando de seguir profissional ID: ${professionalId}`);
            alert(`Você deixou de seguir ${professionalName}.`);
        }
    };

    return (
        <Card className="shadow-lg mb-4 border-primary">
            <Card.Header className="fw-bold bg-primary text-white d-flex align-items-center">
                <Heart size={20} className="me-2" /> Meus Profissionais Favoritos ({followingList.length})
            </Card.Header>

            {/* 🚨 NOVO BLOCO: CAMPO DE BUSCA */}
            <Card.Body className="p-3 pb-0">
                <Form.Group className="mb-3 d-flex align-items-center">
                    <Search size={18} className="text-muted me-2" />
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nome ou especialidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Card.Body>
            
            {/* CORPO DA LISTA: APLICANDO ALTURA MÁXIMA E ROLAGEM */}
            <Card.Body 
                className="p-0 border-top" 
                style={{ maxHeight: '300px', overflowY: 'auto' }}
            >
                
                {filteredList.length === 0 ? (
                    <p className="p-3 text-center text-muted m-0">
                        {searchTerm ? "Nenhum profissional encontrado com esse termo." : "Você ainda não segue nenhum profissional."}
                    </p>
                ) : (
                    <ListGroup variant="flush">
                        {/* Renderiza a lista FILTRADA */}
                        {filteredList.map(prof => (
                            <ListGroup.Item key={prof.id} className="d-flex justify-content-between align-items-center py-2">
                                <div className="d-flex align-items-center">
                                    <img 
                                        src={prof.avatar} 
                                        alt={prof.name} 
                                        className="rounded-circle me-3" 
                                        style={{ width: '35px', height: '35px', objectFit: 'cover' }} 
                                    />
                                    <div>
                                        <Link to={`/professional/${prof.id}`} className="fw-bold text-decoration-none" style={{ color: 'var(--dark-text)' }}>
                                            {prof.name}
                                        </Link>
                                        <div className="small text-muted">{prof.role}</div>
                                    </div>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleUnfollow(prof.id, prof.name)}>
                                    <UserMinus size={16} />
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );
};

export default FollowingProfessionalsList;