import React, { useState, useEffect } from 'react';
// IMPORTAÇÃO CORRIGIDA: Adicionado 'Alert' aqui!
import { Container, Row, Col, Card, Button, Badge, ListGroup, Carousel, Alert } from 'react-bootstrap'; 
import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, Phone, MessageSquare, Briefcase, CheckCircle, Aperture, Share2, AlertTriangle, ChevronRight } from 'lucide-react';

// ====================================================================\
// MOCK DE DADOS
// ====================================================================\

// Simulação de um banco de dados com vários perfis
const MOCKED_PROFILES_DB = {
    'wanderson': {
        id: 'wanderson',
        full_name: 'Wanderson Santos',
        service: 'Eletricista Residencial e Predial',
        description: 'Especialista em instalações e manutenções elétricas completas. Certificado em NR-10 e focado em segurança e eficiência. Atendo toda a região metropolitana de São Paulo com agilidade e preço justo. Meu objetivo é sempre superar as expectativas do cliente.',
        city: 'São Paulo',
        state: 'SP',
        rating: 4.8,
        total_reviews: 95,
        satisfaction_rate: 96, // Em porcentagem
        total_demands: 42,
        is_verified: true, // Novo campo para o selo de verificação
        avatar_url: 'https://picsum.photos/100/100?random=4',
        cover_image_url: 'https://picsum.photos/1200/400?random=10',
        contact_phone: '(11) 98765-4321',
        contact_email: 'wanderson@exemplo.com',
        services_list: ['Instalação de tomadas', 'Montagem de painéis', 'Manutenção predial', 'Certificação NR-10'],
        portfolio_images: [
            { id: 1, src: 'https://picsum.photos/800/600?random=11', caption: 'Instalação de painel elétrico em residência' },
            { id: 2, src: 'https://picsum.photos/800/600?random=12', caption: 'Manutenção de rede em prédio comercial' },
            { id: 3, src: 'https://picsum.photos/800/600?random=13', caption: 'Troca de fiação antiga em apartamento' },
        ],
        reviews: [
            { id: 1, name: 'João S.', rating: 5, comment: 'Serviço rápido e de altíssima qualidade. Recomendo demais!', date: '01/05/2024' },
            { id: 2, name: 'Maria F.', rating: 4, comment: 'Pontual e atencioso. Aprovado!', date: '15/04/2024' },
            { id: 3, name: 'Carlos R.', rating: 5, comment: 'Resolveu um problema complexo que outros não conseguiram. Excelente profissional!', date: '10/03/2024' },
        ]
    },
    'novo-teste': {
        id: 'novo-teste',
        full_name: 'Novo Nome de Cadastro de Teste',
        service: 'Pedreiro',
        description: 'Mestre de obras com foco em alvenaria e acabamentos finos. Trabalho com reformas, construções do zero e projetos de paisagismo.',
        city: 'Rio de Janeiro',
        state: 'RJ',
        rating: 5.0,
        total_reviews: 5,
        satisfaction_rate: 100, 
        total_demands: 5,
        is_verified: true, 
        avatar_url: 'https://picsum.photos/100/100?random=5',
        cover_image_url: 'https://picsum.photos/1200/400?random=15',
        contact_phone: '(21) 99887-7665',
        contact_email: 'novo-teste@exemplo.com',
        services_list: ['Alvenaria', 'Reboco', 'Instalação de pisos e revestimentos', 'Pintura'],
        portfolio_images: [
            { id: 1, src: 'https://picsum.photos/800/600?random=16', caption: 'Nova fachada de casa reformada' },
        ],
        reviews: [
            { id: 1, name: 'Lucas G.', rating: 5, comment: 'Excelente! Minha obra foi concluída no prazo e com muita qualidade.', date: '10/06/2024' },
        ]
    },
};

// ====================================================================\
// COMPONENTE: PROFESSIONAL PUBLIC PROFILE
// ====================================================================\

const ProfessionalPublicProfile = () => {
    // 1. OBTENÇÃO CORRIGIDA: Usa 'professionalId' para corresponder à rota em App.js
    const { professionalId } = useParams(); 
    
    // 2. Simula o estado e o carregamento dos dados
    const [professional, setProfessional] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // 3. Simula a busca de dados no backend
    useEffect(() => {
        setIsLoading(true);
        
        // CORREÇÃO: Usa 'professionalId' para buscar os dados no Mock
        const data = MOCKED_PROFILES_DB[professionalId]; 

        setTimeout(() => { // Simula um delay de rede
            setProfessional(data);
            setIsLoading(false);
        }, 500);
    }, [professionalId]); // Depende do professionalId
    
    // Se estiver carregando
    if (isLoading) {
        return <Container className="text-center py-5"><div className="spinner-border text-warning" role="status"><span className="visually-hidden">Carregando...</span></div></Container>;
    }

    // Se o perfil não for encontrado
    if (!professional) {
        // CORREÇÃO: O componente Alert agora está definido e pode ser usado.
        return <Container className="py-5"><Alert variant="danger">Perfil profissional **{professionalId}** não encontrado.</Alert></Container>;
    }
    
    // Componente auxiliar para renderizar estrelas
    const renderRatingStars = (rating) => {
        const fullStars = Math.floor(rating);
        return (
            <div className="d-flex align-items-center">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={18} 
                        fill={i < fullStars ? 'gold' : 'gray'} 
                        stroke={i < fullStars ? 'gold' : 'gray'} 
                        className="me-1" 
                    />
                ))}
            </div>
        );
    };

    // ----------------------------------------------------------------
    // RENDERIZAÇÃO PRINCIPAL
    // ----------------------------------------------------------------

    return (
        <Container className="my-5">
            <Row>
                
                {/* COLUNA ESQUERDA (Principal: Info, Bio, Portfólio) */}
                <Col lg={8}>
                    
                    {/* CABEÇALHO DO PERFIL (Foto de Capa e Avatar) */}
                    <Card className="mb-4 shadow-lg border-0">
                        {/* Foto de Capa */}
                        <div style={{ 
                            height: '250px', 
                            backgroundImage: `url(${professional.cover_image_url})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center',
                            borderTopLeftRadius: '0.3rem',
                            borderTopRightRadius: '0.3rem',
                        }}>
                        </div>
                        
                        <Card.Body className="p-4 pt-0">
                            {/* Avatar */}
                            <img
                                src={professional.avatar_url}
                                alt={professional.full_name}
                                className="rounded-circle border border-5 border-white shadow"
                                style={{ width: '120px', height: '120px', marginTop: '-60px', objectFit: 'cover' }}
                            />
                            
                            {/* Nome e Serviço */}
                            <div className="mt-3">
                                <h1 className="fw-bold text-dark mb-1">
                                    {professional.full_name} 
                                    {professional.is_verified && <CheckCircle size={24} className="ms-2 text-success" title="Verificado" />}
                                </h1>
                                <h4 className="text-warning fw-bold mb-2">{professional.service}</h4>
                                
                                {/* Localização e Avaliação */}
                                <div className="d-flex align-items-center mb-3">
                                    <MapPin size={18} className="me-2 text-muted" />
                                    <span className="text-muted me-3">{professional.city}, {professional.state}</span>
                                    
                                    {renderRatingStars(professional.rating)}
                                    <span className="ms-2 text-dark fw-bold">{professional.rating.toFixed(1)}/5</span>
                                    <span className="ms-2 text-muted">({professional.total_reviews} avaliações)</span>
                                </div>
                            </div>
                            
                            {/* Estatísticas (Similar ao seu print) */}
                            <Row className="text-center mt-4">
                                <Col>
                                    <Card className="border-0 bg-light p-2 shadow-sm">
                                        <h3 className="text-success fw-bold mb-0">{professional.satisfaction_rate}%</h3>
                                        <p className="small text-muted mb-0">Satisfação</p>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="border-0 bg-light p-2 shadow-sm">
                                        <h3 className="text-warning fw-bold mb-0">{professional.total_demands}</h3>
                                        <p className="small text-muted mb-0">Demandas</p>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card className="border-0 bg-light p-2 shadow-sm">
                                        <h3 className="text-info fw-bold mb-0">{professional.total_reviews}</h3>
                                        <p className="small text-muted mb-0">Avaliações</p>
                                    </Card>
                                </Col>
                            </Row>

                        </Card.Body>
                    </Card>

                    {/* SEÇÃO 1: SOBRE O PROFISSIONAL E SERVIÇOS */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-warning text-dark fw-bold">Sobre o Profissional</Card.Header>
                        <Card.Body>
                            <p className="lead">{professional.description}</p>
                            <h5 className="fw-bold mt-4">Serviços que Ofereço:</h5>
                            <ul className="list-unstyled row">
                                {professional.services_list.map((service, index) => (
                                    <Col md={6} key={index} className="d-flex align-items-center mt-2">
                                        <Briefcase size={18} className="me-2 text-warning" />
                                        <span className="text-dark">{service}</span>
                                    </Col>
                                ))}
                            </ul>
                        </Card.Body>
                    </Card>

                    {/* SEÇÃO 2: PORTFÓLIO (CARROSSEL) */}
                    {professional.portfolio_images.length > 0 && (
                        <Card className="mb-4 shadow-sm">
                            <Card.Header className="bg-warning text-dark fw-bold">Portfólio</Card.Header>
                            <Card.Body className="p-0">
                                <Carousel indicators={false} controls={true} interval={null} className="bg-dark rounded-bottom">
                                    {professional.portfolio_images.map((item) => (
                                        <Carousel.Item key={item.id}>
                                            <img
                                                className="d-block w-100"
                                                src={item.src}
                                                alt={item.caption}
                                                style={{ maxHeight: '450px', objectFit: 'contain' }}
                                            />
                                            <Carousel.Caption className="bg-dark bg-opacity-75 p-2 rounded">
                                                <p className="mb-0 small">{item.caption}</p>
                                            </Carousel.Caption>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </Card.Body>
                        </Card>
                    )}
                    
                    {/* SEÇÃO 3: AVALIAÇÕES */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Header className="bg-warning text-dark fw-bold">
                            Avaliações de Clientes ({professional.total_reviews})
                        </Card.Header>
                        <ListGroup variant="flush">
                            {professional.reviews.map((review) => (
                                <ListGroup.Item key={review.id} className="bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <Star size={18} fill="gold" stroke="gold" className="me-2" />
                                            <strong className="text-dark">{review.name}</strong>
                                        </div>
                                        <small className="text-muted">{review.date}</small>
                                    </div>
                                    <p className="mt-2 mb-1 small text-dark">{review.comment}</p>
                                </ListGroup.Item>
                            ))}
                            <ListGroup.Item className="text-center">
                                <Button variant="link" className="text-warning fw-bold">Ver todas as {professional.total_reviews} avaliações</Button>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>

                </Col>
                
                {/* COLUNA DIREITA (Ações do Cliente) */}
                <Col lg={4}>
                    
                    {/* CARD DE CONTATO E AÇÃO PRINCIPAL */}
                    <Card className="shadow-lg mb-4 position-sticky" style={{ top: '20px' }}>
                        <Card.Header className="bg-warning text-dark fw-bold">Interaja com o Profissional</Card.Header>
                        <Card.Body className="d-grid gap-2">
                            
                            {/* Botão de Mensagem/Orçamento (Destaque) */}
                            <Button 
                                variant="success" 
                                size="lg" 
                                className="w-100 fw-bold d-flex justify-content-center align-items-center shadow"
                                // Ação mockada
                                onClick={() => alert(`Enviando mensagem para ${professional.full_name}`)}
                            >
                                <MessageSquare size={24} className="me-2" /> Solicitar Orçamento
                            </Button>
                            
                            {/* Botão de Contato (Secundário) */}
                            <Button 
                                variant="outline-primary" 
                                className="w-100 fw-bold d-flex justify-content-center align-items-center"
                                // Ação mockada: em um projeto real, abriria um modal/link
                                onClick={() => alert(`Telefone: ${professional.contact_phone}`)}
                            >
                                <Phone size={20} className="me-2" /> Entrar em Contato
                            </Button>
                            
                            <hr />
                            
                            {/* Botões de Ação Social/Segurança */}
                            <Button 
                                variant="outline-secondary" 
                                className="w-100 d-flex justify-content-center align-items-center"
                                onClick={() => alert('Link copiado para compartilhamento!')}
                            >
                                <Share2 size={18} className="me-2" /> Compartilhar Perfil
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                className="w-100 d-flex justify-content-center align-items-center mt-2"
                                onClick={() => alert('Abrindo formulário de denúncia...')}
                            >
                                <AlertTriangle size={18} className="me-2" /> Denunciar Conta
                            </Button>
                        </Card.Body>
                    </Card>
                    
                </Col>
            </Row>

        </Container>
    );
};

export default ProfessionalPublicProfile;