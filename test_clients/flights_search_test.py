import requests
import json


def get_test(endpoint):
    print("*"*30)
    print("FLIGHTS SEARCH GET TEST")
    print("*"*30)
    get_response = requests.get(endpoint, params={
        "departure_id": "ORD",
        "arrival_id": "MIA",
        #"gl": "us",
        "hl": "en",
        "type": 1,
        "outbound_date": "2025-12-15",
        "return_date": "2025-12-19",
        #"travel_class": 1,
        #"exclude_basic": False,
        "currency": "USD"
    })
    data = get_response.json()
    print(data)


if __name__ == "__main__":
    #endpoint = "http://routefinder-api-env-prod.eba-egdm2f3j.us-east-1.elasticbeanstalk.com/flights/search/"
    endpoint = 'http://127.0.0.1:8000/flights/search'
    #post_test(endpoint)
    get_test(endpoint)

