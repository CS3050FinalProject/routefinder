"""
Flight views.
"""
import os
import datetime
from asyncio.log import logger
import json

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core import serializers

from .models import Flight
from .serializers import FlightSerializer
from ..searches.serializers import SearchSerializer
from ..searches.models import Search
from .services import generate_unique_search_id, generate_unique_trip_id

class FlightSearchView(APIView):
    """
    Proxy GET requests to SerpAPI (google_flights).
    Example frontend call:
      GET /api/search/?departure_id=PEK&arrival_id=AUS&outbound_date=2025-10-10&return_date=2025-10
      -16&currency=USD&hl=en
    Must set SERPAPI_API_KEY in environment.
    """
    SERPAPI_URL = "https://serpapi.com/search.json"
    ALLOWED_PARAMS = {"departure_id", "arrival_id", "outbound_date", "return_date", "currency"}

    def get(self, request):
        """
        Retrieves flight information from serpapi and checks for
        recent identical searches stored in db. If search exists 
        in db and was made previously, returns those search results.
        Otherwise it queries serpapi and returns new search data.
        """
        api_key = os.environ.get("SERP_API_KEY") # the api key is in the elastic beanstalk
        if not api_key:
            return Response({"error": "SERP_API_KEY not configured"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # copy permitted query params
        params = {}
        for k, v in request.query_params.items():
            if k in self.ALLOWED_PARAMS:
                params[k] = v


        # generate unique search ID
        search_id = generate_unique_search_id(params.get("departure_id", ""),
                                              params.get("arrival_id", ""),
                                              params.get("outbound_date", ""),
                                              params.get("return_date", ""))

        # enforce engine and api_key
        params["engine"] = "google_flights"
        params["api_key"] = api_key
        params["multi_city_json"] = "true"

        # Search Database for existing searches
        existing_search = Search.objects.filter(search_id=search_id).first()

        # make request to SerpAPI if not existing search
        if not existing_search:
            try:
                r = requests.get(self.SERPAPI_URL, params=params, timeout=15)
                r.raise_for_status()
                print("SerpAPI request successful")
                # If not found, create a new Search entry
                SearchSerializer.save_search(
                    {"search_id": search_id, "search_datetime": datetime.datetime.now()}
                )
            except requests.RequestException as exc:
                logger.exception("SerpAPI request failed")
                return Response({"error": "SerpAPI request failed",
                                 "detail": str(exc)},
                                status=status.HTTP_502_BAD_GATEWAY)

            # forward status code and JSON (or text if non-JSON)
            try:
                print("trying")
                data = r.json()
                # Extract list of itineraries (adjust key if SerpAPI response uses a different one)
                best_flights = data.get("best_flights") or data.get("flights") or []

                flights_to_save = []
                for itinerary in best_flights:
                    # print(itinerary)
                    # price / meta may be on the itinerary level
                    itinerary_price = itinerary.get("price")
                    airline_logo = itinerary.get("airline_logo")
                    type = itinerary.get("type")
                    flights = itinerary.get("flights")

                    trip_id = generate_unique_trip_id(json.dumps(flights))

                    for flight in flights:

                        flight_dict = {
                            'search_id': search_id,
                            'trip_id': trip_id,
                            'departure_id': flight.get("departure_id"),
                            'departure_airport': flight.get("departure_airport").get("name"),
                            'arrival_id': flight.get("arrival_id"),
                            'departure_time': flight.get("departure_airport").get("departure_time"),
                            'arrival_time': flight.get("arrival_airport").get("arrival_time"),
                            'arrival_airport': flight.get("arrival_airport").get("name"),
                            'type': type,
                            'price': itinerary_price,
                            'duration': flight.get("duration"),
                            'outbound_date': flight.get("outbound_date"),
                            'travel_class': flight.get("travel_class"),
                            'airline_logo': airline_logo,
                            'airline_name': flight.get("airline_name")
                        }
                        print("flight_dict:", flight_dict)
                        flights_to_save.append(flight_dict)
                
                print("saving flights checkpoint")
                FlightSerializer.save_flights(data=flights_to_save)

            except ValueError:
                print("Raising value error")
                return Response({"error": "SerpAPI returned non-JSON",
                                 "text": r.text[:200]},
                                 status=status.HTTP_502_BAD_GATEWAY)
        #print("checkpoint")
        get_flights_by_search_id = FlightSerializer.get_flights_by_search_id(search_id)
        print(type(get_flights_by_search_id))
        flights = serializers.serialize("json", get_flights_by_search_id)
        return Response(flights)
