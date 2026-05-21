"""
USSD URL patterns for Beem integration.
"""
from django.urls import path
from .views import USSDCallbackView, USSDBalanceCheckView

urlpatterns = [
    # Main USSD callback endpoint for Beem USSD Hub
    path('callback/', USSDCallbackView.as_view(), name='ussd-callback'),
    
    # Balance check endpoint (admin only)
    path('balance/', USSDBalanceCheckView.as_view(), name='ussd-balance'),
]
