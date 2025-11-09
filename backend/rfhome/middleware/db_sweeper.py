"""
Python script for cleaning database of old searches and flights.
old: object created >= 1 hour ago
"""
import logging
from datetime import timedelta

from django.utils import timezone
from django.db import transaction

from api.searches.models import Search
from api.flights.models import Flight

logger = logging.getLogger(__name__)


class DbSweeperMiddleware:
    """
    Middleware that prunes Searches older than 1 hour and their Flights.
    Configure which request paths trigger pruning with settings.DB_SWEEPER_PATH_PREFIXES
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            # only run for configured prefixes (reduce overhead)
            from django.conf import settings

            prefixes = getattr(settings, "DB_SWEEPER_PATH_PREFIXES", ["/api", "/flights"])
            run_on_request = any(request.path.startswith(p) for p in prefixes)

            if run_on_request:
                self.sweep_old_searches()
        except Exception:
            logger.exception("DbSweeperMiddleware: sweep failed, continuing request")

        response = self.get_response(request)
        return response

    def sweep_old_searches(self):
        cutoff = timezone.now() - timedelta(hours=1)

        # detect timestamp field name on Search model
        if self._has_field(Search, "search_datetime"):
            timestamp_field = "search_datetime"
        elif self._has_field(Search, "created_at"):
            timestamp_field = "created_at"
        else:
            timestamp_field = "created_at"  # fallback

        filter_kw = {f"{timestamp_field}__lt": cutoff}
        old_qs = Search.objects.filter(**filter_kw)

        old_ids = list(old_qs.values_list("pk", flat=True))
        if not old_ids:
            return

        logger.info("DbSweeper: deleting %d old search(s) older than %s", len(old_ids), cutoff.isoformat())

        with transaction.atomic():
            # remove flights tied to those searches
            try:
                # try FK relationship first
                Flight.objects.filter(search__pk__in=old_ids).delete()
            except Exception:
                # fallback to search_id field
                Flight.objects.filter(search_id__in=old_ids).delete()

            # delete searches
            Search.objects.filter(pk__in=old_ids).delete()

        logger.info("DbSweeper: deleted searches %s", old_ids)

    @staticmethod
    def _has_field(model, field_name):
        try:
            model._meta.get_field(field_name)
            return True
        except Exception:
            return False

