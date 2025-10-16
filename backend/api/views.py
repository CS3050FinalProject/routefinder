import json
from django.forms.models import model_to_dict
from rest_framework.response import Response
from rest_framework.decorators import api_view
from api.flights.models import Flight
from api.flights.serializers import FlightSerializer

@api_view(["GET", "POST"])
def api_home(request, *args, **kwargs):
    if request.method == "POST":
        print("Serializing...")
        serializer = FlightSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            print(serializer.data)
            return Response(serializer.data)

    elif request.method == "GET":
        flights = Flight.objects.all()
        serializer = FlightSerializer(flights, many=True)
        json_data = serializer.data
        return Response(json_data)

    else:
        return Response({"error": "bad request"})
