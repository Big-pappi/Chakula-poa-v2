"""
URL patterns for admin endpoints.
"""
from django.urls import path
from .views import (
    AdminDashboardView, AdminUserListView,
    AdminStaffListView, AdminStaffDetailView,
    DemandReportView, RevenueReportView,
    SuperAdminUserListView, SuperAdminCreateAdminView,
    SuperAdminSystemStatsView, VerifyUserCodeView,
    SuperAdminResetPasswordView, SuperAdminUpdateUserView,
    AdminCustomerListView, AdminCustomerDetailView,
    AdminCustomerDeactivateView, AdminCustomerSubscriptionView
)
from meals.views import AdminMealListView, AdminMealDetailView
from restaurants.views import RestaurantAdminListView, RestaurantAdminDetailView
from payments.views import AdminTransactionListView
from subscriptions.views import AdminPlanListView, AdminPlanDetailView

urlpatterns = [
    # Admin Dashboard
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Users (previously students)
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    # Legacy alias for backwards compatibility
    path('students/', AdminUserListView.as_view(), name='admin-students'),
    
    # Verify user code
    path('verify-code/', VerifyUserCodeView.as_view(), name='verify-code'),
    
    # Staff
    path('staff/', AdminStaffListView.as_view(), name='admin-staff-list'),
    path('staff/<uuid:pk>/', AdminStaffDetailView.as_view(), name='admin-staff-detail'),
    
    # Customer Management (Admin - Restaurant Owner)
    path('customers/', AdminCustomerListView.as_view(), name='admin-customers'),
    path('customers/<uuid:pk>/', AdminCustomerDetailView.as_view(), name='admin-customer-detail'),
    path('customers/<uuid:pk>/deactivate/', AdminCustomerDeactivateView.as_view(), name='admin-customer-deactivate'),
    path('customers/<uuid:pk>/subscription/', AdminCustomerSubscriptionView.as_view(), name='admin-customer-subscription'),
    
    # Plans Management (Admin - Restaurant Owner)
    path('plans/', AdminPlanListView.as_view(), name='admin-plans-list'),
    path('plans/<uuid:pk>/', AdminPlanDetailView.as_view(), name='admin-plans-detail'),
    
    # Meals
    path('meals/', AdminMealListView.as_view(), name='admin-meals-list'),
    path('meals/<uuid:pk>/', AdminMealDetailView.as_view(), name='admin-meals-detail'),
    
    # Reports
    path('reports/demand/', DemandReportView.as_view(), name='demand-report'),
    path('reports/revenue/', RevenueReportView.as_view(), name='revenue-report'),
    
    # Super Admin - Restaurants (previously universities)
    path('restaurants/', RestaurantAdminListView.as_view(), name='admin-restaurants-list'),
    path('restaurants/<uuid:pk>/', RestaurantAdminDetailView.as_view(), name='admin-restaurants-detail'),
    # Legacy alias for backwards compatibility
    path('universities/', RestaurantAdminListView.as_view(), name='admin-universities-list'),
    path('universities/<uuid:pk>/', RestaurantAdminDetailView.as_view(), name='admin-universities-detail'),
    
    # Super Admin - System
    path('system/stats/', SuperAdminSystemStatsView.as_view(), name='super-admin-stats'),
    path('all-users/', SuperAdminUserListView.as_view(), name='super-admin-users'),
    path('admins/', SuperAdminCreateAdminView.as_view(), name='super-admin-create-admin'),
    
    # Super Admin - User Management
    path('users/<uuid:pk>/', SuperAdminUpdateUserView.as_view(), name='super-admin-user-detail'),
    path('users/<uuid:pk>/reset-password/', SuperAdminResetPasswordView.as_view(), name='super-admin-reset-password'),
    
    # Super Admin - Transactions
    path('transactions/', AdminTransactionListView.as_view(), name='admin-transactions'),
]
