import requests

def test_eb_homepage():
    url = "http://routefinder-env-lb.eba-egdm2f3j.us-east-1.elasticbeanstalk.com/"

    try:
        print(f"Requesting: {url}")
        response = requests.get(url, timeout=10)
        print("Status Code:", response.status_code)
        print("Response Body:", response.text[:300])
    except requests.exceptions.RequestException as e:
        print("Request failed:", e)

if __name__ == "__main__":
    test_eb_homepage()
