from rest_framework import viewsets, permissions
from rest_framework import exceptions
from rest_framework import filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
# REMOVIDO: from django.db.models import Q # Importação não utilizada
from app_servicos.models import Service, Demanda, Feedback, Offer 
from .serializers import ( 
    ServiceSerializer, 
    DemandaSerializer, 
    FeedbackSerializer,
    OfferSerializer
)


# --- 1. ViewSet para Serviços (Público) ---
class ServiceViewSet(viewsets.ModelViewSet):
    """ Lista todos os serviços disponíveis. Acesso público. """
    queryset = Service.objects.all().order_by('name')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


# --- 2. ViewSet para Demandas (Restrito a Usuários Logados) ---
class DemandaViewSet(viewsets.ModelViewSet):
    """ Permite a clientes criar/editar demandas e a profissionais listar demandas pendentes. """
    serializer_class = DemandaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'descricao', 'cep', 'service__name']

    def get_queryset(self):
        """
        Define o queryset com base no tipo de usuário:
        - Cliente: Vê apenas suas demandas criadas.
        - Profissional: Vê todas as demandas PENDENTES.
        """
        user = self.request.user
        
        if not user.is_professional:
            return Demanda.objects.filter(client=user).order_by('-created_at')
        else:
            # CORRIGIDO: Status 'aberto' para 'pendente'
            return Demanda.objects.filter(status='pendente').order_by('-created_at')

    def perform_create(self, serializer):
        """ Garante que SÓ O CLIENTE PODE CRIAR e preenche o campo 'client'. """
        user = self.request.user
        
        if user.is_professional:
            raise exceptions.PermissionDenied("Profissionais não podem criar novas demandas.")
            
        serializer.save(client=user)
        
    def perform_update(self, serializer):
        """
        CORREÇÃO CRÍTICA: Permite que o Cliente edite a Demanda APENAS se estiver 'pendente'.
        """
        user = self.request.user
        instance = serializer.instance 

        # 1. Garante que SÓ O CLIENTE PODE EDITAR
        if instance.client != user:
            raise exceptions.PermissionDenied("Você só pode editar suas próprias demandas.")
        
        # 2. NOVA VERIFICAÇÃO: Permite edição APENAS se estiver 'pendente'
        if instance.status != 'pendente':
            raise exceptions.PermissionDenied(f"Esta demanda não pode ser editada, pois está com status '{instance.status}'. A edição só é permitida quando o status é 'pendente'.")

        # 3. Garante que o Cliente NÃO pode alterar o status manualmente
        if 'status' in serializer.validated_data and serializer.validated_data['status'] != instance.status:
            raise exceptions.PermissionDenied("O status da demanda só pode ser alterado por ações específicas (ex: aceitar oferta/concluir).")
            
        # 4. Salva a atualização
        serializer.save()

    def perform_destroy(self, instance):
        """ Permite o Cliente excluir a demanda APENAS se estiver pendente. """
        user = self.request.user
        
        if instance.client != user:
            raise exceptions.PermissionDenied("Você só pode excluir suas próprias demandas.")
        
        if instance.status != 'pendente':
            raise exceptions.PermissionDenied(f"Esta demanda não pode ser excluída, pois está com status '{instance.status}'.")

        instance.delete()

    
    # Ação customizada para concluir a demanda
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def concluir(self, request, pk=None):
        """ Permite ao profissional atribuído marcar a demanda como concluída. """
        try:
            demanda = self.get_object()
        except Exception:
            return Response({'detail': 'Demanda não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        
        if user != demanda.professional:
            raise exceptions.PermissionDenied("Apenas o profissional atribuído pode concluir esta demanda.")

        # CORRIGIDO: Status 'em_progresso' para 'em_andamento'
        if demanda.status != 'em_andamento':
            return Response({'detail': 'A demanda não está em andamento.'}, status=status.HTTP_400_BAD_REQUEST)
        
        demanda.status = 'concluida'
        demanda.save()

        serializer = self.get_serializer(demanda)
        return Response(serializer.data, status=status.HTTP_200_OK)


# --- 3. ViewSet para Feedback (Restrito a Clientes) ---
class FeedbackViewSet(viewsets.ModelViewSet):
    """ Permite ao cliente deixar feedback para um profissional após a conclusão da demanda. """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Feedback.objects.filter(client=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        
        if user.is_professional:
            raise exceptions.PermissionDenied("Apenas clientes podem deixar feedback.")
            
        demanda = serializer.validated_data['demanda']
        
        if demanda.client != user:
            raise exceptions.PermissionDenied("Você só pode deixar feedback para suas próprias demandas.")

        if demanda.status != 'concluida':
            raise exceptions.PermissionDenied("O feedback só pode ser deixado após a conclusão do serviço.")
            
        serializer.save(client=user)


# --- 4. ViewSet para Ofertas (Restrito a Profissionais Criarem) ---
class OfferViewSet(viewsets.ModelViewSet):
    """ Permite a Profissionais criar ofertas para demandas abertas. """
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_professional:
            return Offer.objects.filter(professional=user).order_by('-created_at')
        
        return Offer.objects.filter(demanda__client=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        
        if not user.is_professional:
            raise exceptions.PermissionDenied("Apenas Profissionais podem fazer ofertas.")
        
        demanda = serializer.validated_data['demanda']
        # CORRIGIDO: Status 'aberto' para 'pendente'
        if demanda.status != 'pendente':
            raise exceptions.PermissionDenied("Esta demanda não está aberta para ofertas.")

        serializer.save(professional=user)

    def perform_update(self, serializer):
        raise exceptions.PermissionDenied("A edição de ofertas não é permitida.")
    
    # Ação customizada para aceitar a oferta.
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def aceitar(self, request, pk=None):
        """ Permite ao cliente aceitar uma oferta. """
        try:
            oferta = self.get_object() 
        except Exception:
            return Response({'detail': 'Oferta não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        
        if user != oferta.demanda.client:
            raise exceptions.PermissionDenied("Você não é o cliente desta demanda e não pode aceitar esta oferta.")

        # CORRIGIDO: Status 'aberto' para 'pendente'
        if oferta.demanda.status != 'pendente':
            return Response({'detail': 'A demanda não está aberta para aceitação.'}, status=status.HTTP_400_BAD_REQUEST)
        
        oferta.status = 'aceita'
        oferta.save()
        
        # CORRIGIDO: Status 'em_progresso' para 'em_andamento'
        demanda = oferta.demanda
        demanda.status = 'em_andamento'
        demanda.professional = oferta.professional 
        demanda.save()

        Offer.objects.filter(demanda=demanda).exclude(pk=oferta.pk).update(status='rejeitada')

        serializer = self.get_serializer(oferta)
        return Response(serializer.data, status=status.HTTP_200_OK)