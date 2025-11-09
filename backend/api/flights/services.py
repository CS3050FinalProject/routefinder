'''Flight services.
'''
import json
import hashlib
from django.db import transaction
from .models import Flight
from .serializers import FlightSerializer

def save_flights(data, batch_size: int=10) -> dict:
    '''Saves a list of flight objects in json or python dictionary format.'''
    if isinstance(data, str):
        data = json.loads(data)
    if not isinstance(data, list):
        raise ValueError("Expected a list of flight objects")

    serializer = FlightSerializer(data=data, many=True)
    serializer.is_valid(raise_exception=True)
    #serializer.validated_data

    flights = [Flight(**item) for item in data]

    with transaction.atomic():
        created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

    return {"created": len(created_objs), "created_objs": created_objs}

def generate_unique_search_id(
        departure_id: str,
        arrival_id: str,
        outbound_date: str,
        return_date: str) -> str:
    '''Generates a unique search ID based on flight search parameters.'''
    unique_string = f"{departure_id}-{arrival_id}-{outbound_date}-{return_date}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def generate_unique_trip_id(full_trip_str: str) -> str:
    '''Generates a unique trip ID based on what flights are connected.'''
    return hashlib.md5(full_trip_str.encode()).hexdigest()

