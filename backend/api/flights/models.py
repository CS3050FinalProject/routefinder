from django.db import models

# Create your models here.
class Flight(models.Model):
    # Google Flights API fields
    search_id = models.TextField(null=False, default='noid')
    departure_id = models.CharField(max_length=3)
    arrival_id = models.CharField(max_length=3)
    type = models.CharField(max_length=20)
    outbound_date = models.DateTimeField(null=False)
    travel_class = models.CharField(max_length=20, null=True)
