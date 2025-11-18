# accounts/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# 🚨 IMPORTAÇÕES CRÍTICAS (User e Profile)
from .models import User, Profile 
from .forms import AdminUserCreationForm, ClientProfessionalChangeForm 

# --- 1. Inline para o Perfil (DEVE SER DEFINIDO PRIMEIRO) ---
class ProfileInline(admin.StackedInline):
    """Define como os campos do Profile aparecerão dentro da tela de edição do User."""
    model = Profile
    can_delete = False
    verbose_name_plural = 'Perfil'
    
    # Lista todos os campos do Profile (deve corresponder ao models.py)
    fields = (
        'full_name', 'cpf', 'phone_number', 'bio', 
        'cep', 'cidade', 'estado', 
        'servico_principal', 'descricao_servicos', 
        'palavras_chave', 'cnpj', 'rating'
    )

# --- 2. Admin Customizado para o Usuário (User) ---
class UserAdmin(BaseUserAdmin):
    """Classe Admin para o modelo User customizado, usando Email como login."""
    
    #  AGORA ProfileInline é reconhecido
    inlines = (ProfileInline,)
    
    # Usa os formulários customizados
    add_form = AdminUserCreationForm
    form = ClientProfessionalChangeForm 
    
    # Configurações de exibição na lista
    list_display = ('email', 'is_professional', 'is_staff', 'is_active')
    list_filter = ('is_professional', 'is_staff', 'is_superuser', 'is_active')

    # FIELDSETS PARA EDIÇÃO de usuário existente
    fieldsets = (
        (None, {'fields': ('email', 'password')}), 
        ('Informações de Perfil', {'fields': ('is_professional',)}), 
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas Importantes', {'fields': ('last_login', 'date_joined')}),
    )

    # FIELDSETS PARA ADIÇÃO de novo usuário
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'is_professional', 'password', 'password2') 
        }),
    )
    
    ordering = ('email',)
    search_fields = ('email',)
    
# --- 3. Registro no Admin ---

# Desregistra o Admin padrão do User (se já registrado)
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass

# Registra o seu modelo User customizado com a sua classe UserAdmin
admin.site.register(User, UserAdmin)