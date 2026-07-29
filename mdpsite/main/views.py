# main/views.py
from django.shortcuts import render
from .models import Article

def home(request):
    return render(request, 'main/home.html')


def articles(request):
    return render(request, 'main/articles.html')


def import_export(request):
    return render(request, 'main/import_export.html')