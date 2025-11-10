from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter 

# Importações Absolutas (A partir do pacote 'accounts')
from accounts.models import User 
from accounts.forms import ClientProfessionalCreationForm 

# Importa Serializers
from .serializers import ProfessionalSerializer, FullProfileSerializer, CustomAuthTokenSerializer 

# Importa a View de Cadastro
from accounts.views import CadastroView 


# --- 1. ViewSet para a listagem pública de profissionais (COM BUSCA) ---
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista apenas usuários que são profissionais (is_professional=True) e permite busca.
    Endpoint: /api/v1/accounts/profissionais/
    """
    
    # GARANTIA 1: Filtra por is_professional=True E profile__isnull=False.
    queryset = User.objects.filter(is_professional=True, profile__isnull=False).select_related('profile')
    
    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    # Ativar o SearchFilter
    filter_backends = [SearchFilter] 
    
    # GARANTIA 2: Usa os nomes CORRETOS dos campos do models.py
    search_fields = [
        '=email',                       
        'profile__full_name',           
        'profile__palavras_chave',      
        'profile__address',             
    ]


# --- 2. ViewSet para o Perfil do Usuário Logado ---
class ProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Permite ao usuário autenticado (Cliente ou Profissional) visualizar e editar
    seu próprio perfil (modelo User + Profile).
    
    Rotas: GET, PUT/PATCH /api/v1/accounts/perfil/me/
    """
    serializer_class = FullProfileSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # A view deve sempre operar no perfil do usuário logado
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        self.kwargs['pk'] = self.request.user.pk
        
        if request.method == 'GET':
            return self.retrieve(request)
        
        return self.update(request)


# --- 3. View Customizada para Login ---
class CustomAuthToken(ObtainAuthToken):
    """
    View customizada para login via token.
    Endpoint: /api/v1/token/login/
    """
    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES