import requests


def get_test(endpoint):
    print("*"*30)
    print("FLIGHTS SEARCH GET TEST")
    print("*"*30)
    get_response = requests.get(endpoint, params={
        "departure_id": "SFO",
        "arrival_id": "SEA",
        "gl": "us",
        "hl": "en",
        "type": 1,
        "outbound_date": "2025-11-25",
        "return_date": "2025-11-29",
        "travel_class": 1,
        "exclude_basic": False,
        "deep_search": True
    })
    print(get_response.json())
    print("")


if __name__ == "__main__":
    endpoint = "http://django-api-env.eba-q3jh5v2m.us-east-1.elasticbeanstalk.com/api/flights/search/"
    #post_test(endpoint)
    get_test(endpoint)

