"""
Python script for cleaning database of old searches and flights.
old: object created >= 1 hour ago
"""
from api.flights.models import Flight
from api.searches.models import Search


