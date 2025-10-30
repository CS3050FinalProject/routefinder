import json
from django.db import transaction
from rest_framework.exceptions import ValidationError
from .models import Flight
from .serializers import FlightSerializer

def save_flights(data, batch_size: int=10) -> dict:
    if isinstance(data, str):
        data = json.loads(data)
    if not isinstance(data, list):
        raise ValueError("Expected a list of flight objects")

    serializer = FlightSerializer(data=data, many=True)
    serializer.is_valid(raise_exception=True)
    validated = serializer.validated_data

    flights = [Flight(**item) for item in data]

    with transaction.atomic():
        created_objs = Flight.objects.bulk_create(flights, batch_size=batch_size)

    return {"created": len(created_objs), "created_objs": created_objs}
