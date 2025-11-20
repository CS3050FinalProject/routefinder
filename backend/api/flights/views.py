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
from django.core import management

from .models import Flight
from .serializers import FlightSerializer
from api.searches.serializers import SearchSerializer
from api.searches.models import Search
from .services import generate_unique_search_id, generate_unique_trip_id, parse_flights_json


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

    def get(self, request):
        """
        Retrieves flight information from database. If an identical
        search exists was made recently and results for it exist in
        the db, return those search results. Otherwise query SerpAPI
        and store those new results before returning.
        """

        print(">>> views debugging <<<")
        try:
            management.call_command('db_sweeper')
            print("db_sweeper executed")
        except Exception as e:
            print("db_sweeper skipped:", e)
        

        api_key = os.environ.get("SERP_API_KEY") # the api key is in the elastic beanstalk
        if not api_key:
            return Response({"irror": "SERP_API_KEY not configured"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        print("WARNING: IS YOUR SUPABASE URL KEY CONFIGURED FOR LOCAL ENVIRONMENT?")

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
        print(">>> search_id generated")

        # enforce engine and api_key
        params["engine"] = "google_flights"
        params["api_key"] = api_key
        params["multi_city_json"] = "true"

        # Search Database for existing searches
        print(">>> Checking for previous matching searches")
        existing_search = Search.objects.filter(search_id=search_id).first()
        if existing_search:
            print(">>> Existing search found")
        else:
            print(">>> No existing search found")

        # make request to SerpAPI if not existing search
        if not existing_search:
            try:
                r = requests.get(self.SERPAPI_URL, params=params, timeout=15)
                r.raise_for_status()
                print(">>> SerpAPI request successful")
                # If not found, create a new Search entry
                print(">>> Saving search")
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
                data = r.json()

                # Save serp response to file for debugging
                #with open('serp_response.txt', 'w') as f:
                #    f.write(json.dumps(data, indent=2))

                # Extract list of itineraries (adjust key if SerpAPI response uses a different one)
                best_flights = data.get("best_flights") or None
                other_flights = data.get("other_flights") or None
                #print(f">>> Flight data: \nbest_flights: {best_flights}\nother_flights: {other_flights}")
                try:
                    if not best_flights and not other_flights:
                        raise ValueError
                except ValueError:
                    return Response({"error": "SerpAPI returned non-parseable JSON",
                                    "text": r.text[:200]},
                                    status=status.HTTP_502_BAD_GATEWAY)

                if best_flights:
                    flights_to_save = parse_flights_json(best_flights, search_id)
                    FlightSerializer.save_flights(data=flights_to_save)
                if other_flights:
                    flights_to_save = parse_flights_json(other_flights, search_id)
                    FlightSerializer.save_flights(data=flights_to_save)

            except ValueError:
                return Response({"error": "SerpAPI returned non-JSON",
                                 "text": r.text[:200]},
                                 status=status.HTTP_502_BAD_GATEWAY)
        #print("checkpoint")
        try:
            get_flights_by_search_id = FlightSerializer.get_flights_by_search_id(search_id)
        except Exception as e:
            print(e)
            return Response({"error": "There are no saved flights for this search"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # group flights by trip_id into trips, preserving insertion order
        trips_map = {}
        for f in get_flights_by_search_id:
            tid = f.get("trip_id")
            if tid not in trips_map:
                trips_map[tid] = {
                    "price": f.get("price"),
                    "type": f.get("type"),
                    "travel_class": f.get("travel_class"),
                    "flights": [],
                }
            # append flight leg (keep the same field shape as stored)
            trips_map[tid]["flights"].append({
                "departure_id": f.get("departure_id"),
                "departure_airport": f.get("departure_airport"),
                "departure_time": f.get("departure_time"),
                "outbound_date": f.get("outbound_date"),
                "arrival_id": f.get("arrival_id"),
                "arrival_airport": f.get("arrival_airport"),
                "arrival_time": f.get("arrival_time"),
                "arrival_date": f.get("arrival_date"),
                "duration": f.get("duration"),
                "airline_name": f.get("airline_name"),
                "airline_logo": f.get("airline_logo")
            })

        trips = list(trips_map.values())
        flights_dict = {"Trips": trips}
        flights = json.dumps(flights_dict, indent=2)
        return Response(flights, status=status.HTTP_200_OK)
