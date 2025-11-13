from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter 

# Importações Absolutas
from accounts.models import User 
from accounts.views import CadastroView 

# Importa Serializers (incluindo o CustomAuthTokenSerializer)
from .serializers import ProfessionalSerializer, FullProfileSerializer, CustomAuthTokenSerializer 


# --- 1. ViewSet para a listagem pública de profissionais (COM BUSCA) ---
class ProfessionalViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista apenas usuários que são profissionais (is_professional=True) e permite busca.
    Endpoint: /api/v1/accounts/profissionais/
    """
    
    queryset = User.objects.filter(is_professional=True, profile__isnull=False).select_related('profile')
    
    serializer_class = ProfessionalSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 
    
    filter_backends = [SearchFilter] 
    
    search_fields = [
        '=email',                       
        'profile__full_name',           
        'profile__palavras_chave',      
        'profile__cidade', 
    ]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FullProfileSerializer
        return ProfessionalSerializer


# --- 2. ViewSet para o Perfil do Usuário Logado ---
class ProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Permite ao usuário autenticado (Cliente ou Profissional) visualizar e editar
    seu próprio perfil (modelo User + Profile).
    """
    serializer_class = FullProfileSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Sempre opera no perfil do usuário logado
        return User.objects.filter(pk=self.request.user.pk)

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        self.kwargs['pk'] = self.request.user.pk
        
        if request.method == 'GET':
            return self.retrieve(request)
        
        return self.update(request)


# --- 3. View Customizada para Login (CORRETO) ---
class CustomAuthToken(ObtainAuthToken):
    """
    View para o login que usa o CustomAuthTokenSerializer.
    Endpoint: /api/v1/auth/login/
    """
    serializer_class = CustomAuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES