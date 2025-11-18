from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token 
from rest_framework.settings import api_settings
from rest_framework.filters import SearchFilter 
from rest_framework import generics # Garante que você tem generics importado

# Importações Absolutas
from accounts.models import User 
from accounts.views import CadastroView 

# Importa Serializers
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


# ----------------------------------------------------------------------
# --- 2. ViewSet para o Perfil do Usuário Logado (CORREÇÃO CRÍTICA) ---
# ----------------------------------------------------------------------
class ProfileViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    Permite ao usuário autenticado (Cliente ou Profissional) visualizar e editar
    seu próprio perfil (modelo User + Profile).
    """
    serializer_class = FullProfileSerializer 
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.pk)

    def get_object(self):
        return self.request.user

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        # Obtém o usuário logado através do token
        instance = self.get_object() 
        try:
             instance.profile.full_name # Tenta acessar para verificar se existe
             # print("Profile existe.")
        except:
             # print("Profile não existe ou erro ao acessar.")
             pass
        
        if request.method == 'GET':
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        
        # Para PUT/PATCH (Update)
        
        # 1.TRATAMENTO DO CAMPO is_professional (CAUSA DO ERRO 500)
        # Extraímos 'is_professional' dos dados da requisição.
        data = request.data.copy()
        is_professional_status = data.pop('is_professional', None)

        if is_professional_status is not None:
            # 1.1. Atualiza diretamente o campo no modelo User e salva.
            new_status = bool(is_professional_status)
            instance.is_professional = new_status
            instance.save(update_fields=['is_professional'])

            # 1.2. Se a requisição era *apenas* para alterar o status, retornamos.
            # Isso evita que o serializer tente processar um payload vazio e falhe.
            if not data:
                serializer = self.get_serializer(instance)
                return Response(serializer.data)
        
        # 2. Se ainda houver dados restantes (ex: dados do 'profile', 'full_name', etc.),
        # usamos o serializer para lidar com o resto do payload.
        if data:
            serializer = self.get_serializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        
        # 3. Se nenhuma atualização de perfil (payload de 'profile') foi enviada, 
        # mas a função já foi atualizada, retornamos o estado atual.
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# --- 3. View Customizada para Login (CORRETO) ---
class CustomAuthToken(ObtainAuthToken):
    """
    View para o login que usa 'email' no lugar de 'username' e retorna
    o ID do usuário e o status de profissional junto com o token.
    """
    serializer_class = CustomAuthTokenSerializer 

    def post(self, request, *args, **kwargs):
        # 1. Validação
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # 2. Token
        token, created = Token.objects.get_or_create(user=user)

        # 3. Retorna os dados
        return Response({
            'token': token.key,
            'user_id': user.pk, 
            'is_professional': user.is_professional, 
            'email': user.email,
        })