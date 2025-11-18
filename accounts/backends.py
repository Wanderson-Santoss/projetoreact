from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailBackend(ModelBackend):
    """
    Backend que permite a autenticação por e-mail, em vez do username padrão.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # 1. Tenta encontrar o usuário pelo email
            # O 'username' aqui é, na verdade, o email que o serializer está enviando
            user = UserModel.objects.get(email__iexact=username)
        except UserModel.DoesNotExist:
            # Usuário não existe, falha na autenticação
            return None

        # 2. Se o usuário existe, verifica a senha
        if user.check_password(password):
            return user
        
        # Senha incorreta
        return None