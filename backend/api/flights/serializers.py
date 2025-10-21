from rest_framework import serializers
from .models import Flight

class FlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = [
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
