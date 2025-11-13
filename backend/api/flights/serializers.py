'''
Flight serializers.
'''
import json

from requests import Response
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
        print("--- save_flights debugging ---")
        print("--- Checking data type")
        if isinstance(data, str):
            data = json.loads(data)
            print("--- Data is str")
        elif not isinstance(data, list):
            raise ValueError("--- Expected a list of flight objects")

        print("--- Serializing flights")
        serializer = FlightSerializer(data=data, many=True) # pass data to serializer
        print("--- Flights serialized")
        print("--- Checking flights validity")
        serializer.is_valid(raise_exception=True) # check data validity
        validated = serializer.validated_data # store the validated data in a variable
        print("--- Data is valid")

        # Unpack the serialized data into a list of Flight objects
        try:
            print("--- Saving flights as models")
            flights = [Flight(**item) for item in validated]
            print(f"--- Created {len(flights)} Flight model instances")

            print("--- Adding flights to DB")
            with transaction.atomic():
                created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)
                print(f"--- Flights added ({len(created_objs)} created)")

        except TypeError as e:
            print("--- Flight model creation failed (invalid field):", e)
        except IntegrityError as e:
            print("--- Database integrity error during bulk_create:", e)
        except DatabaseError as e:
            print("--- General database error during bulk_create:", e)
        except Exception as e:
            print("--- Unexpected error while saving flights:", e)

        print("--- end serializers debugging ---")
        return {"created": len(created_objs), "created_objs": created_objs}


    def get_flights_by_search_id(search_id: str, limit=15) -> list[dict]:
        '''Retrieve flights by search_id. Returns a list of flight dicts.'''
        # If found, return existing search data (fetch flights from DB)
        print("--- Checking if flight objects exist")
        flights = Flight.objects.filter(search_id=search_id)
        print(len(flights))
        if len(flights) > limit:
            flights = flights[:15]
        elif not flights:
            print("--- No flights found.")
            raise Exception("No flights found for given search_id.")
        #print(f"--- {len(flights)} flights found, returning {limit}")

        print("--- Creating flights_list")
        flights_list = []
        for f in flights:
            # build a dict similar to how created_flights was constructed
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
                flights_list.append(flight_dict)

        print("--- flights_list created, returning now")
        return flights_list

