"""
Model to hold user searches.
"""
from django.db import models

# Create your models here.
class Search(models.Model):
    """
    Saves a unique search id (primary key) 
    and datetime of search.
    """
    search_id = models.TextField(primary_key=True)
    search_datetime = models.DateTimeField(null=False)
