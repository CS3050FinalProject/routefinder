'''
Flight serializers.
'''
import json
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
            'flight_id'
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
        ]

    @staticmethod
    def save_flights(data, batch_size: int=1000) -> dict:
        """
        Saves a list of flight objects in json or python dictionary format.
        """
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
        print("Form flights/serializer: flights list of models created")

        # Atomically add objects to postgres
        with transaction.atomic():
            created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

        return {"created": len(created_objs), "created_objs": created_objs}
