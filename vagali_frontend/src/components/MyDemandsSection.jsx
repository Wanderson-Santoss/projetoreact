import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Alert, ListGroup, Collapse } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';
// 💡 CORREÇÃO: Adicionado ChevronRight à lista de ícones
import { PlusCircle, Edit, Trash2, ListChecks, Filter, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'; 
import { useAuth } from './AuthContext'; // Certifique-se de que este caminho está correto

// --- DADOS SIMULADOS PARA TESTE ---\
const SIMULATED_DEMANDS = [
    { id: 'd1', title: 'Reparo de vazamento no banheiro', status: 'Pendente', category: 'Hidráulica', date: '2025-11-10', cost: 'R$ 150 - 300' },
    { id: 'd2', title: 'Instalação de lustre na sala', status: 'Em Negociação', category: 'Eletricidade', date: '2025-11-08', cost: 'R$ 500' },
    { id: 'd3', title: 'Pintura da fachada da casa', status: 'Concluída', category: 'Pintura', date: '2025-10-01', cost: 'R$ 2500' },
    { id: 'd4', title: 'Montagem de 3 móveis planejados', status: 'Pendente', category: 'Outros', date: '2025-11-11', cost: 'A definir' },
    { id: 'd5', title: 'Jardinagem e paisagismo', status: 'Em Negociação', category: 'Jardinagem', date: '2025-11-12', cost: 'R$ 800' },
    { id: 'd6', title: 'Instalação de ar condicionado', status: 'Concluída', category: 'Climatização', date: '2025-09-15', cost: 'R$ 350' },
];

const STATUS_MAP = {
    'Pendente': { variant: 'warning', text: 'Aberto' },
    'Em Negociação': { variant: 'info', text: 'Conversando' },
    'Concluída': { variant: 'success', text: 'Fechada' },
    'Cancelada': { variant: 'danger', text: 'Cancelada' },
};

const MyDemandsSection = () => {
    // const { user } = useAuth(); // Assume-se que useAuth está funcionando corretamente agora
    const [demands, setDemands] = useState(SIMULATED_DEMANDS);
    const [currentFilter, setCurrentFilter] = useState('Todas');
    const [isOpen, setIsOpen] = useState(true);

    // 1. Contagem de status para os botões de filtro
    const statusCounts = useMemo(() => {
        const counts = { 'Todas': demands.length };
        demands.forEach(d => {
            counts[d.status] = (counts[d.status] || 0) + 1;
        });
        return counts;
    }, [demands]);

    // 2. Filtragem de demandas
    const filteredDemands = useMemo(() => {
        if (currentFilter === 'Todas') {
            return demands;
        }
        return demands.filter(d => d.status === currentFilter);
    }, [demands, currentFilter]);

    // 3. Função de renderização de um item de demanda
    const renderDemandItem = (demand) => {
        const statusInfo = STATUS_MAP[demand.status] || { variant: 'secondary', text: 'Desconhecido' };
        
        return (
            <ListGroup.Item 
                key={demand.id} 
                className="d-flex justify-content-between align-items-center py-3 my-1 border-bottom border-light"
                style={{ backgroundColor: '#f8fafc' }} // Cor de fundo suave
            >
                <div className="flex-grow-1 me-3">
                    {/* Título e Categoria */}
                    <div className="d-flex align-items-center mb-1">
                        <ListChecks size={20} className="text-primary me-2 flex-shrink-0" />
                        <Link 
                            to={`/demanda/${demand.id}`} 
                            className="fw-bold text-decoration-none text-dark hover-text-warning"
                        >
                            {demand.title}
                        </Link>
                    </div>

                    {/* Detalhes Secundários */}
                    <div className="small text-muted ms-4">
                        <span className="me-3">Categoria: {demand.category}</span>
                        <span>Custo Estimado: {demand.cost}</span>
                    </div>
                </div>

                {/* Status e Ações */}
                <div className="d-flex flex-column align-items-end flex-shrink-0">
                    {/* Status */}
                    <Badge bg={statusInfo.variant} className="mb-2 fw-bold" style={{ minWidth: '100px', textAlign: 'center' }}>
                        {statusInfo.text}
                    </Badge>
                    
                    {/* Ações */}
                    <div className="d-flex gap-2">
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => console.log('Editar demanda:', demand.id)}
                            title="Editar"
                        >
                            <Edit size={16} />
                        </Button>
                        <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => console.log('Cancelar demanda:', demand.id)}
                            title="Cancelar"
                        >
                            <Trash2 size={16} />
                        </Button>
                        <Button 
                            as={Link}
                            to={`/demanda/${demand.id}`} 
                            variant="outline-secondary" 
                            size="sm"
                            title="Ver Detalhes"
                        >
                            {/* O ícone ChevronRight que estava faltando */}
                            <ChevronRight size={16} /> 
                        </Button>
                    </div>
                </div>
            </ListGroup.Item>
        );
    };

    // 4. Renderização Principal
    return (
        <Card className="mb-4 bg-vagali-dark-card shadow">
            <Card.Header 
                className="fw-bold fs-5 d-flex justify-content-between align-items-center cursor-pointer" 
                onClick={() => setIsOpen(!isOpen)}
            >
                <ListChecks size={24} className="me-2" /> 
                Minhas Demandas (Cliente)
                {isOpen ? <ChevronUp /> : <ChevronDown />}
            </Card.Header>
            <Collapse in={isOpen}>
                <div>
                    <Card.Body>
                        <div className="mb-3 d-flex flex-wrap gap-2">
                            <Button 
                                as={Link} 
                                to="/criar-demanda" 
                                variant="success" 
                                className="fw-bold d-flex align-items-center me-3"
                                size="sm"
                            >
                                <PlusCircle size={20} className="me-2" /> 
                                Nova Demanda
                            </Button>
                            {Object.keys(statusCounts).map(filter => (
                                <Button
                                    key={filter}
                                    variant={currentFilter === filter ? 'warning' : 'outline-secondary'}
                                    onClick={() => setCurrentFilter(filter)}
                                    size="sm"
                                >
                                    {filter} 
                                    <Badge bg={currentFilter === filter ? 'dark' : 'secondary'} className="ms-2">
                                        {statusCounts[filter]}
                                    </Badge>
                                </Button>
                            ))}
                        </div>

                        {/* LISTA DE DEMANDAS COM ROLAGEM */}
                        {demands.length === 0 ? (
                            <Alert variant="info" className="text-center">
                                Você não tem nenhuma demanda ativa. Crie uma acima!
                            </Alert>
                        ) : (
                            // DIV CONTÊINER PARA CONTROLAR A ROLAGEM
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}> 
                                <ListGroup variant="flush">
                                    {filteredDemands.length > 0 ? (
                                        filteredDemands.map(renderDemandItem)
                                    ) : (
                                        <Alert variant="light" className="text-center">
                                            Nenhuma demanda encontrada com o status "{currentFilter}".
                                        </Alert>
                                    )}
                                </ListGroup>
                            </div>
                        )}
                    </Card.Body>
                </div>
            </Collapse>
        </Card>
    );
};

export default MyDemandsSection;