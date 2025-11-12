import React from 'react';
import Header from './Header'; 
import Footer from './Footer'; 

// ✅ NOVO: Importa o hook customizado para ler o contexto
import { useAuth } from './AuthContext'; 

const Layout = ({ children }) => {
    // 🎯 LÊ O ESTADO GLOBAL QUE DEFINE O PAPEL
    const { isUserProfessional, isLoggedIn } = useAuth(); 

    // O Header será renderizado mesmo se não estiver logado (para mostrar Login/Registro)
    // Mas passamos a prop isUserProfessional, que é o que controla o botão "Meu Portfólio".
    return (
        // Garante que o container principal tenha altura mínima e use o fundo do body
        <div className="d-flex flex-column min-vh-100">
            {/* CORREÇÃO: PASSA A PROPRIEDADE AUTOMÁTICA PARA O HEADER */}
            <Header 
                isUserProfessional={isUserProfessional} 
                isUserLoggedIn={isLoggedIn} // Opcional, mas útil para o Header
            />
            <main className="flex-grow-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;