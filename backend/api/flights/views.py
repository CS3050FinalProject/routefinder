from rest_framework import generics
from .models import Flight
#from .serializers import FlightSerializer


class FlightDetailAPIView(generics.RetrieveAPIView):
    #queryset = Flight.objects.all()
    #serializer_class = FlightSerializer
    # lookup_field = 'pk'
    # Products.objects.get(pk=1)
    print("FlightDetailAPIView")
