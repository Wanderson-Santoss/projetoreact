import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { Search, StarFill, PersonCircle, GeoAltFill, BriefcaseFill } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';

// ====================================================================
// MOCKS E COMPONENTES AUXILIARES (Para replicar o layout de image_3e7c15.jpg)
// ====================================================================

// MOCK: ICON_MAP (Simula o mapeamento de ícones)
const ICON_MAP = {
    ferramentas: { Icon: BriefcaseFill, name: 'Ferramentas' },
    construcao: { Icon: BriefcaseFill, name: 'Construção' },
    beleza: { Icon: PersonCircle, name: 'Beleza' },
    eletricista: { Icon: BriefcaseFill, name: 'Eletricista' },
    saude: { Icon: PersonCircle, name: 'Saúde' },
    financas: { Icon: BriefcaseFill, name: 'Finanças' },
    alimentos: { Icon: PersonCircle, name: 'Alimentos' },
    educacao: { Icon: BriefcaseFill, name: 'Educação' },
    tecnologia: { Icon: BriefcaseFill, name: 'Tecnologia' },
    servicos: { Icon: BriefcaseFill, name: 'Serviços' },
    jardinagem: { Icon: BriefcaseFill, name: 'Jardinagem' },
    // Adicionais do seu layout
    destaques: { Icon: StarFill, name: 'Destaques' },
    promocoes: { Icon: StarFill, name: 'Promoções' },
    certificados: { Icon: BriefcaseFill, name: 'Certificados' },
    entregas: { Icon: BriefcaseFill, name: 'Entregas' },
    limpeza: { Icon: BriefcaseFill, name: 'Limpeza' },
    geral: { Icon: BriefcaseFill, name: 'Geral' },
};

// MOCK: cleanServiceName
const cleanServiceName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

// COMPONENTE: CategoryButton (Para a barra horizontal de categorias)
const CategoryButton = ({ name, IconComponent, onClick, isSelected }) => (
    <Button 
        variant={isSelected ? 'warning' : 'outline-secondary'} 
        className="text-nowrap mx-1 px-3 py-2 fw-bold"
        onClick={onClick}
        style={{ 
            color: isSelected ? 'black' : 'white', 
            backgroundColor: isSelected ? 'var(--primary-color, #ffc107)' : 'transparent',
            borderColor: isSelected ? 'var(--primary-color, #ffc107)' : '#495057',
            transition: 'all 0.3s'
        }}
    >
        <IconComponent size={14} className="me-1" /> {name}
    </Button>
);

// COMPONENTE MOCKADO: ProfileCard (Para replicar o visual da imagem)
const ProfileCard = ({ professional }) => {
    // Simula a URL da imagem de perfil (avatar)
    const avatarUrl = professional.avatar_url || `https://via.placeholder.com/60/${professional.id % 2 === 0 ? 'ffc107' : '007bff'}/ffffff?text=${professional.full_name[0]}`;
    // MOCK: Simula a descrição
    const mockDescription = `Especialista em ${professional.servico_principal.toLowerCase()} com ${professional.rating} de satisfação.`;

    return (
        // Usamos Col md={3} para 4 cards por linha em telas grandes/médias
        <Col md={3} sm={6} xs={12} className="mb-4"> 
            <div className="card h-100 shadow-sm bg-light" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                <div className="p-3 d-flex align-items-center">
                    <img
                        src={avatarUrl}
                        alt={professional.full_name}
                        className="rounded-circle me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', border: '2px solid #ffc107' }}
                    />
                    <div>
                        <h6 className="mb-0 fw-bold text-dark">{professional.full_name}</h6>
                        <span className="small text-muted">{professional.servico_principal}</span>
                    </div>
                </div>

                <div className="card-body pt-0 pb-2">
                    <p className="small mb-2 text-dark">
                        {mockDescription}
                        <Link to={`/profissionais/${professional.id}`} className="ms-1 small text-primary" style={{ whiteSpace: 'nowrap' }}>
                            ler mais...
                        </Link>
                    </p>
                    <div className="d-flex align-items-center small mb-2 text-dark">
                        <GeoAltFill size={14} className="me-1 text-primary" />
                        {professional.cidade}, Brasil
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        {/* Rating */}
                        <div className="d-flex align-items-center">
                            <StarFill size={12} className="text-warning me-1" />
                            <span className="fw-bold text-dark">{professional.rating.toFixed(1)}/5</span>
                        </div>
                        {/* Botão Seguir */}
                        <Button variant="outline-primary" size="sm" className="fw-bold py-1">
                            + Seguir
                        </Button>
                    </div>
                </div>
            </div>
        </Col>
    );
};


// ====================================================================
// COMPONENTE PRINCIPAL MainFeed
// ====================================================================

const MainFeed = () => {
    
    // --- ESTADOS ---
    const [professionals, setProfessionals] = useState([]);
    const [services, setServices] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedServiceId, setSelectedServiceId] = useState('Todos');

    const PROFESSIONALS_URL = '/api/v1/accounts/profissionais/';
    const SERVICES_URL = '/api/v1/servicos/'; 

    // MOCK DE DADOS DO PROFILE (Para ter conteúdo no feed)
    const MOCKED_PROFESSIONALS = [
        // Destaques (Ratings altos)
        { id: 1, full_name: "Confeiteira Juliana Doces", email: "j1@t.com", servico_principal: "Confeiteira", cidade: "Rio de Janeiro", rating: 5.0, avatar_url: 'https://via.placeholder.com/60/ffb3ba/ffffff?text=J' },
        { id: 2, full_name: "Eletricista Carlos Mendes", email: "c1@t.com", servico_principal: "Eletricista", cidade: "São Paulo", rating: 4.5, avatar_url: 'https://via.placeholder.com/60/ADD8E6/000000?text=C' },
        { id: 3, full_name: "Cabeleireira Ana Costa", email: "a1@t.com", servico_principal: "Cabeleireira", cidade: "Belo Horizonte", rating: 3.5, avatar_url: 'https://via.placeholder.com/60/d1d1d1/000000?text=A' },
        { id: 4, full_name: "Carpinteiro Roberto Dias", email: "r1@t.com", servico_principal: "Carpinteiro", cidade: "Curitiba", rating: 3.5, avatar_url: 'https://via.placeholder.com/60/90EE90/000000?text=R' },
        // Promoções/Disponíveis
        { id: 5, full_name: "Designer Pedro Rocha", email: "p1@t.com", servico_principal: "Designer Gráfico", cidade: "Salvador", rating: 4.1, avatar_url: 'https://via.placeholder.com/60/FFA07A/000000?text=P' },
        { id: 6, full_name: "Encanador João Alves", email: "j2@t.com", servico_principal: "Encanador", cidade: "Recife", rating: 4.9, avatar_url: 'https://via.placeholder.com/60/87CEFA/000000?text=J' },
        { id: 7, full_name: "Ajudante de Mudança", email: "a2@t.com", servico_principal: "Transporte", cidade: "Porto Alegre", rating: 3.9, avatar_url: 'https://via.placeholder.com/60/808080/FFFFFF?text=A' },
        { id: 8, full_name: "Desenvolvedor Full Stack", email: "d1@t.com", servico_principal: "Tecnologia", cidade: "Brasília", rating: 4.2, avatar_url: 'https://via.placeholder.com/60/F0F8FF/000000?text=D' },
        // Mais disponíveis
        { id: 9, full_name: "Jardineiro Local", email: "j3@t.com", servico_principal: "Jardinagem", cidade: "Florianópolis", rating: 4.6, avatar_url: 'https://via.placeholder.com/60/20B2AA/FFFFFF?text=J' },
    ];
    
    // MOCK de Serviços (Expandido para incluir todos os da imagem)
    const MOCKED_SERVICES = [
        { id: 'ferramentas', name: 'Ferramentas' },
        { id: 'construcao', name: 'Construção' },
        { id: 'beleza', name: 'Beleza' },
        { id: 'eletricista', name: 'Eletricista' },
        { id: 'saude', name: 'Saúde' },
        { id: 'financas', name: 'Finanças' },
        { id: 'alimentos', name: 'Alimentos' },
        { id: 'educacao', name: 'Educação' },
        { id: 'tecnologia', name: 'Tecnologia' },
        { id: 'servicos', name: 'Serviços' },
        { id: 'jardinagem', name: 'Jardinagem' },
        { id: 'destaques', name: 'Destaques' },
        { id: 'promocoes', name: 'Promoções' },
        { id: 'certificados', name: 'Certificados' },
        { id: 'entregas', name: 'Entregas' },
        { id: 'limpeza', name: 'Limpeza' },
    ];


    // --- EFEITO 1: CARREGAR DADOS (MOCKADO) ---
    useEffect(() => {
        const fetchData = async () => {
             await new Promise(resolve => setTimeout(resolve, 500)); 

            try {
                const dataWithService = MOCKED_PROFESSIONALS.map(prof => ({
                    ...prof,
                    // Mapeia o serviço pelo nome principal limpo
                    service_id: cleanServiceName(prof.servico_principal), 
                }));

                setServices(MOCKED_SERVICES);
                setProfessionals(dataWithService); 
            } catch (err) {
                setError("Não foi possível carregar os dados de profissionais ou serviços (MOCK).");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- LÓGICA DE FILTRO ---
    const filteredProfessionals = professionals.filter(prof => {
        const serviceMatch = selectedServiceId === 'Todos' || prof.service_id === cleanServiceName(selectedServiceId);
        const search = searchTerm.toLowerCase();
        
        const nameMatch = prof.full_name ? prof.full_name.toLowerCase().includes(search) : false;
        const serviceAreaMatch = prof.servico_principal ? prof.servico_principal.toLowerCase().includes(search) : false;

        return serviceMatch && (nameMatch || serviceAreaMatch);
    });
    
    // Simulação de agrupamento: 4 Destaques, 4 Promoções, Restante Disponíveis
    const highlights = filteredProfessionals.slice(0, 4);
    const promotions = filteredProfessionals.length > 4 ? filteredProfessionals.slice(4, 8) : [];
    const available = filteredProfessionals.slice(highlights.length + promotions.length);

    // --- FUNÇÃO AUXILIAR PARA RENDERIZAR O ÍCONE ---
    const getServiceIcon = (serviceName) => {
        const key = cleanServiceName(serviceName);
        return ICON_MAP[key] || ICON_MAP['geral'];
    };

    if (loading) {
        return (
            <Container className="text-center py-5" style={{ minHeight: '80vh', backgroundColor: '#343a40' }}>
                <Spinner animation="border" style={{ color: 'var(--primary-color)' }} />
                <p className="mt-2 text-white">Buscando...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5" style={{ minHeight: '80vh', backgroundColor: '#343a40' }}>
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }
    
    // Seção para renderizar os cards de uma categoria
    const ProfessionalsSection = ({ title, professionalsList }) => (
        <>
            <h3 className="text-dark text-center fw-bold mt-5 mb-3">{title}</h3>
            {professionalsList.length > 0 ? (
                <Row className="justify-content-center">
                    {professionalsList.map(prof => (
                        <ProfileCard key={prof.id} professional={prof} />
                    ))}
                </Row>
            ) : (
                <p className="text-center text-secondary">Nenhum profissional encontrado nesta categoria.</p>
            )}
        </>
    );

    return (
        // O fundo do MainFeed deve ser branco/claro, mas o Header/Footer escuro, 
        // para replicar o contraste da imagem.
        <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
            
            {/* 1. BARRA DE CATEGORIAS (TOPO) - Layout da Imagem */}
            {/* Mantido como um componente isolado. Idealmente, ele estaria no Header */}
            <div className="bg-dark shadow-lg py-2 border-bottom border-warning">
                <Container>
                    <div className="d-flex overflow-auto py-2">
                         {/* Botão TODOS */}
                        <CategoryButton
                            name="Todos"
                            IconComponent={ICON_MAP['geral'].Icon} 
                            isSelected={'Todos' === selectedServiceId}
                            onClick={() => setSelectedServiceId('Todos')}
                        />
                        
                        {/* Mapeia as categorias da API (ou MOCK) */}
                        {services.map(service => {
                            const iconData = getServiceIcon(service.name);
                            const IconComponent = iconData?.Icon || ICON_MAP['geral'].Icon;
                            const serviceId = cleanServiceName(service.name);
                            
                            return (
                                <CategoryButton
                                    key={serviceId}
                                    name={service.name}
                                    IconComponent={IconComponent}
                                    isSelected={serviceId === selectedServiceId}
                                    onClick={() => setSelectedServiceId(serviceId)}
                                />
                            );
                        })}
                    </div>
                </Container>
            </div>
            
            {/* 2. BARRA DE BUSCA E BANNER (Opcional) */}
            {/* O design que você enviou antes (image_3e7096.png) tem a busca, 
                então vamos incluí-la no topo do conteúdo. */}
            <Container className="mt-4 mb-5">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Form>
                            <Form.Group className="d-flex shadow-sm">
                                <Form.Control
                                    type="text"
                                    placeholder="Busque por nome, e-mail ou tipo de serviço..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-warning"
                                    style={{ borderRadius: '4px 0 0 4px' }}
                                />
                                <Button variant="warning" style={{ borderRadius: '0 4px 4px 0' }}>
                                    <Search size={20} className="text-dark" /> Buscar
                                </Button>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
            </Container>

            {/* 3. IMAGENS/BANNER DE DESTAQUE (Simuladas) */}
            <Container className="mb-5">
                <Row className="g-2">
                    {/* Simula as imagens/banners visíveis na imagem de referência */}
                    <Col md={3} xs={6}><div style={{ height: '150px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div></Col>
                    <Col md={3} xs={6}><div style={{ height: '150px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div></Col>
                    <Col md={3} xs={6}><div style={{ height: '150px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div></Col>
                    <Col md={3} xs={6}><div style={{ height: '150px', backgroundColor: '#e9ecef', borderRadius: '4px' }}></div></Col>
                </Row>
            </Container>


            {/* 4. SEÇÕES DE CARDS (DESTAQUES / PROMOÇÕES / DISPONÍVEIS) */}
            <Container className="mb-5">
                {/* O texto deve ser escuro (text-dark) já que o fundo é claro (white) */}
                <ProfessionalsSection title="Destaques" professionalsList={highlights} />
                <ProfessionalsSection title="Promoções" professionalsList={promotions} />
                <ProfessionalsSection title="Disponíveis" professionalsList={available} />

                {/* Mensagem se não houver resultados */}
                {filteredProfessionals.length === 0 && searchTerm && (
                    <Alert variant="info" className="text-center mt-5 text-dark">
                        Nenhum profissional encontrado para "{searchTerm}" e categoria selecionada.
                    </Alert>
                )}
            </Container>
            
        </div>
    );
};

export default MainFeed;