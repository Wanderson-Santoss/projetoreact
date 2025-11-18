from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

# IMPORTAÇÕES DA AUTENTICAÇÃO
from accounts.api.views import CustomAuthToken 
from accounts.views import CadastroView 

from app_servicos.api.views import DemandaViewSet 


urlpatterns = [
    # ------------------ ROTAS ADMINISTRATIVAS E TRADICIONAIS (HTML) ------------------
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # ------------------ ROTAS DA API (Django REST Framework) ------------------
    
    # 🚨 PONTO CRÍTICO: LOGIN CUSTOMIZADO (URL RENOMEADA) 🚨
    # Esta rota deve ser a primeira a ser verificada para evitar conflito com o Djoser.
    path('api/v1/auth/custom-login/', CustomAuthToken.as_view(), name='api_login'), 

    # 2. ROTAS DO DJOSER (MANTIDAS apenas as rotas de usuário/troca de senha, etc.)
    # ATENÇÃO: Removemos a inclusão de 'djoser.urls.authtoken' anteriormente.
    path('api/v1/auth/', include('djoser.urls')), 
    
    # 3. ROTA DE CADASTRO
    path('api/v1/accounts/cadastro/', CadastroView.as_view(), name='api_cadastro'), 
    
    # Rota base para os demais endpoints da API de Usuários/Perfis (perfil/me, profissionais/)
    path('api/v1/accounts/', include('accounts.api.urls')), 
    
    # Rotas do app_servicos (Serviços e Demandas)
    path('api/v1/', include('app_servicos.api.urls')),
]