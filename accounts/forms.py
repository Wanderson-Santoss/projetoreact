# accounts/forms.py (Conteúdo COMPLETO e CORRIGIDO)

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Profile

# --- 1. Formulário SIMPLIFICADO para ADIÇÃO de Usuários no ADMIN ---
# (Formulário usado pela classe UserAdmin.add_form)
class AdminUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        # Campos necessários para o Admin. O ProfileInline cuida do resto.
        fields = ('email', 'is_professional',) 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove campo 'username' herdado, que não existe no seu modelo User
        if 'username' in self.fields:
            del self.fields['username']

# --- 2. Formulário para EDIÇÃO de Usuários no ADMIN ---
# (Formulário usado pela classe UserAdmin.form)
class ClientProfessionalChangeForm(UserChangeForm):
    class Meta:
        model = User
        # Inclui todos os campos do User que o Admin precisa gerir (exceto senha)
        fields = ('email', 'is_professional', 'is_staff', 'is_superuser', 'is_active', 'groups', 'user_permissions') 

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove campos padrão (username, first_name, last_name) que não existem no seu User customizado
        if 'username' in self.fields:
            del self.fields['username']
        if 'first_name' in self.fields:
             del self.fields['first_name']
        if 'last_name' in self.fields:
             del self.fields['last_name']
             

# --- 3. Formulário COMPLEXO para a API de Cadastro (Front-end) ---
# Mantenha este se você o usa na sua view de cadastro (CadastroView)
class ClientProfessionalCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'is_professional')
        
    # Campos do Profile que são tratados aqui, e não no Admin
    full_name = forms.CharField(label='Nome Completo', max_length=255)
    cpf = forms.CharField(label='CPF', max_length=11)
    phone_number = forms.CharField(label='Telefone (com DDD)', max_length=15, required=False)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'username' in self.fields:
            del self.fields['username']

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
            user.profile.full_name = self.cleaned_data.get('full_name')
            user.profile.cpf = self.cleaned_data.get('cpf')
            user.profile.phone_number = self.cleaned_data.get('phone_number')
            user.profile.save()
            
        return user