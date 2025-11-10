import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom"; 

// 🎯 Estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css"; // Seu estilo customizado

// ⚙️ IMPORTAÇÕES DE COMPONENTES
import Layout from "./components/Layout";
import Login from "./components/Login";
import Register from "./components/Register";
// Componentes Antigos Removidos: ProfileUser, EditProfile
import MainFeed from './components/MainFeed';
import ChangePassword from './components/ChangePassword';
import ForgotPassword from './components/ForgotPassword';
import PasswordResetConfirm from './components/PasswordResetConfirm';
import ProfessionalSearch from './components/ProfessionalSearch';
import ProfessionalProfileView from './components/ProfessionalProfileView';
import ProfessionalSchedule from './components/ProfessionalSchedule'; 
// NOVOS COMPONENTES PRINCIPAIS
import ProfileManagement from './components/ProfileManagement'; // Tela consolidada de Perfil/Demandas
import CreateDemand from './components/CreateDemand';           // Tela de criação de nova demanda


import { setAuthToken } from './config/axiosConfig'; // 🚨 NOVO IMPORT


function App() {
  return (
    <BrowserRouter> 
      <Layout>
        <Routes>
          
          {/* ROTA RAIZ: Busca de profissionais */}
          <Route path="/" element={<ProfessionalSearch />} />

          {/* ROTA DEDICADA AO PERFIL DO PROFISSIONAL */}
          <Route path="/professional/:id" element={<ProfessionalProfileView />} />
          
          {/* ROTAS DE AUTENTICAÇÃO E CONTA */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* ROTAS DE RECUPERAÇÃO DE SENHA */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />


          {/* ----------------------------------------------------------------- */}
          {/* 🔑 NOVAS ROTAS CONSOLIDADAS DO PAINEL DO USUÁRIO LOGADO */}
          {/* ----------------------------------------------------------------- */}
          
          {/* ROTA PRINCIPAL DO PAINEL (Gerenciamento de Perfil e Demandas) */}
          <Route path="/meu-perfil" element={<ProfileManagement />} />
          
          {/* ROTA DE CRIAÇÃO DE DEMANDA (Chamada de dentro do ProfileManagement) */}
          <Route path="/criar-demanda" element={<CreateDemand />} />
          <Route path="/editar-demanda/:id" element={<CreateDemand isEditing={true} />} />
          {/* ROTA DE ALTERAÇÃO DE SENHA (Mantida separada por ser uma ação de segurança) */}
          <Route path="/change-password" element={<ChangePassword />} />


          {/* OUTRAS ROTAS */}
          <Route path="/professional/:id/schedule" element={<ProfessionalSchedule />} />
          <Route path="/feed" element={<MainFeed />} />

          
          {/* Rota 404/Not Found */}
          <Route path="*" element={<h1 style={{textAlign: 'center', marginTop: '100px', color: 'white'}}>404 - Página Não Encontrada</h1>} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;