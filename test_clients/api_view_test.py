import requests


def post_test(endpoint):
    print("*"*30)
    print("POST TEST")
    print("*"*30)
    get_response = requests.post(endpoint, json={
                                    "departure_id": "SFO",
                                    "arrival_id": "SEA",
                                    "gl": "us",
                                    "hl": "en",
                                    "type": 1,
                                    "outbound_date": "2025-10-25T09:30:00Z",
                                    "return_date": "2025-10-30T14:45:00Z",
                                    "travel_class": 1,
                                    "exclude_basic": False,
                                    "deep_search": True
                                    })

    print(get_response.json())
    print("")


def get_test(endpoint):
    print("*"*30)
    print("GET TEST")
    print("*"*30)
    get_response = requests.get(endpoint)
    print(get_response.json())
    print("")


if __name__ == "__main__":
    endpoint = "http://django-api-env.eba-q3jh5v2m.us-east-1.elasticbeanstalk.com/api-home/"
    #post_test(endpoint)
    get_test(endpoint)
