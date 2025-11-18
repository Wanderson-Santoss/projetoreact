from rest_framework import serializers
from accounts.models import User, Profile 
from django.db import transaction 
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import authenticate 
from rest_framework.authtoken.models import Token 

# --- 1. Serializer do Modelo Profile (Aninhado) ---
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer base para o modelo Profile (aninhado dentro de User).
    """
    
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
        # Removido o campo 'user' daqui para evitar que ele seja exposto ou obrigatório.
        fields = ('full_name', 'cpf', 'phone_number', 'bio', 'address', 'cep', 'servico_principal', 'descricao_servicos', 'cidade', 'estado', 'cnpj', 'palavras_chave')


# --- 2. Serializer Completo para o Perfil (User + Profile) ---
class FullProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para o User, aninhando o Profile para leitura/escrita.
    """
    profile = ProfileSerializer(required=False) 
    
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
    
    # Métodos Get para os campos do Profile - 🚨 CORREÇÃO DE LEITURA (PREVINE ERRO 500 NO GET)
    def get_rating(self, obj):
        # Verifica se o 'profile' existe e não é None
        if hasattr(obj, 'profile') and obj.profile is not None:
            return obj.profile.rating if obj.profile.rating is not None else 0.00
        return 0.00 # Valor padrão
        
    def get_feedback_count(self, obj):
        if hasattr(obj, 'profile') and obj.profile is not None:
             # Usar getattr para lidar com campos que podem não existir no Profile
             return getattr(obj.profile, 'feedback_count', 0)
        return 0 
        
    def get_demands_completed(self, obj):
        # Este campo é um mock, mantido como 0.
        return 0

    @transaction.atomic
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        
        # 1. Atualiza o objeto User (is_professional ou outros campos do User)
        instance = super().update(instance, validated_data)
        
        # 2. Atualiza ou CRIA o Profile - 🚨 CORREÇÃO CRÍTICA DE ESCRITA (PERMITE CRIAR O PROFILE)
        if profile_data is not None:
            
            # Verifica se já existe uma instância de Profile para este User
            if hasattr(instance, 'profile') and instance.profile is not None:
                # 2.1. ATUALIZA o perfil existente
                profile_instance = instance.profile
                serializer = ProfileSerializer(instance=profile_instance, data=profile_data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
            else:
                # 2.2. CRIA um novo perfil (e o associa ao User logado)
                serializer = ProfileSerializer(data=profile_data)
                serializer.is_valid(raise_exception=True)
                
                # Salva o Profile e força o link com o User (ForeignKey).
                serializer.save(user=instance)
        
        return instance
    
# --- 3. Serializer para Listagem Pública de Profissionais ---
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializerr para a listagem pública de profissionais (apenas dados essenciais).
    """
    full_name = serializers.SerializerMethodField()
    servico_principal = serializers.SerializerMethodField()
    cidade = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'servico_principal', 'cidade', 'rating') 
        
    def get_full_name(self, obj):
        return obj.profile.full_name if hasattr(obj, 'profile') and obj.profile is not None else obj.email

    def get_servico_principal(self, obj):
        return obj.profile.servico_principal if hasattr(obj, 'profile') and obj.profile is not None else None

    def get_cidade(self, obj):
        return obj.profile.cidade if hasattr(obj, 'profile') and obj.profile is not None else None

    def get_rating(self, obj):
        return obj.profile.rating if hasattr(obj, 'profile') and obj.profile is not None else 0.00
    
    
# --- 4. Serializer Customizado para Login ---
class CustomAuthTokenSerializer(serializers.Serializer):
    """
    Serializer simplificado e robusto para login por 'email' e 'password'.
    """
    email = serializers.CharField(label=_("Email"))
    password = serializers.CharField(
        label=_("Senha"),
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    token = serializers.CharField(label=_("Token"), read_only=True) 

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                                 email=email, password=password) 

            if not user:
                msg = _('Não foi possível fazer login com as credenciais fornecidas.')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Deve incluir "email" e "password".')
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs