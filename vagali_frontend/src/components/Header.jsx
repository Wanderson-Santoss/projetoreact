import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// Importação do Contexto de Autenticação
import { useAuth } from './AuthContext'; 
// Ícones Lucide
import { LogOut, User, Briefcase, LogIn, UserPlus } from 'lucide-react';

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
        <Navbar expand="lg" className="shadow-sm border-bottom border-primary header-custom-dark" variant="dark">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-primary">VagAli</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center">
                        
                        <Nav.Link as={Link} to="/" className="me-3 text-light">Início</Nav.Link>
                        
                        {isAuthenticated ? (
                            // --- USUÁRIO LOGADO ---
                            <>
                                <Nav.Link as={Link} to="/meu-perfil" className="me-3 d-flex align-items-center text-light">
                                    <User size={18} className="me-1" /> Minha Conta
                                </Nav.Link>

                                {/* 🔑 CORREÇÃO AQUI: As chaves extras foram removidas! */}
                                {isProfessional && (
                                    <Nav.Link as={Link} to="/meu-portfolio" className="me-3 d-flex align-items-center text-light">
                                        <Briefcase size={18} className="me-1" /> Meu Portfólio
                                    </Nav.Link>
                                )}

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
                                <Nav.Link as={Link} to="/login" className="d-flex align-items-center me-2 text-light">
                                    <LogIn size={18} className="me-1" /> Login
                                </Nav.Link>
                                
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