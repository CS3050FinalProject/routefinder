'''
Flight serializers.
'''
import json

from rest_framework import serializers
from django.db import transaction, IntegrityError, DatabaseError

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
            'arrival_date',
            'travel_class',
            'airline_logo',
            'airline_name',
        ]

    @staticmethod
    def save_flights(data, batch_size: int=1000) -> dict:
        """
        Saves a list of flight objects in json or python dictionary format.
        """
        if isinstance(data, str):
            data = json.loads(data)
        elif not isinstance(data, list):
            raise ValueError("--- Expected a list of flight objects")

        serializer = FlightSerializer(data=data, many=True) # pass data to serializer
        serializer.is_valid(raise_exception=True) # check data validity
        validated = serializer.validated_data # store the validated data in a variable

        # Unpack the serialized data into a list of Flight objects
        try:
            flights = [Flight(**item) for item in validated]

            with transaction.atomic():
                created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

        except TypeError as e:
            print("--- Flight model creation failed (invalid field):", e)
        except IntegrityError as e:
            print("--- Database integrity error during bulk_create:", e)
        except DatabaseError as e:
            print("--- General database error during bulk_create:", e)

        print("--- end serializers debugging ---")
        return {"created": len(created_objs), "created_objs": created_objs}


    def get_flights_by_search_id(self, search_id: str, limit=15) -> list[dict]:
        '''Retrieve flights by search_id. Returns a list of flight dicts.'''
        # If found, return existing search data (fetch flights from DB)
        flights = Flight.objects.filter(search_id=search_id)

        if not flights:
            raise Exception("No flights found for given search_id.")

        unique_trip_ids = []
        flights_list = []

        for f in flights:
            if len(unique_trip_ids) >= limit:
                break
            flight_dict = {
                "trip_id": getattr(f, "trip_id", None),
                "departure_id": getattr(f, "departure_id", None),
                "departure_airport": getattr(f, "departure_airport", None),
                "departure_time": getattr(f, "departure_time", None),
                "arrival_id": getattr(f, "arrival_id", None),
                "arrival_time": getattr(f, "arrival_time", None),
                "arrival_airport": getattr(f, "arrival_airport", None),
                "arrival_date": getattr(f, "arrival_date", None),
                "duration": getattr(f, "duration", None),
                "airline_name": getattr(f, "airline_name", None),
                "airline_logo": getattr(f, "airline_logo", None),
                "type": getattr(f, "type", None),
                "price": getattr(f, "price", None),
                "outbound_date": getattr(f, "outbound_date", None),
                "travel_class": getattr(f, "travel_class", None),
            }
            # Check if trip_id is already in unique_trip_ids, add it if not
            trip_id = flight_dict.get("trip_id")
            if trip_id not in unique_trip_ids:
                unique_trip_ids.append(trip_id)
            flights_list.append(flight_dict)

        return flights_list
