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
        user, // 🔑 AGORA USAMOS O OBJETO 'user'
        logout // Função de logout centralizada
    } = useAuth();

    // Determina se o usuário é profissional (Seguro com Optional Chaining)
    const isProfessional = user?.is_professional; 

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm border-bottom border-warning">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 text-warning">VagALI</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto d-flex align-items-center">
                        {/* LINK FIXO: INÍCIO */}
                        <Nav.Link as={Link} to="/" className="me-3">Início</Nav.Link>
                        
                        {/* 2. Lógica Condicional: Exibe links diferentes se autenticado */}
                        {isAuthenticated ? (
                            // --- USUÁRIO LOGADO ---
                            <>
                                {/* LINK FIXO: MINHA CONTA */}
                                <Nav.Link as={Link} to="/meu-perfil" className="me-3 d-flex align-items-center">
                                    <User size={18} className="me-1" /> Minha Conta
                                </Nav.Link>

                                {/* 🔑 LINK CONDICIONAL: MEU PORTFÓLIO (SÓ PARA PROFISSIONAIS) */}
                                {isProfessional && (
                                    <Nav.Link as={Link} to="/meu-portfolio" className="me-3 d-flex align-items-center">
                                        <Briefcase size={18} className="me-1" /> Meu Portfólio
                                    </Nav.Link>
                                )}

                                {/* BOTÃO SAIR */}
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="d-flex align-items-center fw-bold"
                                    onClick={logout} // Chama a função centralizada do AuthContext
                                >
                                    <LogOut size={16} className="me-1" /> Sair
                                </Button>
                            </>
                        ) : (
                            // --- USUÁRIO NÃO LOGADO: Login e Cadastro ---
                            <>
                                {/* Login */}
                                <Nav.Link as={Link} to="/login" className="d-flex align-items-center me-2 text-warning">
                                    <LogIn size={18} className="me-1" /> Login
                                </Nav.Link>
                                
                                {/* Cadastro */}
                                <Button as={Link} to="/register" variant="warning" className="d-flex align-items-center fw-bold">
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