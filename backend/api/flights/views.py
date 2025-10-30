from asyncio.log import logger
from rest_framework import generics
from .models import Flight
#from .serializers import FlightSerializer
import os
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class FlightSearchView(APIView):
    """
    Proxy GET requests to SerpAPI (google_flights).
    Example frontend call:
      GET /api/search/?departure_id=PEK&arrival_id=AUS&outbound_date=2025-10-10&return_date=2025-10-16&currency=USD&hl=en
    Must set SERPAPI_API_KEY in environment.
    """
    SERPAPI_URL = "https://serpapi.com/search.json"
    ALLOWED_PARAMS = {
        "departure_id", "arrival_id", "outbound_date", "return_date",
        "currency", "gl", "hl", "travel_class", "type", "api_key"
    }

    def get(self, request, format=None):
        api_key = os.environ.get("SERPAPI_API_KEY") # the api key is in the elastic beanstalk
        if not api_key:
            return Response({"error": "SERPAPI_API_KEY not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # copy permitted query params
        params = {}
        for k, v in request.query_params.items():
            if k in self.ALLOWED_PARAMS:
                params[k] = v

        # enforce engine and api_key
        params["engine"] = "google_flights"
        params["api_key"] = api_key

        try:
            r = requests.get(self.SERPAPI_URL, params=params, timeout=15)
            r.raise_for_status()
        except requests.RequestException as exc:
            logger.exception("SerpAPI request failed")
            return Response({"error": "SerpAPI request failed", "detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)

        # forward status code and JSON (or text if non-JSON)
        try:
            data = r.json()
            serializer = FlightSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=r.status_code)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "SerpAPI returned non-JSON", "text": r.text[:200]}, status=status.HTTP_502_BAD_GATEWAY)
