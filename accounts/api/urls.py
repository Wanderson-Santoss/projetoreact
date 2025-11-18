# accounts/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Importa as Views necessárias
from .views import ProfileViewSet, ProfessionalViewSet
# Importa a view de cadastro de outro arquivo (accounts.views)
from accounts.views import CadastroView 

# Cria um roteador para registrar os ViewSets
router = DefaultRouter()

router.register(r'perfil', ProfileViewSet, basename='perfil') 
router.register(r'profissionais', ProfessionalViewSet, basename='profissionais') # 🚨 Rota corrigida!

urlpatterns = [
    # ROTA DE CADASTRO CORRIGIDA: Usa CadastroView (resolve o 404)
    # A URL completa é: /api/v1/accounts/register/
    path('register/', CadastroView.as_view(), name='register'),
    
    # Rotas que usam o DefaultRouter (perfil, profissionais)
    path('', include(router.urls)), 
]