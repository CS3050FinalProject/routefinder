from django.urls import path
from . import views

urlpatterns = [
    path("", views.landing)
    path("api-home/", views.api_home),
    path("dbcheck/", views.db_health_check),
]
