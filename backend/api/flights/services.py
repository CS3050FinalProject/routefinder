'''Flight services.
'''
import json
import hashlib
from datetime import timedelta
from typing import Optional

from django.utils import timezone
from django.db import transaction
from .models import Flight
from ..searches.models import Search
from .serializers import FlightSerializer

def prune_old_searches(hours: int = 1) -> int:
    """
    Delete Search rows older than `hours` and associated Flight rows.
    Returns number of deleted Search rows.
    """
    one_hour_ago = timezone.now() - timedelta(hours=1)

    old_searches = Search.objects.filter(created_at__lt=one_hour_ago)

    deleted_count, _ = old_searches.delete()

    return deleted_count

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

def parse_flights_json(flights_list: list, search_id: str) -> Optional[list]:
    print(flights_list)
    flights_to_save = []
    for itinerary in flights_list:
        # print(itinerary)
        # price / meta may be on the itinerary level
        itinerary_price = itinerary.get("price")
        airline_logo = itinerary.get("airline_logo")
        flight_type = itinerary.get("type")
        flights = itinerary.get("flights")
        trip_id = generate_unique_trip_id(json.dumps(flights))

        for flight in flights:
            departure_datetime = flight.get("departure_airport").get("time")
            departure_date = departure_datetime[:-6]
            departure_time = departure_datetime[-5:]

            arrival_datetime = flight.get("arrival_airport").get("time")
            arrival_date = arrival_datetime[:-6]
            arrival_time = arrival_datetime[-5:]

            flight_dict = {
                'search_id': search_id,
                'trip_id': trip_id,
                'departure_id': flight.get("departure_airport").get("id"),
                'departure_airport': flight.get("departure_airport").get("name"),
                'departure_time': departure_time,
                'arrival_id': flight.get("arrival_airport").get("id"),
                'arrival_time': arrival_time,
                'arrival_airport': flight.get("arrival_airport").get("name"),
                'type': flight_type,
                'price': itinerary_price,
                'duration': flight.get("duration"),
                'outbound_date': departure_date,
                'arrival_date': arrival_date,
                'travel_class': flight.get("travel_class"),
                'airline_logo': airline_logo,
                'airline_name': flight.get("airline")
            }
            #print(">>> flight_dict:", flight_dict)
            #print(flight_dict)
            flights_to_save.append(flight_dict)

    return None if not flights_to_save else flights_to_save
