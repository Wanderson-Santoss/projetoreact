// src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        // Mantemos o estilo escuro com o toque de cor primária (warning)
        <footer className="bg-dark text-white pt-4 pb-3 border-top border-warning mt-auto">
            <Container>
                <Row>
                    <Col md={4} className="mb-3">
                        <h5 className="text-warning">VAGALI</h5>
                        <p className="small text-white-50">
                            Conectando você aos melhores serviços autônomos locais.
                        </p>
                    </Col>
                    <Col md={4} className="mb-3">
                        <h5 className="text-warning">Links Úteis</h5>
                        <ul className="list-unstyled small">
                            {/* Você precisará ter essas rotas definidas no App.jsx ou no seu Header */}
                            <li><Link to="/sobre" className="text-white-50">Sobre o Vagali</Link></li>
                            <li><Link to="/feed" className="text-white-50">Categorias</Link></li>
                            <li><Link to="/register" className="text-white-50">Cadastro</Link></li>
                            <li><Link to="/fale-conosco" className="text-white-50">Fale Conosco</Link></li>
                        </ul>
                    </Col>
                    <Col md={4} className="mb-3">
                        <h5 className="text-warning">Redes Sociais</h5>
                        {/* Se você usa o Bootstrap Icons, essas classes funcionarão */}
                        <ul className="list-unstyled d-flex">
                            <li><a href="#" className="text-white-50 me-3"><i className="bi bi-facebook"></i></a></li>
                            <li><a href="#" className="text-white-50 me-3"><i className="bi bi-instagram"></i></a></li>
                            <li><a href="#" className="text-white-50 me-3"><i className="bi bi-linkedin"></i></a></li>
                            <li><a href="#" className="text-white-50"><i className="bi bi-twitter"></i></a></li>
                        </ul>
                    </Col>
                </Row>
                <Row className="mt-3">
                    <Col className="text-center small text-white-50">
                        &copy; {new Date().getFullYear()} VAGALI. Todos os direitos reservados.
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;