// src/components/Footer.jsx

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        // 🔑 ALTERAÇÃO: Trocamos 'bg-dark text-white' por 'footer-custom-dark'
        <footer className="footer-custom-dark pt-4 pb-3 border-top border-primary mt-auto">
            <Container>
                <Row>
                    <Col md={4} className="mb-3">
                        {/* Títulos em azul primário */}
                        <h5 className="text-primary">VAGALI</h5> 
                        <p className="small text-white-50">
                            Conectando você aos melhores serviços autônomos locais.
                        </p>
                    </Col>
                    <Col md={4} className="mb-3">
                        <h5 className="text-primary">Links Úteis</h5>
                        <ul className="list-unstyled small">
                            <li><Link to="/sobre" className="text-white-50">Sobre o Vagali</Link></li>
                            <li><Link to="/feed" className="text-white-50">Categorias</Link></li>
                            <li><Link to="/register" className="text-white-50">Cadastro</Link></li>
                            <li><Link to="/fale-conosco" className="text-white-50">Fale Conosco</Link></li>
                        </ul>
                    </Col>
                    <Col md={4} className="mb-3">
                        <h5 className="text-primary">Redes Sociais</h5>
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