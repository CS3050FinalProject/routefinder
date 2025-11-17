"""
Python script for cleaning database of old searches and flights.
old: object created >= 1 hour ago
"""
from api.searches.models import Search
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Deletes searches and related flights older than one hour'

    def handle(self, *args, **kwargs):
        one_hour_ago = timezone.now() - timedelta(hours=1)
        old_searches = Search.objects.filter(search_datetime__lt=one_hour_ago)

        # Delete old searches
        count, _ = old_searches.delete()

        self.stdout.write(self.style.SUCCESS(f'Deleted {count} old searches and related flights'))


