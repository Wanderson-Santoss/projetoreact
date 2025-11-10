import React from 'react';
import { Card, Button } from 'react-bootstrap';
// CORREÇÃO: Substituindo 'react-bootstrap-icons' por 'lucide-react'
import { Star } from 'lucide-react'; 
import { Link } from 'react-router-dom';

const ProfileCard = ({ professional }) => {
    // 1. Desestruturando os dados (com defaults)
    const fullName = professional.full_name || professional.email;
    const bioSnippet = professional.bio 
        ? professional.bio.substring(0, 70) + (professional.bio.length > 70 ? '...' : '') 
        : "Sem descrição.";
    // Garante que a nota seja exibida com 2 casas decimais, tratando o caso undefined/null
    const rating = parseFloat(professional.rating || 0.0).toFixed(2); 

    // 2. Lógica para as Iniciais
    const initials = fullName 
        ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
        : 'VA';

    return (
        <Card className="profile-card bg-vagali-dark-card h-100 shadow-lg border-0">
            <Card.Body className="d-flex flex-column">
                
                {/* Cabeçalho do Card: Ícone/Avatar e Nome */}
                <div className="d-flex align-items-start mb-3">
                    {/* Placeholder de Avatar (Iniciais) */}
                    <div 
                        className="avatar-initials me-3 d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                        style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%', 
                            backgroundColor: '#993213', // Cor primária do Vagali
                            fontSize: '20px'
                        }}
                    >
                        {initials}
                    </div>
                    
                    {/* Container de Título/Subtítulo com a contenção */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <Card.Title 
                            className="mb-0 fs-5 text-white text-truncate" 
                            title={fullName}
                        >
                            {fullName}
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted small text-truncate">
                            {professional.is_professional ? 'Prestador de Serviço' : 'Usuário Comum'}
                        </Card.Subtitle>
                    </div>
                </div>

                {/* Descrição e Snippet */}
                <Card.Text className="text-light-gray small flex-grow-1">
                    {bioSnippet}
                </Card.Text>

                {/* Avaliação e Link Detalhe (Sempre no final do card) */}
                <div className="mt-auto d-flex justify-content-between align-items-center pt-3 border-top border-secondary">
                    {/* Avaliação */}
                    <div className="d-flex align-items-center">
                        {/* Ícone Star Corrigido */}
                        <Star size={14} color="#f59e0b" fill="#f59e0b" className="me-1" />
                        <span className="fw-bold me-1 text-white">{rating}</span>
                        <span className="text-muted small">/ 5</span>
                    </div>

                    {/* Botão/Link para o Perfil Público */}
                    <Button 
                        as={Link} 
                        to={`/profile/${professional.id}`} 
                        variant="primary" 
                        size="sm"
                        className="fw-bold"
                        // Cor de destaque (laranja)
                        style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }} 
                    >
                        Ver Perfil
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};
export default ProfileCard;