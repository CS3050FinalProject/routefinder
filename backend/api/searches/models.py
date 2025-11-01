from django.db import models

# Create your models here.
class Search(models.Model):
    search_id = models.TextField(null=False)
    search_datetime = models.DateTimeField(null=False)

