'''
Flight serializers.
'''
import json

from requests import Response
from rest_framework import serializers
from django.db import transaction
from .models import Flight


class FlightSerializer(serializers.ModelSerializer):
    '''
    Serializer for Flight model.
    '''
    class Meta:
        model = Flight
        fields = [
            'search_id',
            'trip_id',
            'departure_id',
            'departure_airport',
            'arrival_id',
            'departure_time',
            'arrival_time',
            'arrival_airport',
            'type',
            'price',
            'duration',
            'outbound_date',
            'travel_class',
            'airline_logo',
            'airline_name',
        ]

    @staticmethod
    def save_flights(data, batch_size: int=1000) -> dict:
        """
        Saves a list of flight objects in json or python dictionary format.
        """
        print("Saving flights in serializer")
        if isinstance(data, str):
            data = json.loads(data)
            print("From flights/serializers: Data is str")
        if not isinstance(data, list):
            raise ValueError("Expected a list of flight objects")

        serializer = FlightSerializer(data=data, many=True) # pass data to serializer
        serializer.is_valid(raise_exception=True) # check data validity
        validated = serializer.validated_data # store the validated data in a variable

        # Unpack the serialized data into a list of Flight objects
        flights = [Flight(**item) for item in validated]
        print("From flights/serializer: flights list of models created")

        # Atomically add objects to postgres
        with transaction.atomic():
            created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

        return {"created": len(created_objs), "created_objs": created_objs}


    def get_flights_by_search_id(search_id: str):
        '''Retrieve flights by search_id. Returns a list of flight dicts.'''
        # If found, return existing search data (fetch flights from DB)
        print("search_id:", search_id)
        if Flight.objects.exits():
            flights_qs = Flight.objects.filter(search_id=search_id)

        flights_list = []
        for f in flights_qs:
            # build a dict similar to how created_flights was constructed
                flight_dict = {
                    "search_id": getattr(f, "search_id", None),
                    "departure_id": getattr(f, "departure_id", None),
                    "arrival_id": getattr(f, "arrival_id", None),
                    "outbound_date": getattr(f, "outbound_date", None),
                    "travel_class": getattr(f, "travel_class", None),
                }
                flights_list.append(flight_dict)

        return flight_qs

