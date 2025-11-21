"""
Flight views.
"""
import os
from asyncio.log import logger
import json

import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core import serializers
from django.core import management

from .models import Flight
from .serializers import FlightSerializer
from api.searches.serializers import SearchSerializer
from api.searches.models import Search
from .services import generate_unique_search_id, search_for_flights


class FlightSearchView(APIView):
    """
    Proxy GET requests to SerpAPI (google_flights).
    Example frontend call:
      GET /api/search/?departure_id=PEK&arrival_id=AUS&outbound_date=2025-10-10&return_date=2025-10
      -16&currency=USD&hl=en
    Must set SERPAPI_API_KEY in environment.
    """
    SERPAPI_URL = "https://serpapi.com/search.json"
    ALLOWED_PARAMS = {"departure_id", "arrival_id", "outbound_date", "return_date", "currency", "type"}
    REQUIRED_PARAMS = {"departure_id", "arrival_id", "outbound_date"}

    def get(self, request):
        """
        Retrieves flight information from database. If an identical
        search exists was made recently and results for it exist in
        the db, return those search results. Otherwise query SerpAPI
        and store those new results before returning.
        """
        print(">>> views debugging <<<")
        # Clean database of old searches
        # try:
        #     management.call_command('db_sweeper')
        #     print("db_sweeper executed")
        # except Exception as e:
        #     print("db_sweeper skipped:", e)

        # Check for api key
        api_key = os.environ.get("SERP_API_KEY") # api key in eb environment
        if not api_key:
            return Response({"error": "SERP_API_KEY not configured"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Copy permitted query params
        params = {}
        for k, v in request.query_params.items():
            if k in self.ALLOWED_PARAMS:
                params[k] = v


        # TODO: Implement logic to check if user is searching for direct or
        # round trip flights. Filter out potentially unnecessary parameters.

        # Return an error if required parameters are missing
        if not self.REQUIRED_PARAMS.issubset(set(params)):
            cp_required = self.REQUIRED_PARAMS.copy()
            cp_required -= set(params)
            return Response({"error": f"Missing params: {cp_required}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print(">>> Setting trip type <<<")
        # Check for user specified flight type and filter passed parameters accordingly
        # 1 - Round trip (default)
        # 2 - One way
        if "type" in params.keys():
            trip_type = int(params.get("type"))
        else:
            trip_type = 1  # Default to round trip

        """
        NOTE: We may want to move logic for querying serpapi inside
        this match-case statement to avoid using a large if else statement
        checking the trip type later in the code. Alternatively we can move
        the code to query serpapi to a function in the services file the way
        we did with the code to parse the json. We may want to do that regardless
        to avoid duplicating the query code for return flights since we will need
        to make two queries to serp.
        """
        match trip_type:
            case 1:
                if params.get("return_date") == None:
                    return Response({"error": "No return date specified for round trip search."},
                                   status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            case 2:
                if params.get("return_date") != None:
                    del params["return_date"]
            case _:
                return Response({"error": "Invalid flight type passed."},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        #Set boolean for round trip
        if trip_type == 1:
            is_round_trip = True
        else:   
            is_round_trip = False

        # generate unique search ID for outbound flight
        search_id = generate_unique_search_id(params.get("departure_id"),
                                              params.get("arrival_id"),
                                              params.get("outbound_date"))
        if is_round_trip:
            # generate unique search ID for return flight
            return_search_id = generate_unique_search_id(params.get("arrival_id"),
                                                         params.get("departure_id"),
                                                         params.get("return_date"))
        
        print(">>> search_id generated <<<")

        # enforce engine and api_key
        params["engine"] = "google_flights"
        params["api_key"] = api_key
        params["multi_city_json"] = "true"

        #set to type 2 for outbound search
        params["type"] = 2

        print(">>> searching outbound flights <<<")
        outbound_flights_dict = search_for_flights(self, params, search_id)
        flights_dict = {}
        flights_dict["outbound_trips"] = outbound_flights_dict
        print(">>> outbound flights searched <<<")
        if is_round_trip:
            print(">>> searching return flights <<<")
            return_params = params.copy()
            # swap departure and arrival for return flight
            return_params["departure_id"] = params.get("arrival_id")
            return_params["arrival_id"] = params.get("departure_id")
            return_params["outbound_date"] = params.get("return_date")
            return_params["type"] = 2
            # remove return date for return flight search
            del return_params["return_date"]
            return_flights_dict = search_for_flights(self, return_params, return_search_id)
            flights_dict["return_trips"] = return_flights_dict

        print(">>> returning response <<<")
        if is_round_trip:
            print(f"Return flights found: {len(flights_dict['return_trips'])}")
        print(f"Outbound flights found: {len(flights_dict['outbound_trips'])}")
        if not flights_dict:
            return Response({"error": "No flights found."},
                            status=status.HTTP_404_NOT_FOUND)
        #dump flights to json and return response
        flights = json.dumps(flights_dict, indent=4)
        print(flights)
        return Response(flights, status=status.HTTP_200_OK)
