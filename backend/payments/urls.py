"""
URL patterns for payments app.
"""
from django.urls import path
from .views import (
    InitiatePaymentView, PaymentStatusView,
    PaymentHistoryView, PaymentCallbackView,
    SystemSettingsListView, SystemSettingDetailView, MaintenanceModeView
)

urlpatterns = [
    path('initiate/', InitiatePaymentView.as_view(), name='payment-initiate'),
    path('<uuid:payment_id>/status/', PaymentStatusView.as_view(), name='payment-status'),
    path('history/', PaymentHistoryView.as_view(), name='payment-history'),
    path('callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    
    # System settings
    path('system-settings/', SystemSettingsListView.as_view(), name='system-settings-list'),
    path('system-settings/<str:key>/', SystemSettingDetailView.as_view(), name='system-setting-detail'),
    path('maintenance-status/', MaintenanceModeView.as_view(), name='maintenance-status'),
]
