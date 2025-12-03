import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// Importação do Contexto de Autenticação
import { useAuth } from './AuthContext'; 
// Ícones Lucide
import { LogOut, User, Briefcase, LogIn, UserPlus } from 'lucide-react';

// 🔑 ÚLTIMA TENTATIVA DE IMPORTAÇÃO: Usando caminho relativo correto e nome exato
import LogoImage from '/LOGOBRANCO.png'; 

const Header = () => {
    // 1. Consome o estado e as funções do AuthContext
    const { 
        isAuthenticated, 
        user, 
        logout 
    } = useAuth();

    // Determina se o usuário é profissional (Seguro com Optional Chaining)
    const isProfessional = user?.is_professional; 

    return (
        <Navbar expand="lg" className="shadow-sm border-bottom border-primary footer-custom-dark" variant="dark">
            <Container>
                
                <Navbar.Brand 
                    as={Link} 
                    to="/" 
                    className="fw-bold fs-4 text-primary d-flex align-items-center" 
                >
                    {/* Imagem do Logo - Usando a variável importada */}
                    <img
                        src="/LOGOBRANCO.png" // 🔑 Usando a variável LogoImage
                        alt="VagAli Logo"
                        className="me-2" 
                        style={{ height: '80px', width: 'auto' }} 
                    />
                    VagAli
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center">
                        
                        {/* 🔑 LINK: INÍCIO (Usa text-header-link) */}
                        <Nav.Link as={Link} to="/" className="me-3 text-header-link">Início</Nav.Link>
                        
                        {isAuthenticated ? (
                            // --- USUÁRIO LOGADO ---
                            <>
                                {/* 🔑 LINK: MINHA CONTA (Usa text-header-link) */}
                                <Nav.Link as={Link} to="/meu-perfil" className="me-3 d-flex align-items-center text-header-link">
                                    <User size={18} className="me-1" /> Minha Conta
                                </Nav.Link>

                                {/* 🔑 LINK: MEU PORTFÓLIO (Usa text-header-link, só para profissionais) */}
                                {isProfessional && (
                                    <Nav.Link as={Link} to="/meu-portfolio" className="me-3 d-flex align-items-center text-header-link">
                                        <Briefcase size={18} className="me-1" /> Meu Portfólio
                                    </Nav.Link>
                                )}

                                {/* BOTÃO SAIR (Outline Danger) */}
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="d-flex align-items-center fw-bold"
                                    onClick={logout}
                                >
                                    <LogOut size={16} className="me-1" /> Sair
                                </Button>
                            </>
                        ) : (
                            // --- USUÁRIO NÃO LOGADO: Login e Cadastro ---
                            <>
                                {/* 🔑 LINK: LOGIN (Usa text-header-link) */}
                                <Nav.Link as={Link} to="/login" className="d-flex align-items-center me-2 text-header-link">
                                    <LogIn size={18} className="me-1" /> Login
                                </Nav.Link>
                                
                                {/* BOTÃO CADASTRO (Primary Blue) */}
                                <Button as={Link} to="/register" variant="primary" className="d-flex align-items-center fw-bold">
                                    <UserPlus size={18} className="me-1" /> Cadastro
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;