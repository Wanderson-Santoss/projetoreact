import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom"; 

// 🎯 Estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css"; // Seu estilo customizado

// ⚙️ IMPORTAÇÕES DE COMPONENTES E CONTEXTO
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
import MainFeed from './components/MainFeed';
import ChangePassword from './components/ChangePassword';
import ForgotPassword from './components/ForgotPassword';
import PasswordResetConfirm from './components/PasswordResetConfirm';


// COMPONENTES PRINCIPAIS
import ProfessionalSearch from './components/ProfessionalSearch';
// 🔑 Importação do componente de EDIÇÃO do Portfólio (Corrigido e Completo)
import ProfessionalProfileView from './components/ProfessionalProfileView'; 
import ProfessionalSchedule from './components/ProfessionalSchedule'; 
import ProfileManagement from './components/ProfileManagement'; 
import CreateDemand from './components/CreateDemand';           
import ChatWrapper from './components/ChatWrapper'; 
// ✅ NOVO: COMPONENTE DE VISUALIZAÇÃO PÚBLICA (Criado no passo anterior)
import ProfessionalPublicProfile from './components/ProfessionalPublicProfile'; // <-- NOVO

// ✅ IMPORTAÇÃO DO CONTEXTO DE AUTENTICAÇÃO (AuthContext.jsx)
import { AuthProvider } from './components/AuthContext';
// ✅ NOVO: COMPONENTE DE LISTA DE CHATS
import ChatList from './components/ChatList'; 

import { setAuthToken } from './config/axiosConfig'; 


function App() {
  return (
    <BrowserRouter> 
        {/* 🔑 PASSO CRUCIAL: O AuthProvider deve envolver o Layout e as Rotas */}
        <AuthProvider> 
            <Layout>
                <Routes>
                    
                    {/* 🎯 AJUSTE 1: A ROTA RAIZ (Padrão/Início) agora aponta para o MainFeed */}
                    <Route path="/" element={<MainFeed />} /> {/* <-- AJUSTADO */}
                    <Route path="/feed" element={<MainFeed />} /> {/* Mantida como alternativa */}

                    {/* Rota que usava o ProfessionalSearch (pode ser removida ou ajustada) */}
                    {/* <Route path="/busca" element={<ProfessionalSearch />} /> */}
                    
                    {/* 🎯 AJUSTE 2: ROTAS DE VISUALIZAÇÃO PÚBLICA (Usando o novo componente) */}
                    {/* Rota mais limpa para visualização pública do perfil: /profissionais/123 */}
                    <Route path="/profissionais/:professionalId" element={<ProfessionalPublicProfile />} /> 
                    
                    {/* Rotas antigas redirecionadas para o novo componente para evitar quebras */}
                    <Route path="/perfil/:id" element={<ProfessionalPublicProfile />} /> 
                    <Route path="/professional/:id" element={<ProfessionalPublicProfile />} /> 
                    <Route path="/professional/:id/schedule" element={<ProfessionalSchedule />} />


                    {/* ROTAS DE AUTENTICAÇÃO E CONTA */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
                    <Route path="/change-password" element={<ChangePassword />} />


                    {/* 🔑 ROTAS CONSOLIDADAS DO PAINEL DO USUÁRIO LOGADO (Edição/Gerenciamento) */}
                    <Route path="/meu-perfil" element={<ProfileManagement />} />

                    {/* 🎯 ROTA DE EDIÇÃO DO PORTFÓLIO DO PROFISSIONAL LOGADO */}
                    <Route path="/meu-portfolio" element={<ProfessionalProfileView />} /> 

                    <Route path="/criar-demanda" element={<CreateDemand />} />
                    <Route path="/editar-demanda/:id" element={<CreateDemand isEditing={true} />} />
                        
                    
                    {/* 💬 ROTAS DE CHAT */}
                    <Route path="/mensagens" element={<ChatWrapper />} /> 
                    <Route path="/mensagens/:id" element={<ChatWrapper />} /> 
                    
                    {/* Rota 404/Not Found */}
                    <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: '100px', color: 'white'}}>404 - Página Não Encontrada</h1>} />

                </Routes>
            
            </Layout>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;