"""
Generic test views for the api.
"""
from django.http import HttpResponse
from django.db import connections
from django.db.utils import OperationalError

from rest_framework.response import Response
from rest_framework.decorators import api_view

from api.flights.models import Flight
from api.flights.serializers import FlightSerializer

def landing(request):
    """
    Home page place holder to keep eb healthy.
    """
    print("Landing request")
    return HttpResponse("API available", status=200)


@api_view(["GET", "POST"])
def api_home(request, *args, **kwargs):
    """
    View to test app connectivity.
    """
    if request.method == "POST":
        print("Serializing...")
        serializer = FlightSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            return Response(serializer.data)
        return Response({"error": "Invalid data"}, status=400)

    if request.method == "GET":
        flights = Flight.objects.all()
        serializer = FlightSerializer(flights, many=True)
        json_data = serializer.data
        return Response(json_data)

    response = {"error": "bad request"}
    return Response(response)


def db_health_check(request):
    """
    Check that connection to db can be made.
    """
    db_conn = connections['default']
    try:
        db_conn.cursor()
        return Response({"database_status": "connected"})
    except OperationalError as e:
        return Response({"database_status": "unavailable", "error": str(e)})
