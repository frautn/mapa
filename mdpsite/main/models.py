# main/models.py
from django.db import models
from django.core.validators import RegexValidator
from email.utils import parsedate_to_datetime
from django.core.exceptions import ValidationError
from django.utils import timezone

class Article(models.Model):
    """
    Usage when reading dates from JSON object:

    raw = obj["date"]  # "Thu, 13 Nov 2025 18:49:00 GMT"
    article.date = Article.parse_gnews_date(raw)
    """

    VALIDADO_VALIDO = "VALIDO"
    VALIDADO_NO_RELEVANTE = "NO RELEVANTE"
    VALIDADO_SIN_REVISAR = "SIN REVISAR"
    VALIDADO_CHOICES = [
        (VALIDADO_VALIDO, "VALIDO"),
        (VALIDADO_NO_RELEVANTE, "NO RELEVANTE"),
        (VALIDADO_SIN_REVISAR, "SIN REVISAR"),
    ]

    ID = models.CharField(max_length=100, primary_key=True)
    date = models.DateTimeField()
    GNews_title = models.CharField(max_length=500)
    Diffbot_title = models.CharField(max_length=500, blank=True)
    siteName = models.CharField(max_length=200)
    link = models.URLField(max_length=1000)
    validado = models.CharField(
        max_length=20,
        choices=VALIDADO_CHOICES,
        default=VALIDADO_SIN_REVISAR,
    )

    def __str__(self):
        return self.GNews_title

    @staticmethod
    def parse_gnews_date(raw_value: str):
        # Accepts strings like: "Thu, 13 Nov 2025 18:49:00 GMT"
        dt = parsedate_to_datetime(raw_value)
        if dt is None:
            raise ValidationError('Invalid date format. Expected RFC-2822/GMT style.')
        if timezone.is_naive(dt):
            dt = timezone.make_aware(dt, timezone.utc)
        return dt.astimezone(timezone.utc)

    def date_as_gmt_string(self) -> str:
        return self.date.astimezone(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
