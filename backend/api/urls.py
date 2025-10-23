from django.urls import path
from . import views

urlpatterns = [
    path("", views.api_home),
    path("dbcheck/", views.db_health_check),
]
