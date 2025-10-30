from django.db import models

# Create your models here.
class Flight(models.Model):
    # Google Flights API fields
    departure_id = models.CharField(max_length=3)
    arrival_id = models.CharField(max_length=3)
    gl = models.CharField(max_length=2)
    hl = models.CharField(max_length=2)
    type = models.IntegerField(default=1)
    outbound_date = models.DateTimeField()
    return_date = models.DateTimeField()
    travel_class = models.IntegerField(blank=True, null=True)
