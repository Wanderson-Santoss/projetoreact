from rest_framework import serializers
from accounts.models import User, Profile # Presume-se que Profile é importado de models
from django.db import transaction 
from rest_framework.authtoken.serializers import AuthTokenSerializer as DRFAuthTokenSerializer

# --- 1. Serializer do Modelo Profile ---
class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Profile, permitindo que a maioria dos campos seja opcional
    para usuários que não são profissionais ou durante o PATCH parcial.
    """
    
    # CORREÇÃO CRÍTICA AQUI: Usar phone_number e address (nomes exatos do models.py)
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=255) 
    cpf = serializers.CharField(required=False, allow_blank=True, max_length=11)
    phone_number = serializers.CharField(required=False, allow_blank=True, max_length=15) # CORRIGIDO: Era 'telefone'
    bio = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255) # CORRIGIDO: Era 'cidade'
    cnpj = serializers.CharField(required=False, allow_blank=True, max_length=14)
    # Adicione aqui todos os outros campos do seu Profile que devem ser opcionais (Ex: cep, palavras_chave)
    
    class Meta:
        model = Profile
        # Removendo 'cep' e 'palavras_chave' do exclude para permitir edição
        exclude = ('user', 'rating') 
        read_only_fields = ('rating',) 

# --- 2. Serializer Mestre: Perfil Completo (User + Profile) ---
class FullProfileSerializer(serializers.ModelSerializer):
    # ... (Mantenha o resto deste bloco inalterado) ...
    
    profile = ProfileSerializer(required=False) 
    is_professional = serializers.BooleanField(required=False, allow_null=True) 
    email = serializers.EmailField(read_only=True) 
    
    class Meta:
        model = User
        fields = (
            'id', 
            'email', 
            'is_professional', 
            'profile'
        )
        read_only_fields = ('id', 'email')

    @transaction.atomic 
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None) 
        is_professional = validated_data.pop('is_professional', None) 
        
        old_is_professional = instance.is_professional 
        
        if is_professional is not None:
            instance.is_professional = is_professional
        
        instance = super().update(instance, validated_data)
        instance.save() 
        
        if profile_data is not None or (is_professional is not None and is_professional != old_is_professional):
            
            if not hasattr(instance, 'profile') or instance.profile is None:
                profile_instance = Profile.objects.create(user=instance)
            else:
                profile_instance = instance.profile

            profile_serializer = self.fields['profile']
            
            # ATENÇÃO AQUI: Lógica de REVERSÃO corrigida para usar 'address'
            if old_is_professional is True and instance.is_professional is False:
                profile_instance.bio = ""
                profile_instance.address = "" # CORRIGIDO: Era 'cidade'
                profile_instance.cnpj = ""
                # Adicione aqui qualquer outro campo de profissional que deve ser limpo
                profile_instance.save() 

            if profile_data is not None:
                profile_serializer.update(profile_instance, profile_data)
        
        return instance
    
# --- 3. Serializer para Listagem Pública de Profissionais (CORRIGIDO) ---
class ProfessionalSerializer(serializers.ModelSerializer):
    """
    Serializer para a listagem pública de profissionais (apenas dados essenciais).
    Implementa checagens robustas (`if obj.profile:`) para evitar erro 500 na listagem.
    """
    full_name = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'bio', 'rating')
        
    def get_full_name(self, obj):
        if obj.profile and obj.profile.full_name:
            return obj.profile.full_name
        return obj.email

    def get_bio(self, obj):
        if obj.profile:
            return obj.profile.bio
        return None

    def get_rating(self, obj):
        if obj.profile:
            return obj.profile.rating
        return 0.00
    
class CustomAuthTokenSerializer(DRFAuthTokenSerializer):
    """ Configura o Serializer de Login para usar 'email' em vez de 'username'. """
    username_field = 'email'