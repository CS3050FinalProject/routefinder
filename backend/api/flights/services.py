'''Flight services.
'''
from asyncio.log import logger
import json
import hashlib
from typing import Optional

from django.utils import timezone
from django.db import transaction
import requests
from rest_framework.response import Response
from rest_framework import status

from api.searches.serializers import SearchSerializer
from .models import Flight
from ..searches.models import Search
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
        outbound_date: str) -> str:
    '''Generates a unique search ID based on flight search parameters.'''
    unique_string = f"{departure_id}-{arrival_id}-{outbound_date}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def generate_unique_trip_id(full_trip_str: str) -> str:
    '''Generates a unique trip ID based on what flights are connected.'''
    return hashlib.md5(full_trip_str.encode()).hexdigest()

def parse_flights_json(flights_list: list, search_id: str) -> Optional[list]:
    #print(flights_list)
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
            flights_to_save.append(flight_dict)

    return None if not flights_to_save else flights_to_save

def get_flights_from_serpapi(URL, params: dict, search_id: str):
    try:
        r = requests.get(URL, params=params, timeout=15)
        r.raise_for_status()
        print(">>> SerpAPI request successful")
        # If not found, create a new Search entry
        print(">>> Saving search")
        SearchSerializer.save_search(
            {"search_id": search_id, "search_datetime": timezone.now()}
        )
    except requests.RequestException as exc:
        logger.exception("SerpAPI request failed")
        return Response({"error": "SerpAPI request failed",
                            "detail": str(exc)},
                        status=status.HTTP_502_BAD_GATEWAY)

    # forward status code and JSON (or text if non-JSON)
    try:
        data = r.json()

        # Save serp response to file for debugging
        #with open('serp_response.txt', 'w') as f:
        #    f.write(json.dumps(data, indent=2))

        # Extract list of itineraries (adjust key if SerpAPI response uses a different one)
        best_flights = data.get("best_flights") or None
        other_flights = data.get("other_flights") or None
        #print(f">>> Flight data: \nbest_flights: {best_flights}\nother_flights: {other_flights}")
        try:
            if not best_flights and not other_flights:
                raise ValueError
        except ValueError:
            return Response({"error": "SerpAPI returned non-parseable JSON",
                            "text": r.text[:200]},
                            status=status.HTTP_502_BAD_GATEWAY)

        if best_flights:
            flights_to_save = parse_flights_json(best_flights, search_id)
            FlightSerializer.save_flights(data=flights_to_save)
        if other_flights:
            flights_to_save = parse_flights_json(other_flights, search_id)
            FlightSerializer.save_flights(data=flights_to_save)

    except ValueError:
        return Response({"error": "SerpAPI returned non-JSON",
                            "text": r.text[:200]},
                            status=status.HTTP_502_BAD_GATEWAY)
    
def search_for_flights(self, params: dict, search_id: str):
    # Search Database for existing searches
    print(">>> Checking for previous matching searches <<<")
    existing_search = Search.objects.filter(search_id=search_id).first()
    if existing_search:
        print(">>> Existing search found")
    else:
        print(">>> No existing search found")

    # make request to SerpAPI if not existing search and save to database
    if not existing_search:
        get_flights_from_serpapi(self.SERPAPI_URL, params, search_id)
    
    # Retrieve saved flights from database
    try:
        get_flights_by_search_id = FlightSerializer.get_flights_by_search_id(search_id)
    except Exception as e:
        print(e)
        return requests.Response({"error": "There are no saved flights for this search"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # group flights by trip_id into trips, preserving insertion order
    trips_map = {}
    for f in get_flights_by_search_id:
        tid = f.get("trip_id")
        if tid not in trips_map:
            trips_map[tid] = {
                "price": f.get("price"),
                "type": f.get("type"),
                "travel_class": f.get("travel_class"),
                "flights": [],
            }
        # append flight leg (keep the same field shape as stored)
        trips_map[tid]["flights"].append({
            "departure_id": f.get("departure_id"),
            "departure_airport": f.get("departure_airport"),
            "departure_time": f.get("departure_time"),
            "outbound_date": f.get("outbound_date"),
            "arrival_id": f.get("arrival_id"),
            "arrival_airport": f.get("arrival_airport"),
            "arrival_time": f.get("arrival_time"),
            "arrival_date": f.get("arrival_date"),
            "duration": f.get("duration"),
            "airline_name": f.get("airline_name"),
            "airline_logo": f.get("airline_logo")
        })

    trips = list(trips_map.values())
    return trips
