from django.urls import path
from .views import login_view, register_view, logout_view, user_view

urlpatterns = [
    path('login/', login_view, name='auth-login'),
    path('register/', register_view, name='auth-register'),
    path('logout/', logout_view, name='auth-logout'),
    path('user/', user_view, name='auth-user'),
]
