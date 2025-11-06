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
    flight_id = models.CharField(max_length=10, primary_key=True)
    search_id = models.ForeignKey('searches.Search', on_delete=models.DO_NOTHING)
    trip_id = models.TextField(default='noid')
    departure_id = models.CharField(max_length=3)
    departure_airport = models.TextField(null=True)
    arrival_id = models.CharField(max_length=3)
    arrival_airport = models.TextField(null=True)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    type = models.CharField(max_length=20)
    price = models.IntegerField(default=0)
    duration = models.IntegerField(default=0)
    outbound_date = models.DateTimeField(null=False)
    travel_class = models.CharField(max_length=20, null=True)
