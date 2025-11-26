import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, FormControl, InputGroup, Badge, Carousel } from 'react-bootstrap';
import { Search, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// ====================================================================
// MOCK DE DADOS
// ====================================================================

// MOCK para as Categorias no topo
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

// MOCK para as imagens do Carrossel de Destaque (BANNERS)
const MOCKED_BANNERS = [
    { 
        id: 1, 
        src: 'https://via.placeholder.com/1200x300/f8d7da/000000?text=Banner+1:+Aproveite+os+Servi%C3%A7os', 
        alt: 'Banner 1: Aproveite os Serviços', 
        caption: 'Os melhores profissionais com preços incríveis!',
        link: '/promocoes' 
    },
    { 
        id: 2, 
        src: 'https://via.placeholder.com/1200x300/d1ecf1/000000?text=Banner+2:+Cadastre+seu+Portf%C3%B3lio', 
        alt: 'Banner 2: Cadastre seu Portfólio', 
        caption: 'Seja um profissional VagAli. Cadastre-se agora!',
        link: '/register'
    },
    { 
        id: 3, 
        src: 'https://via.placeholder.com/1200x300/ffc107/000000?text=Banner+3:+Servi%C3%A7os+de+Constru%C3%A7%C3%A3o', 
        alt: 'Banner 3: Serviços de Construção', 
        caption: 'Reformas e Construções com qualidade garantida.',
        link: '/search?category=construcao'
    },
];

// MOCK para os Profissionais em Destaque (Cards na parte inferior)
const MOCKED_PROFESSIONALS = [
    { id: 1, name: 'Wanderson Santos', service: 'Eletricista', rating: 4.5 },
    { id: 2, name: 'Novo Nome de Cadastro de Teste', service: 'Pedreiro', rating: 5.0 },
    { id: 3, name: 'Wanderson perfil 6', service: 'Designer', rating: 4.2 },
    // Adicionar mais para preencher o layout (como no seu print 3e7096.png)
    { id: 4, name: 'Juliana Doces', service: 'Confeiteira', rating: 5.0 },
];

// ====================================================================
// COMPONENTE AUXILIAR: Listagem de Categorias (Topo)
// ====================================================================
const CategoryBar = () => {
    const [selected, setSelected] = useState('Todos');
    
    // Simulação do ícone com base no texto (em um projeto real usaria um mapa de ícones)
    const getIcon = (name) => {
        if (name === 'Todos') return '🧺';
        if (name === 'Ferramentas') return '🛠️';
        if (name === 'Construção') return '🏗️';
        if (name === 'Beleza') return '💅';
        return '⭐'; 
    }
    
    return (
        <div className="bg-dark border-bottom border-warning py-2 overflow-auto">
            <Container>
                <div className="d-flex flex-nowrap align-items-center">
                    {/* Botão Todos */}
                    <Button 
                        variant={selected === 'Todos' ? "warning" : "outline-light"}
                        onClick={() => setSelected('Todos')}
                        className="d-flex align-items-center me-2 flex-shrink-0 fw-bold"
                    >
                        <Briefcase size={16} className="me-2" /> Todos
                    </Button>
                    
                    {/* Lista de Categorias */}
                    {MOCKED_CATEGORIES.slice(1).map(cat => (
                        <Button
                            key={cat.name}
                            variant={selected === cat.name ? "warning" : "outline-light"}
                            onClick={() => setSelected(cat.name)}
                            className="d-flex align-items-center me-2 flex-shrink-0"
                        >
                            {getIcon(cat.name)} {cat.name}
                        </Button>
                    ))}
                </div>
                {/* A linha cinza de scroll que aparece no seu print (image_3ca99a.png) 
                    é representada pelo overflow-auto acima. */}
            </Container>
        </div>
    );
};


// ====================================================================
// COMPONENTE PRINCIPAL: MAIN FEED
// ====================================================================
const MainFeed = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState(MOCKED_PROFESSIONALS);
    
    // ----------------------------------------------------------------
    // LÓGICA DE BUSCA (Mockada)
    // ----------------------------------------------------------------
    const handleSearch = (e) => {
        e.preventDefault();
        // Simulação de filtro simples
        if (searchTerm) {
            const filtered = MOCKED_PROFESSIONALS.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.service.toLowerCase().includes(searchTerm.toLowerCase())
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
            <CategoryBar />

            <Container className="my-4">
                
                {/* 2. CAMPO DE BUSCA (Conforme o print image_3ca99a.png) */}
                <Row className="justify-content-center mb-5">
                    <Col md={8}>
                        <Form onSubmit={handleSearch}>
                            <InputGroup className="shadow">
                                <FormControl
                                    type="search"
                                    placeholder="Busque por nome, e-mail ou tipo de serviço..."
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
                
                {/* 3. NOVO: CARROSSEL DE BANNERS DE DESTAQUE */}
                <Row className="mb-5">
                    <Col>
                        <Carousel 
                            interval={5000} // Passa a cada 5 segundos
                            controls={true} // Setas de controle
                            indicators={true} // Pontos indicadores
                            pause="hover" // Pausa o auto-play ao passar o mouse
                            // Classes para escurecer o background do carrossel (opcional)
                            className="bg-dark rounded shadow-lg"
                        >
                            {MOCKED_BANNERS.map((banner) => (
                                <Carousel.Item key={banner.id}>
                                    {/* Envolve o conteúdo em um link, se houver */}
                                    <Link to={banner.link || '#'} style={{ display: 'block' }}>
                                        <img
                                            className="d-block w-100 rounded"
                                            src={banner.src}
                                            alt={banner.alt}
                                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                        <Carousel.Caption className="bg-dark bg-opacity-75 p-2 rounded">
                                            <h3 className="fw-bold text-warning">{banner.alt.split(':')[0]}</h3>
                                            <p className="d-none d-sm-block">{banner.caption}</p>
                                        </Carousel.Caption>
                                    </Link>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    </Col>
                </Row>

                {/* 4. LISTAGEM DE PROFISSIONAIS EM DESTAQUE */}
                <h2 className="mb-4 text-warning">Profissionais em Destaque</h2>
                
                <Row>
                    {searchResults.map(pro => (
                        <Col md={4} key={pro.id} className="mb-4">
                            <Card className="shadow-sm h-100 bg-light text-dark">
                                <Card.Body className="d-flex flex-column justify-content-between">
                                    <div>
                                        <h5 className="fw-bold">{pro.name}</h5>
                                        <p className="small text-muted mb-2">{pro.service}</p>
                                        <Badge bg="success" className="mb-3">{pro.rating} Estrelas</Badge>
                                    </div>
                                    <Link to={`/profissionais/${pro.id}`}>
                                        <Button variant="warning" className="w-100 fw-bold">
                                            Ver Perfil
                                        </Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                    
                    {searchResults.length === 0 && (
                        <Col>
                            <Alert variant="info" className="text-dark">Nenhum profissional encontrado com o termo de busca.</Alert>
                        </Col>
                    )}
                </Row>

            </Container>
            
            {/* O FOOTER GLOBAL SERÁ RENDERIZADO PELO LAYOUT.jsx */}
        </>
    );
};

export default MainFeed;