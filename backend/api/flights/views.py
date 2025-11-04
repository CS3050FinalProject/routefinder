"""
Flight views.
"""
import os
import datetime
from asyncio.log import logger

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import FlightSerializer
from ..searches.serializers import SearchSerializer
from ..searches.models import Search
from .services import generate_unique_search_id

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

        # Search Database for existing searches
        existing_search = Search.objects.filter(search_id=search_id).first()
        if existing_search:
            # If found, return existing search data
            response = {"message": "Search already exists", "search_id": search_id}
            return Response(response, status=status.HTTP_200_OK)
        # If not found, create a new Search entry
        SearchSerializer.save_search(
            {"search_id": search_id, "search_datetime": datetime.datetime.now()}
        )

        # make request to SerpAPI if not existing search
        if not existing_search:
            try:
                r = requests.get(self.SERPAPI_URL, params=params, timeout=15)
                r.raise_for_status()
            except requests.RequestException as exc:
                logger.exception("SerpAPI request failed")
                return Response({"error": "SerpAPI request failed",
                                 "detail": str(exc)},
                                status=status.HTTP_502_BAD_GATEWAY)

            # forward status code and JSON (or text if non-JSON)
            # TODO: Modify block to parse multi_city_json from serpapi
            try:
                data = r.json()
                all_flights = [flight for group in data['best_flights'] +
                    data['other_flights'] for flight in group['flights']]
                all_flights_serializable = []
                for flight in all_flights:
                    flight_dict = {
                        "search_id": search_id,  # or set to some value you have
                        "departure_id": flight['departure_airport']['id'],
                        "arrival_id": flight['arrival_airport']['id'],
                        "type": flight.get('travel_class'),
                        "outbound_date": flight['departure_airport']['time'],
                        "travel_class": flight.get('travel_class'),
                    }
                    all_flights_serializable.append(flight_dict)

                print(all_flights_serializable)
                FlightSerializer.save_flights(data=all_flights_serializable)
                return Response({'flights': all_flights_serializable})

            except ValueError:
                return Response({"error": "SerpAPI returned non-JSON",
                                 "text": r.text[:200]},
                                 status=status.HTTP_502_BAD_GATEWAY)
