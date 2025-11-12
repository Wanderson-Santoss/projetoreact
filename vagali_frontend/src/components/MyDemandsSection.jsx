import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Alert, ListGroup, Collapse } from 'react-bootstrap'; 
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, ListChecks, Filter, ChevronDown, ChevronUp } from 'lucide-react'; 
import { useAuth } from './AuthContext'; // Certifique-se de que este caminho está correto

// --- DADOS SIMULADOS PARA TESTE ---
const SIMULATED_DEMANDS = [
    { id: 'd1', title: 'Reparo de vazamento no banheiro', status: 'Pendente', category: 'Hidráulica', date: '2025-11-10', cost: 'R$ 150 - 300' },
    { id: 'd2', title: 'Instalação de lustre na sala', status: 'Em Negociação', category: 'Eletricidade', date: '2025-11-08', cost: 'R$ 500' },
    { id: 'd3', title: 'Pintura da fachada da casa', status: 'Concluída', category: 'Pintura', date: '2025-10-01', cost: 'R$ 2500' },
    { id: 'd4', title: 'Montagem de 3 móveis planejados', status: 'Pendente', category: 'Outros', date: '2025-11-11', cost: 'A definir' },
    { id: 'd5', title: 'Limpeza de caixa d\'água', status: 'Em Negociação', category: 'Limpeza', date: '2025-11-05', cost: 'R$ 150' },
    { id: 'd6', title: 'Troca de fiação antiga', status: 'Pendente', category: 'Eletricidade', date: '2025-11-12', cost: 'R$ 1000' },
];

// Mapeamento de Status para Cor
const STATUS_VARIANT = {
    'Pendente': 'danger', 
    'Em Negociação': 'warning', 
    'Concluída': 'success', 
};

const MyDemandsSection = () => {
    const { isUserProfessional } = useAuth(); 
    const [currentFilter, setCurrentFilter] = useState('Todas'); 
    const [demands, setDemands] = useState(SIMULATED_DEMANDS);
    
    // ESTADO: Controle de Colapso
    const [isDemandsCollapsed, setIsDemandsCollapsed] = useState(false); 

    if (isUserProfessional) {
        return null; 
    }

    const filterOptions = ['Todas', 'Pendente', 'Em Negociação', 'Concluída'];

    // CÁLCULO: Conta o número de demandas por status
    const statusCounts = useMemo(() => {
        const counts = {
            'Todas': demands.length,
            'Pendente': 0,
            'Em Negociação': 0,
            'Concluída': 0,
        };
        demands.forEach(demand => {
            if (counts[demand.status] !== undefined) {
                counts[demand.status] += 1;
            }
        });
        return counts;
    }, [demands]);

    // Lógica de Filtragem
    const filteredDemands = useMemo(() => {
        if (currentFilter === 'Todas') {
            return demands;
        }
        return demands.filter(d => d.status === currentFilter);
    }, [demands, currentFilter]);

    // Ação de Deletar
    const handleDelete = (demandId) => {
        if (window.confirm("Tem certeza que deseja excluir esta demanda? Esta ação não pode ser desfeita.")) {
            setDemands(prev => prev.filter(d => d.id !== demandId));
            console.log(`Demanda ${demandId} excluída.`);
        }
    };

    // Renderização de Item de Demanda
    const renderDemandItem = (demand) => {
        const isPending = demand.status === 'Pendente';
        const isCompleted = demand.status === 'Concluída';

        return (
            <ListGroup.Item 
                key={demand.id} 
                className="d-flex justify-content-between align-items-center flex-wrap"
                style={{ borderLeft: `5px solid var(--bs-${STATUS_VARIANT[demand.status]})` }}
            >
                <div>
                    <h6 className="mb-1 fw-bold">{demand.title}</h6>
                    <small className="text-muted d-block">
                        Categoria: {demand.category} | Valor Estimado: {demand.cost}
                    </small>
                    <small className="text-muted">
                        Criada em: {demand.date}
                    </small>
                </div>

                <div className="d-flex align-items-center mt-2 mt-sm-0">
                    <Badge bg={STATUS_VARIANT[demand.status]} className="me-2">{demand.status}</Badge>

                    {/* EDITAR (SÓ PODE SE ESTIVER PENDENTE) */}
                    {isPending && (
                        <Button 
                            as={Link}
                            to={`/editar-demanda/${demand.id}`} 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            title="Editar Demanda"
                        >
                            <Edit size={16} />
                        </Button>
                    )}

                    {/* EXCLUIR (PENDENTE E CONCLUÍDA) */}
                    {(isPending || isCompleted) && (
                        <Button 
                            variant="outline-danger" 
                            size="sm"
                            title="Excluir Demanda"
                            onClick={() => handleDelete(demand.id)}
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </ListGroup.Item>
        );
    };

    return (
        <Card className="shadow-lg mb-4 border-primary">
            {/* HEADER COM BOTÃO DE COLAPSO */}
            <Card.Header 
                className="fw-bold bg-primary text-white d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsDemandsCollapsed(!isDemandsCollapsed)} // Toggle
                aria-controls="demands-collapse-body"
                aria-expanded={!isDemandsCollapsed}
            >
                <div className="d-flex align-items-center">
                    <ListChecks size={20} className="me-2"/> Suas Demandas
                </div>
                {isDemandsCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </Card.Header>
            
            {/* CORPO DO CARD WRAPADO PELO COLLAPSE */}
            <Collapse in={!isDemandsCollapsed}>
                <div id="demands-collapse-body">
                    <Card.Body>
                        {/* BOTÃO CRIAR NOVA DEMANDA */}
                        <div className="text-center mb-4">
                            <Button 
                                as={Link} 
                                to="/criar-demanda" 
                                variant="warning" 
                                className="fw-bold py-2 px-5"
                            >
                                <PlusCircle size={20} className="me-2" /> CRIAR NOVA DEMANDA
                            </Button>
                        </div>
                        
                        {/* FILTROS DE STATUS COM CONTAGEM */}
                        <div className="d-flex flex-wrap align-items-center mb-3">
                            <span className="me-3 fw-bold d-flex align-items-center text-muted">
                                <Filter size={18} className="me-1" /> Filtrar por:
                            </span>
                            {filterOptions.map(filter => (
                                <Button
                                    key={filter}
                                    variant={currentFilter === filter ? 'info' : 'outline-secondary'}
                                    size="sm"
                                    className="me-2 mb-2"
                                    onClick={() => setCurrentFilter(filter)}
                                >
                                    {filter} 
                                    {/* Badge com estilo aprimorado */}
                                    <Badge 
                                        bg={currentFilter === filter ? 'light' : 'secondary'} 
                                        text={currentFilter === filter ? 'info' : 'white'} 
                                        className="ms-1 rounded-pill py-1 px-2"
                                    >
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