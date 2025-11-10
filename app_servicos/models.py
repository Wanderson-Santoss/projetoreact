# app_servicos/models.py

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

# --- Opções de Status ---
DEMANDA_STATUS_CHOICES = [
    ('pendente', 'Pendente'),
    ('aceita', 'Aceita'),
    ('em_andamento', 'Em Andamento'),
    ('concluida', 'Concluída'),
    ('cancelada', 'Cancelada'),
]

OFFER_STATUS_CHOICES = [
    ('pendente', 'Pendente'),
    ('aceita', 'Aceita'),
    ('rejeitada', 'Rejeitada'),
]


# --- 1. Service Model (Tipos de Serviços Oferecidos) ---
class Service(models.Model):
    """ Tipos de serviços (ex: Eletricista, Encanador, Faxineira). """
    name = models.CharField(_('Nome do Serviço'), max_length=100, unique=True)
    description = models.TextField(_('Descrição'))
    # NOVO CAMPO: Para exibir um ícone no frontend
    icon = models.CharField(_('Ícone (Emoji ou CSS class)'), max_length=50, default='🛠️')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Serviço')
        verbose_name_plural = _('Serviços')


# --- 2. Demanda Model (O que o Cliente pede) ---
class Demanda(models.Model):
    """ Pedido de serviço feito por um Cliente. """
    
    # Usuário que criou a demanda (o Cliente)
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='demandas_criadas',
        limit_choices_to={'is_professional': False} 
    )
    
    # O profissional que aceitou a demanda (opcional, pode ser NULL)
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandas_aceitas',
        limit_choices_to={'is_professional': True} 
    ) 
    
    service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='demandas'
    )
    
    titulo = models.CharField(_('Título da Demanda'), max_length=255)
    descricao = models.TextField(_('Descrição Detalhada'))
    cep = models.CharField(_('CEP do Serviço'), max_length=8)
    status = models.CharField(
        _('Status'),
        max_length=20,
        choices=DEMANDA_STATUS_CHOICES,
        default='pendente'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Demanda #{self.id} - {self.titulo} ({self.status})"

    class Meta:
        verbose_name = _('Demanda')
        verbose_name_plural = _('Demandas')
        ordering = ['-created_at']


# --- 3. Offer Model (Proposta do Profissional para a Demanda) ---
class Offer(models.Model):
    """ Proposta feita por um Profissional para uma Demanda específica. """
    
    demanda = models.ForeignKey(
        Demanda,
        on_delete=models.CASCADE,
        related_name='offers'
    )
    
    # O profissional que fez a oferta
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='offers_feitas',
        limit_choices_to={'is_professional': True} 
    )
    
    proposta_valor = models.DecimalField(_('Valor Proposto'), max_digits=10, decimal_places=2)
    proposta_prazo = models.CharField(_('Prazo Sugerido'), max_length=50) # Ex: "3 dias", "1 semana"
    
    status = models.CharField(
        _('Status da Oferta'),
        max_length=20,
        choices=OFFER_STATUS_CHOICES,
        default='pendente'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Oferta de {self.professional.email} para Demanda #{self.demanda.id}"

    class Meta:
        verbose_name = _('Oferta')
        verbose_name_plural = _('Ofertas')
        unique_together = ('demanda', 'professional')


# --- 4. Feedback Model (Avaliação de um Serviço) ---
class Feedback(models.Model):
    """ Avaliação de um serviço concluído. """
    
    demanda = models.OneToOneField(
        Demanda,
        on_delete=models.CASCADE,
        related_name='feedback',
        help_text=_('A Demanda que gerou o feedback.')
    )
    
    # O Cliente que DEIXOU o feedback
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_feitos',
        limit_choices_to={'is_professional': False}
    )
    
    # O Profissional que RECEBEU o feedback
    professional = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='feedbacks_recebidos',
        limit_choices_to={'is_professional': True}
    )
    
    rating = models.PositiveSmallIntegerField(_('Avaliação'), choices=[(i, str(i)) for i in range(1, 6)])
    comentario = models.TextField(_('Comentário'), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback {self.rating} estrelas para {self.professional.email}"

    class Meta:
        verbose_name = _('Feedback')
        verbose_name_plural = _('Feedbacks')