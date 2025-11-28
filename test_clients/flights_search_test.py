import requests
import json


def get_test(endpoint):
    print("*"*30)
    print("FLIGHTS SEARCH GET TEST")
    print("*"*30)
    get_response = requests.get(endpoint, params={
        "departure_id": "SFO",
        "arrival_id": "MIA",
        #"gl": "us",
        "hl": "en",
        "type": 2,
        "outbound_date": "2025-12-19",
        #"return_date": "2025-12-19",
        "travel_class": 3,
        #"exclude_basic": False,
        "currency": "USD",
    })
    data = get_response.json()
    print(data)


if __name__ == "__main__":
    endpoint = "http://routefinder-https-env.us-east-1.elasticbeanstalk.com/flights/search"
    #endpoint = 'http://0.0.0.0:8000/flights/search'
    #post_test(endpoint)
    get_test(endpoint)

