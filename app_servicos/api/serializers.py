# app_servicos/api/serializers.py

from rest_framework import serializers
from app_servicos.models import Service, Demanda, Offer, Feedback
from accounts.models import User # Importamos o modelo User para buscar o nome do perfil


# --- Serializer Básico para Serviço ---
class ServiceSerializer(serializers.ModelSerializer):
    """ Serializer para listar e gerenciar serviços. """
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['id']


# --- Serializer de Demanda ---
class DemandaSerializer(serializers.ModelSerializer):
    """ 
    Serializer de Demanda. 
    Inclui campos read-only para nome do cliente, serviço, ícone e valor da oferta aceita.
    """
    
    service_name = serializers.SlugRelatedField(
        source='service', 
        slug_field='name', 
        read_only=True
    )

    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()
    service_icon = serializers.SerializerMethodField()
    accepted_offer_value = serializers.SerializerMethodField() # Para o valor, se houver oferta aceita

    class Meta:
        model = Demanda
        fields = (
            'id', 
            'service', 
            'service_name',
            'client', 
            'client_name', 
            'professional', 
            'professional_name',
            'titulo', 
            'descricao', # Descrição da demanda
            'status', 
            'cep',
            'created_at',
            'service_icon', 
            'accepted_offer_value',
        )
        read_only_fields = ('client', 'professional', 'status', 'created_at')

    # Método para buscar o nome do cliente
    def get_client_name(self, obj):
        if obj.client and obj.client.profile:
            return obj.client.profile.full_name if obj.client.profile.full_name else obj.client.email
        return None

    # Método para buscar o nome do profissional (se atribuído)
    def get_professional_name(self, obj):
        if obj.professional and obj.professional.profile:
            return obj.professional.profile.full_name if obj.professional.profile.full_name else obj.professional.email
        return None

    # Método para buscar o ícone do serviço (Requer que você adicione 'icon' ao models.py)
    def get_service_icon(self, obj):
        # Tenta buscar o campo 'icon' do Service, ou '🛠️' como fallback
        return getattr(obj.service, 'icon', '🛠️') 
    
    # Método para buscar o valor da Oferta ACEITA
    def get_accepted_offer_value(self, obj):
        # O valor só é relevante se a demanda tiver um profissional atribuído
        if obj.status in ['em_andamento', 'concluida']:
            try:
                # Busca a oferta que foi aceita (só deve existir uma)
                accepted_offer = obj.offers.get(status='aceita')
                # Retorna o valor como float para facilitar o uso no frontend
                return float(accepted_offer.proposta_valor) 
            except Offer.DoesNotExist:
                return None
        return None


# --- Serializer de Oferta ---
class OfferSerializer(serializers.ModelSerializer):
    """ Serializer de Oferta. """
    # ... (restante do código inalterado) ...
    professional_name = serializers.SerializerMethodField()
    demanda_client_name = serializers.SerializerMethodField() 

    class Meta:
        model = Offer
        fields = (
            'id', 
            'demanda', 
            'professional', 
            'professional_name',
            'proposta_valor', 
            'proposta_prazo', 
            'status',
            'created_at',
            'demanda_client_name',
        )
        read_only_fields = ('professional', 'status', 'created_at')
        
    def get_professional_name(self, obj):
        if obj.professional and obj.professional.profile:
            return obj.professional.profile.full_name if obj.professional.profile.full_name else obj.professional.email
        return None

    def get_demanda_client_name(self, obj):
        client = obj.demanda.client
        if client and client.profile:
            return client.profile.full_name if client.profile.full_name else client.email
        return None


# --- Serializer de Feedback ---
class FeedbackSerializer(serializers.ModelSerializer):
    """ Serializer de Feedback. """
    
    client_name = serializers.SerializerMethodField()
    professional_name = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = (
            'id', 
            'demanda', 
            'client', 
            'client_name', 
            'professional', 
            'professional_name', 
            'rating', 
            'comentario', 
            'created_at'
        )
        read_only_fields = ('client', 'created_at')

    def get_client_name(self, obj):
        if obj.client and obj.client.profile:
            return obj.client.profile.full_name if obj.client.profile.full_name else obj.client.email
        return None

    def get_professional_name(self, obj):
        if obj.professional and obj.professional.profile:
            return obj.professional.profile.full_name if obj.professional.profile.full_name else obj.professional.email
        return None