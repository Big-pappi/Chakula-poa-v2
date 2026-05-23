"""
USSD Views for Chakula Poa
Integrates with Beem USSD Hub API
Documentation: https://docs.beem.africa/ussd/

USSD Flow:
1. User dials USSD code (e.g., *123*456#)
2. Beem USSD Hub sends POST to our callback URL
3. We process and return menu/response
4. Repeat until session ends
"""
import logging
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone

from users.models import User
from subscriptions.models import Subscription
from meals.models import MealOrder

logger = logging.getLogger(__name__)


class USSDCallbackView(APIView):
    """
    USSD Callback endpoint for Beem USSD Hub.
    Receives USSD requests and returns appropriate responses.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """
        Handle USSD callback from Beem.
        
        Expected payload:
        {
            "command": "initiate" | "continue" | "terminate",
            "msisdn": "255762089337",
            "session_id": "4574",
            "operator": "vodacom" | "tigo" | "airtel" | "halotel" | "ttcl",
            "payload": {
                "request_id": 0,
                "response": "0" | "1" | "2" | etc.
            }
        }
        """
        try:
            data = request.data
            
            msisdn = data.get('msisdn', '')
            operator = data.get('operator', '')
            session_id = data.get('session_id', '')
            command = data.get('command', '').lower()
            payload = data.get('payload', {})
            user_response = str(payload.get('response', '0'))
            request_id = payload.get('request_id', 0)
            
            logger.info(f"USSD Request: msisdn={msisdn}, command={command}, response={user_response}")
            
            # Store session state (simple in-memory for now, use Redis in production)
            session_key = f"ussd_{session_id}"
            
            # Normalize phone number (remove +255 or 0 prefix, keep as 7xxx)
            phone_number = self._normalize_phone(msisdn)
            
            # Handle different stages of USSD menu
            if command == 'initiate' or user_response == '0':
                # Main menu
                return self._main_menu(msisdn, operator, session_id)
            
            elif user_response == '1':
                # Check Account Details
                return self._check_account(msisdn, operator, session_id, phone_number)
            
            elif user_response == '2':
                # Check Subscription Status
                return self._check_subscription(msisdn, operator, session_id, phone_number)
            
            elif user_response == '3':
                # Check Daily QR/CPS Code
                return self._check_daily_code(msisdn, operator, session_id, phone_number)
            
            elif user_response == '4':
                # Check Meals Today
                return self._check_meals_today(msisdn, operator, session_id, phone_number)
            
            elif user_response == '00':
                # Back to main menu
                return self._main_menu(msisdn, operator, session_id)
            
            else:
                # Invalid option
                return self._invalid_option(msisdn, operator, session_id)
                
        except Exception as e:
            logger.error(f"USSD Error: {str(e)}")
            return self._error_response(
                data.get('msisdn', ''),
                data.get('operator', ''),
                data.get('session_id', ''),
                "Samahani, tatizo limetokea. Jaribu tena baadaye."
            )
    
    def _normalize_phone(self, msisdn):
        """Normalize phone number to match database format."""
        phone = msisdn.replace('+', '').replace(' ', '')
        if phone.startswith('255'):
            phone = '0' + phone[3:]
        return phone
    
    def _main_menu(self, msisdn, operator, session_id):
        """Return main USSD menu."""
        menu = (
            "Karibu Chakula Poa!\n"
            "1. Angalia Akaunti\n"
            "2. Angalia Usajili\n"
            "3. Nambari ya Leo\n"
            "4. Milo ya Leo"
        )
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 1,
                'request': menu
            }
        })
    
    def _check_account(self, msisdn, operator, session_id, phone_number):
        """Check user account details."""
        try:
            user = User.objects.get(phone_number=phone_number, is_active=True)
            
            message = (
                f"Akaunti yako:\n"
                f"Jina: {user.full_name}\n"
                f"CPS: {user.cps_number}\n"
                f"Simu: {user.phone_number}\n\n"
                f"00. Rudi"
            )
        except User.DoesNotExist:
            message = (
                "Akaunti haijapatikana.\n"
                "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                "00. Rudi"
            )
        
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 2,
                'request': message
            }
        })
    
    def _check_subscription(self, msisdn, operator, session_id, phone_number):
        """Check user subscription status."""
        try:
            user = User.objects.get(phone_number=phone_number, is_active=True)
            subscription = Subscription.objects.filter(
                user=user,
                status='active',
                end_date__gte=timezone.now().date()
            ).first()
            
            if subscription:
                days_left = (subscription.end_date - timezone.now().date()).days
                message = (
                    f"Usajili wako:\n"
                    f"Mpango: {subscription.plan.name if subscription.plan else 'Standard'}\n"
                    f"Siku zimebaki: {days_left}\n"
                    f"Milo: {subscription.remaining_meals}\n"
                    f"Hadi: {subscription.end_date.strftime('%d/%m/%Y')}\n\n"
                    f"00. Rudi"
                )
            else:
                message = (
                    "Huna usajili hai.\n"
                    "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                    "00. Rudi"
                )
        except User.DoesNotExist:
            message = (
                "Akaunti haijapatikana.\n"
                "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                "00. Rudi"
            )
        
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 2,
                'request': message
            }
        })
    
    def _check_daily_code(self, msisdn, operator, session_id, phone_number):
        """Check user's daily QR/CPS code."""
        try:
            user = User.objects.get(phone_number=phone_number, is_active=True)
            
            # Check for active subscription first
            subscription = Subscription.objects.filter(
                user=user,
                status='active',
                end_date__gte=timezone.now().date()
            ).first()
            
            if subscription:
                # Get current code (regenerates if expired)
                current_code = user.get_current_code()
                message = (
                    f"Nambari yako ya Leo:\n\n"
                    f"{current_code}\n\n"
                    f"Tumia nambari hii kupata milo.\n"
                    f"Inabadilika kila siku usiku wa manane.\n\n"
                    f"00. Rudi"
                )
            else:
                message = (
                    "Huna usajili hai.\n"
                    "Unahitaji usajili kupata nambari.\n"
                    "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                    "00. Rudi"
                )
        except User.DoesNotExist:
            message = (
                "Akaunti haijapatikana.\n"
                "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                "00. Rudi"
            )
        
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 3,
                'request': message
            }
        })
    
    def _check_meals_today(self, msisdn, operator, session_id, phone_number):
        """Check today's meal orders."""
        try:
            user = User.objects.get(phone_number=phone_number, is_active=True)
            today = timezone.now().date()
            
            orders = MealOrder.objects.filter(
                user=user,
                order_date=today
            ).select_related('meal')
            
            if orders.exists():
                meal_list = []
                for order in orders:
                    status_sw = {
                        'pending': 'Inasubiri',
                        'confirmed': 'Imethibitishwa',
                        'served': 'Imetolewea',
                        'cancelled': 'Imefutwa'
                    }.get(order.status, order.status)
                    meal_list.append(f"- {order.meal.meal_type.title()}: {status_sw}")
                
                message = (
                    f"Milo yako ya Leo:\n\n"
                    f"{chr(10).join(meal_list)}\n\n"
                    f"00. Rudi"
                )
            else:
                message = (
                    "Huna milo ya leo.\n"
                    "Chagua milo kwenye app au website.\n\n"
                    "00. Rudi"
                )
        except User.DoesNotExist:
            message = (
                "Akaunti haijapatikana.\n"
                "Jiandikishe kwenye chakulapoa.co.tz\n\n"
                "00. Rudi"
            )
        
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 4,
                'request': message
            }
        })
    
    def _invalid_option(self, msisdn, operator, session_id):
        """Handle invalid menu option."""
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'continue',
            'payload': {
                'request_id': 0,
                'request': "Chaguo halipo.\n\n00. Rudi"
            }
        })
    
    def _error_response(self, msisdn, operator, session_id, message):
        """Return error response and terminate session."""
        return Response({
            'msisdn': msisdn,
            'operator': operator,
            'session_id': session_id,
            'command': 'terminate',
            'payload': {
                'request_id': 0,
                'request': message
            }
        })


class USSDBalanceCheckView(APIView):
    """
    Check Beem USSD Hub balance.
    Uses Basic Auth with api_key and secret_key.
    """
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        """Check USSD credit balance from Beem."""
        api_key = getattr(settings, 'BEEM_API_KEY', None)
        secret_key = getattr(settings, 'BEEM_SECRET_KEY', None)
        
        if not api_key or not secret_key:
            return Response(
                {'error': 'Beem API credentials not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            url = 'https://apitopup.beem.africa/v1/credit-balance?app_name=USSD'
            response = requests.get(
                url,
                auth=(api_key, secret_key),
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return Response({
                    'balance': data.get('data', {}).get('credit_bal', '0'),
                    'currency': 'TZS'
                })
            else:
                return Response(
                    {'error': 'Failed to fetch balance'},
                    status=response.status_code
                )
        except Exception as e:
            logger.error(f"USSD Balance Check Error: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
