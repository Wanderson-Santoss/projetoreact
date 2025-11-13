from rest_framework import serializers
from accounts.models import User, Profile 
from django.db import transaction 
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer
from django.utils.translation import gettext_lazy as _

# --- 1. Serializer do Modelo Profile (Aninhado) ---
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer base para o modelo Profile (aninhado dentro de User).
    Permite a maioria dos campos como opcionais (required=False).
    """
    
    # Campos que vêm do Profile:
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255) 
    cpf = serializers.CharField(required=False, allow_blank=True, max_length=11)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15)
    bio = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255) 
    cep = serializers.CharField(required=False, allow_blank=True, max_length=9) 
    servico_principal = serializers.CharField(required=False, allow_blank=True, max_length=100)
    descricao_servicos = serializers.CharField(required=False, allow_blank=True) 
    cidade = serializers.CharField(required=False, allow_blank=True, max_length=100) 
    estado = serializers.CharField(required=False, allow_blank=True, max_length=2) 
    cnpj = serializers.CharField(required=False, allow_blank=True, max_length=14)
    palavras_chave = serializers.CharField(required=False, allow_blank=True) 

    class Meta:
        model = Profile
        fields = ('full_name', 'cpf', 'phone_number', 'bio', 'address', 'cep', 'servico_principal', 'descricao_servicos', 'cidade', 'estado', 'cnpj', 'palavras_chave')


# --- 2. Serializer Completo para o Perfil (User + Profile) ---
class FullProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para o User, aninhando o Profile para leitura/escrita.
    Usado em /api/v1/accounts/perfil/me/ e na visualização de detalhe do profissional.
    """
    profile = ProfileSerializer(required=False) 
    
    # Campos de leitura do Profile
    rating = serializers.SerializerMethodField(read_only=True)
    feedback_count = serializers.SerializerMethodField(read_only=True)
    demands_completed = serializers.SerializerMethodField(read_only=True) 

    class Meta:
        model = User
        fields = (
            'id', 'email', 'is_professional', 'date_joined', 
            'profile', 'rating', 'feedback_count', 'demands_completed'
        )
        read_only_fields = ('email', 'date_joined', 'id')
    
    # Métodos Get para os campos do Profile
    def get_rating(self, obj):
        return obj.profile.rating if hasattr(obj, 'profile') else 0.00
        
    def get_feedback_count(self, obj):
        # A lógica correta dependeria do seu modelo de Feedback/Avaliação
        # Assumindo a existência de um campo feedback_count no Profile
        return obj.profile.feedback_count if hasattr(obj, 'profile') and hasattr(obj.profile, 'feedback_count') else 0 
        
    def get_demands_completed(self, obj):
        # Implemente a lógica real se necessário
        return 0

    @transaction.atomic
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # 1. Atualiza o objeto User
        instance = super().update(instance, validated_data)
        
        # 2. Atualiza o Profile
        if hasattr(instance, 'profile'):
            profile_instance = instance.profile

            if profile_data is not None:
                # O ProfileSerializer deve ser instanciado com o instance e o data, para o update
                serializer = ProfileSerializer(instance=profile_instance, data=profile_data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save() 
        
        return instance
    
# --- 3. Serializer para Listagem Pública de Profissionais ---
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer para a listagem pública de profissionais (apenas dados essenciais).
    """
    full_name = serializers.SerializerMethodField()
    servico_principal = serializers.SerializerMethodField()
    cidade = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'servico_principal', 'cidade', 'rating') 
        
    def get_full_name(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') else obj.email

    def get_servico_principal(self, obj):
        return obj.profile.servico_principal if hasattr(obj, 'profile') else None

    def get_cidade(self, obj):
        return obj.profile.cidade if hasattr(obj, 'profile') else None

    def get_rating(self, obj):
        return obj.profile.rating if hasattr(obj, 'profile') else 0.00
    
    
# --- 4. Serializer Customizado para Login (CORREÇÃO CRÍTICA) ---
class CustomAuthTokenSerializer(DRFAuthTokenSerializer):
    """
    Serializer customizado para o login, usando 'email' no lugar de 'username'.
    """
    # 🚨 Adiciona o campo 'email' explicitamente (required=True por padrão no DRF)
    email = serializers.CharField(label=_("Email"))
    
    # 🚨 Remove o campo 'username' herdado da classe pai (DRFAuthTokenSerializer)
    username_field = 'email'
    username = None 
    
    def validate(self, attrs):
        # 🚨 Mapeia o 'email' para 'username' para que a lógica interna de autenticação funcione
        attrs['username'] = attrs.get('email')
        
        # O método .validate da classe pai agora vai usar 'username' (que é o email) e 'password'
        return super().validate(attrs)