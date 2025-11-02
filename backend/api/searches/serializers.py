from rest_framework import serializers
from .models import Search

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Search
        fields = [
            'search_id',
            'search_datetime',
        ]

    @staticmethod
    def save_search(data: dict) -> dict:
        """
        Save a single search to the database.
        Expects `data` as a dictionary with keys matching serializer fields.
        """
        serializer = SearchSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        created_obj = serializer.save()  # Saves and returns the model instance
        return {"created": True, "created_obj": created_obj}
