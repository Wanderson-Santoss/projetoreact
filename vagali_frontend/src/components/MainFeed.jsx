import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, FormControl, InputGroup, Carousel, Alert, Pagination } from 'react-bootstrap';
import { Search, Briefcase, Star, MapPin, ChevronRight, Share2, BriefcaseMedical } from 'lucide-react';
import { Link } from 'react-router-dom';

// ====================================================================
// MOCK DE DADOS
// ====================================================================

const DEFAULT_AVATAR = 'https://via.placeholder.com/80/ffc107/000000?text=P';

// MOCK para as Categorias no topo (mantido)
const MOCKED_CATEGORIES = [
    { name: 'Todos', icon: 'Todos' },
    { name: 'Ferramentas', icon: 'Ferramentas' },
    { name: 'Construção', icon: 'Construção' },
    { name: 'Beleza', icon: 'Beleza' },
    { name: 'Eletricista', icon: 'Eletricista' },
    { name: 'Saúde', icon: 'Saúde' },
    { name: 'Finanças', icon: 'Finanças' },
    { name: 'Alimentos', icon: 'Alimentos' },
    { name: 'Educação', icon: 'Educação' },
    { name: 'Tecnologia', icon: 'Tecnologia' },
];

// MOCK para os BANNERS (mantido)
const MOCKED_BANNERS = [
    { 
        id: 1, 
        src: 'https://picsum.photos/1200/300?random=1', 
        alt: 'Banner 1: Grande Promoção', 
        caption: 'Os melhores profissionais com preços incríveis!',
        link: '/promocoes' 
    },
    { 
        id: 2, 
        src: 'https://picsum.photos/1200/300?random=2', 
        alt: 'Banner 2: Área do Profissional', 
        caption: 'Seja um profissional VagAli. Cadastre-se agora!',
        link: '/register'
    },
    { 
        id: 3, 
        src: 'https://picsum.photos/1200/300?random=3', 
        alt: 'Banner 3: Serviços de Construção', 
        caption: 'Reformas e Construções com qualidade garantida.',
        link: '/search?category=construcao'
    },
];

// MOCK para os Profissionais em Destaque
const MOCKED_PROFESSIONALS = [
    { 
        id: 'wanderson', 
        name: 'Wanderson Santos', 
        service: 'Eletricista', 
        rating: 4.5, 
        city: 'São Paulo', 
        state: 'SP',
        avatar_url: 'https://picsum.photos/80/80?random=4',
        short_bio: 'Especialista em instalações e manutenções prediais com certificação NR-10.',
        total_reviews: 20
    },
    { 
        id: 'novo-teste', 
        name: 'Novo Nome de Cadastro de Teste', 
        service: 'Pedreiro', 
        rating: 5.0, 
        city: 'Rio de Janeiro', 
        state: 'RJ',
        avatar_url: 'https://picsum.photos/80/80?random=5',
        short_bio: 'Mestre de obras com foco em alvenaria e acabamentos finos.',
        total_reviews: 5
    },
    { 
        id: 'juliana', 
        name: 'Juliana Doces', 
        service: 'Confeiteira', 
        rating: 5.0, 
        city: 'Curitiba', 
        state: 'PR',
        avatar_url: 'https://picsum.photos/80/80?random=6',
        short_bio: 'Especialista em doces para casamentos, bolos, tortas e outros.',
        total_reviews: 45
    },
];

// ====================================================================
// FUNÇÕES AUXILIARES (Mantidas)
// ====================================================================

const getCategoryIcon = (name) => {
    if (name === 'Todos') return '🧺';
    if (name === 'Ferramentas') return '🛠️';
    if (name === 'Construção') return '🏗️';
    if (name === 'Beleza') return '💅';
    return '⭐'; 
}

// Função para renderizar estrelas
const renderRatingStars = (rating, totalReviews) => {
    const fullStars = Math.floor(rating);
    return (
        <div className="d-flex align-items-center">
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    size={16} 
                    fill={i < fullStars ? 'gold' : 'gray'} 
                    stroke={i < fullStars ? 'gold' : 'gray'} 
                    className="me-1" 
                />
            ))}
            <small className="ms-1 fw-bold text-dark">{rating.toFixed(1)}/5</small>
            <small className="ms-3 text-muted">({totalReviews} avaliações)</small>
        </div>
    );
};

// ====================================================================
// COMPONENTE CORRIGIDO: PROFESSIONAL CARD
// ====================================================================
const ProfessionalCard = ({ pro }) => {
    
    // A rota é construída de forma a enviar o ID do profissional para a tela de perfil público
    const profileUrl = `/profissionais/${pro.id}`;

    return (
        <Card className="shadow-sm h-100 bg-light border-warning border-2 hover-effect" style={{ cursor: 'pointer' }}>
            
            {/* O Card NÃO é mais um Link principal, permitindo Links internos */}
            <Card.Body className="d-flex flex-column">
                
                {/* Linha 1: Foto, Nome e Serviço */}
                {/* Tornando a foto e o nome clicáveis (Link) */}
                <Link to={profileUrl} className="d-flex align-items-start text-decoration-none text-dark mb-3">
                    <img
                        src={pro.avatar_url || DEFAULT_AVATAR}
                        alt={pro.name}
                        className="rounded-circle me-3 border border-warning"
                        style={{ width: '65px', height: '65px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                        {/* NOME EM DESTAQUE */}
                        <h5 className="fw-bold mb-0">{pro.name}</h5> 
                        {/* SERVIÇO PRINCIPAL */}
                        <p className="small text-secondary mb-1">{pro.service}</p> 
                        
                        <small className="text-muted d-flex align-items-center">
                            <MapPin size={14} className="me-1 text-secondary" /> {pro.city}, {pro.state}
                        </small>
                    </div>
                </Link>
                
                {/* Linha 2: Descrição Curta (Texto escuro) */}
                <div className="mb-3 border-top pt-3">
                    <p className="small text-dark mb-0">
                        {pro.short_bio} 
                        {/* O 'ler mais...' agora é um Link funcional */}
                        <Link to={profileUrl} className="text-primary ms-1 fw-bold text-decoration-none">
                            ler mais...
                        </Link>
                    </p>
                </div>

                {/* Linha 3: Avaliação e Botão de Ação */}
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    
                    {/* Avaliação */}
                    {renderRatingStars(pro.rating, pro.total_reviews)}
                    
                    {/* Botão de Ação: É um Link funcional */}
                    <Button 
                        as={Link}
                        to={profileUrl}
                        variant="warning" 
                        className="fw-bold d-flex align-items-center px-3"
                    >
                        Ver Perfil <ChevronRight size={16} className="ms-1" />
                    </Button>
                </div>

            </Card.Body>
        </Card>
    );
};


// ====================================================================
// COMPONENTE PRINCIPAL: MAIN FEED
// ====================================================================
const MainFeed = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(MOCKED_PROFESSIONALS);
    
    // LÓGICA DE BUSCA (Mockada)
    const handleSearch = (e) => {
        e.preventDefault();
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const filtered = MOCKED_PROFESSIONALS.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.service.toLowerCase().includes(term) ||
                p.city.toLowerCase().includes(term)
            );
            setSearchResults(filtered);
        } else {
            setSearchResults(MOCKED_PROFESSIONALS);
        }
    };
    
    // ----------------------------------------------------------------
    // RENDERIZAÇÃO
    // ----------------------------------------------------------------
    
    return (
        <>
            {/* 1. BARRA DE CATEGORIAS */}
            <div className="bg-dark border-bottom border-warning py-2 overflow-auto">
                <Container>
                    <div className="d-flex flex-nowrap align-items-center">
                        {MOCKED_CATEGORIES.map(cat => (
                            <Button
                                key={cat.name}
                                variant={cat.name === 'Todos' ? "warning" : "outline-light"}
                                onClick={() => console.log(`Filtro: ${cat.name}`)}
                                className="d-flex align-items-center me-2 flex-shrink-0"
                            >
                                {getCategoryIcon(cat.name)} {cat.name}
                            </Button>
                        ))}
                    </div>
                </Container>
            </div>

            <Container className="my-4">
                
                {/* 2. CAMPO DE BUSCA */}
                <Row className="justify-content-center mb-5">
                    <Col md={8}>
                        <Form onSubmit={handleSearch}>
                            <InputGroup className="shadow">
                                <FormControl
                                    type="search"
                                    placeholder="Busque por nome, serviço ou cidade..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="p-3 border-end-0 border-warning"
                                    style={{ height: '60px', backgroundColor: '#333', color: 'white' }}
                                />
                                <Button 
                                    variant="warning" 
                                    type="submit" 
                                    className="px-4 fw-bold"
                                    style={{ height: '60px' }}
                                >
                                    <Search size={24} className="text-dark" /> Buscar
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                </Row>
                
                {/* 3. CARROSSEL DE BANNERS DE DESTAQUE */}
                <Row className="mb-5">
                    <Col>
                        <Carousel 
                            interval={5000} 
                            controls={true} 
                            indicators={true} 
                            pause="hover" 
                            className="bg-dark rounded shadow-lg"
                        >
                            {MOCKED_BANNERS.map((banner) => (
                                <Carousel.Item key={banner.id}>
                                    <Link to={banner.link || '#'} style={{ display: 'block' }}>
                                        <img
                                            className="d-block w-100 rounded"
                                            src={banner.src}
                                            alt={banner.alt}
                                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                        <Carousel.Caption className="bg-dark bg-opacity-75 p-2 rounded">
                                            <h3 className="fw-bold text-warning">{banner.alt.split(':')[0]}</h3>
                                            <p className="d-none d-sm-block small mb-0">{banner.caption}</p>
                                        </Carousel.Caption>
                                    </Link>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>

                {/* 4. LISTAGEM DE PROFISSIONAIS EM DESTAQUE - USANDO O CARD CORRIGIDO */}
                <h2 className="mb-4 text-warning">Profissionais em Destaque</h2>
                
                <Row>
                    {searchResults.map(pro => (
                        <Col xs={12} md={6} lg={4} key={pro.id} className="mb-4">
                            <ProfessionalCard pro={pro} />
                        </Col>
                    ))}
                    
                    {searchResults.length === 0 && (
                        <Col>
                            <Alert variant="info" className="text-dark">Nenhum profissional encontrado com o termo de busca.</Alert>
                        </Col>
                    )}
                </Row>

            </Container>
        </>
    );
};

export default MainFeed;