import requests


def get_test(endpoint):
    print("*"*30)
    print("FLIGHTS SEARCH GET TEST")
    print("*"*30)
    get_response = requests.get(endpoint, params={
        "departure_id": "PEK",
        "arrival_id": "AUS",
        #"gl": "us",
        "hl": "en",
        #"type": 1,
        "outbound_date": "2025-11-10",
        "return_date": "2025-11-16",
        #"travel_class": 1,
        #"exclude_basic": False,
        "currency": "USD",
        #"deep_search": False
    })
    print(get_response.json())
    print("")


if __name__ == "__main__":
    endpoint = "http://routefinder-api-rest-env.eba-sgpyhteq.us-east-1.elasticbeanstalk.com/flights/search/"
    #post_test(endpoint)
    get_test(endpoint)

