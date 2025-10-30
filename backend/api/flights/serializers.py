from rest_framework import serializers
from .models import Flight

class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = [
            'engine',
            'api_key',
            'departure_id',
            'arrival_id',
            'gl',
            'hl',
            'type',
            'outbound_date',
            'return_date',
            'travel_class',
            'exclude_basic',
            'deep_search',
        ]


    def save_flights(data, batch_size: int=10) -> dict:
        """
        Saves a list of flight objects in json or python dictionary format.
        """
        if isinstance(data, str):
            data = json.loads(data)
        if not isinstance(data, list):
            raise ValueError("Expected a list of flight objects")

        serializer = FlightSerializer(data=data, many=True) # pass data to serializer
        serializer.is_valid(raise_exception=True) # check data validity
        validated = serializer.validated_data # store the validated data in a variable

        # Unpack the serialized data into a list of Flight objects
        flights = [Flight(**item) for item in data]

        # Atomically add objects to postgres
        with transaction.atomic():
            created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

        return {"created": len(created_objs), "created_objs": created_objs}
