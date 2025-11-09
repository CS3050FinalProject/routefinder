"""
Model to store serp api flight information.
"""
from django.db import models

# Create your models here.
class Flight(models.Model):
    """
    Saves search_id as foreign key to searches
    and flight info.
    """
    # Google Flights API fields
    #flight_id = models.CharField(max_length=10, primary_key=True)
    search_id = models.ForeignKey('searches.Search', on_delete=models.DO_NOTHING)
    trip_id = models.TextField(default='noid')
    departure_id = models.CharField(max_length=3)
    departure_airport = models.TextField(null=True)
    arrival_id = models.CharField(max_length=3, null=True)
    departure_time = models.CharField(max_length=8, null=True)
    arrival_time = models.CharField(max_length=8, null=True)
    arrival_airport = models.TextField(null=True)
    type = models.CharField(max_length=20, null=True)
    price = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    outbound_date = models.CharField(max_length=10, null=True)
    arrival_date = models.CharField(max_length=10, null=True)
    travel_class = models.CharField(max_length=20, null=True)
    airline_logo = models.TextField(null=True)
    airline_name = models.TextField(null=True)
