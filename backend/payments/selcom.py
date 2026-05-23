"""
Selcom Payment Integration for Chakula Poa.

This module provides integration with Selcom payment gateway for processing
mobile money payments (M-Pesa, Airtel Money, Halopesa, etc.) and bank transfers.

IMPORTANT: This is prepared for future implementation. 
Uncomment and configure when ready to integrate with Selcom API.

Selcom API Documentation: https://developers.selcom.net/
"""

import hashlib
import hmac
import json
import base64
from datetime import datetime
from decimal import Decimal

# TODO: Install required packages
# pip install requests cryptography

# Configuration - Move to Django settings in production
SELCOM_CONFIG = {
    'api_key': '',  # Set in environment: SELCOM_API_KEY
    'api_secret': '',  # Set in environment: SELCOM_API_SECRET
    'vendor_id': '',  # Set in environment: SELCOM_VENDOR_ID
    'base_url': 'https://apigw.selcom.net/v1',  # Production URL
    'test_url': 'https://apigw-sandbox.selcom.net/v1',  # Sandbox URL
    'is_test_mode': True,  # Set to False in production
}


class SelcomPaymentMethod:
    """Payment method constants."""
    MPESA = 'MPESA'
    AIRTEL_MONEY = 'AIRTELMONEY'
    HALOPESA = 'HALOPESA'
    TIGOPESA = 'TIGOPESA'
    MIX_BY_YAS = 'MIXBYYAS'  # Check Selcom docs for exact code


# ============================================================================
# TODO: SELCOM INTEGRATION - UNCOMMENT WHEN READY TO IMPLEMENT
# ============================================================================

# import requests
# from django.conf import settings
#
#
# class SelcomPayment:
#     """
#     Selcom Payment Gateway Integration.
#     
#     Handles mobile money payments and bank transfers for Chakula Poa.
#     """
#     
#     def __init__(self):
#         self.api_key = getattr(settings, 'SELCOM_API_KEY', SELCOM_CONFIG['api_key'])
#         self.api_secret = getattr(settings, 'SELCOM_API_SECRET', SELCOM_CONFIG['api_secret'])
#         self.vendor_id = getattr(settings, 'SELCOM_VENDOR_ID', SELCOM_CONFIG['vendor_id'])
#         self.is_test = getattr(settings, 'SELCOM_TEST_MODE', SELCOM_CONFIG['is_test_mode'])
#         
#         self.base_url = SELCOM_CONFIG['test_url'] if self.is_test else SELCOM_CONFIG['base_url']
#     
#     def _generate_signature(self, data: dict) -> str:
#         """Generate HMAC signature for request authentication."""
#         # Sort the data by keys and create the string to sign
#         sorted_data = sorted(data.items())
#         sign_string = '&'.join([f"{k}={v}" for k, v in sorted_data])
#         
#         # Create HMAC-SHA256 signature
#         signature = hmac.new(
#             self.api_secret.encode('utf-8'),
#             sign_string.encode('utf-8'),
#             hashlib.sha256
#         ).digest()
#         
#         return base64.b64encode(signature).decode('utf-8')
#     
#     def _get_headers(self, data: dict) -> dict:
#         """Get request headers with authentication."""
#         timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
#         
#         return {
#             'Content-Type': 'application/json',
#             'Authorization': f'SELCOM {self.api_key}',
#             'Digest-Method': 'HS256',
#             'Digest': self._generate_signature(data),
#             'Timestamp': timestamp,
#         }
#     
#     def initiate_payment(
#         self, 
#         amount: Decimal, 
#         phone_number: str, 
#         payment_method: str,
#         order_id: str,
#         buyer_name: str = '',
#         buyer_email: str = '',
#         callback_url: str = ''
#     ) -> dict:
#         """
#         Initiate a mobile money payment.
#         
#         Args:
#             amount: Payment amount in TZS
#             phone_number: Customer's phone number (format: 255XXXXXXXXX)
#             payment_method: One of SelcomPaymentMethod constants
#             order_id: Unique order/transaction reference
#             buyer_name: Customer name
#             buyer_email: Customer email
#             callback_url: URL for payment status callbacks
#         
#         Returns:
#             dict with payment initiation response
#         """
#         # Normalize phone number to international format
#         phone = self._normalize_phone(phone_number)
#         
#         data = {
#             'vendor': self.vendor_id,
#             'order_id': order_id,
#             'buyer_email': buyer_email,
#             'buyer_name': buyer_name,
#             'buyer_phone': phone,
#             'amount': str(amount),
#             'currency': 'TZS',
#             'payment_methods': payment_method,
#             'webhook': callback_url or f"{settings.SITE_URL}/api/payments/selcom-callback/",
#             'no_of_items': 1,
#         }
#         
#         try:
#             response = requests.post(
#                 f"{self.base_url}/checkout/create-order-minimal",
#                 json=data,
#                 headers=self._get_headers(data),
#                 timeout=30
#             )
#             response.raise_for_status()
#             return response.json()
#         except requests.RequestException as e:
#             return {
#                 'result': 'FAIL',
#                 'message': str(e),
#                 'error': True
#             }
#     
#     def check_payment_status(self, order_id: str) -> dict:
#         """
#         Check the status of a payment.
#         
#         Args:
#             order_id: The order/transaction reference
#         
#         Returns:
#             dict with payment status
#         """
#         data = {
#             'vendor': self.vendor_id,
#             'order_id': order_id,
#         }
#         
#         try:
#             response = requests.get(
#                 f"{self.base_url}/checkout/order-status",
#                 params=data,
#                 headers=self._get_headers(data),
#                 timeout=30
#             )
#             response.raise_for_status()
#             return response.json()
#         except requests.RequestException as e:
#             return {
#                 'result': 'FAIL',
#                 'message': str(e),
#                 'error': True
#             }
#     
#     def process_callback(self, callback_data: dict) -> dict:
#         """
#         Process payment callback from Selcom.
#         
#         Args:
#             callback_data: Data received from Selcom webhook
#         
#         Returns:
#             dict with processed payment info
#         """
#         # Extract relevant fields
#         order_id = callback_data.get('order_id')
#         transid = callback_data.get('transid')
#         payment_status = callback_data.get('payment_status')
#         reference = callback_data.get('reference')
#         
#         return {
#             'order_id': order_id,
#             'transaction_id': transid,
#             'status': payment_status,
#             'reference': reference,
#             'is_successful': payment_status == 'COMPLETED',
#             'raw_data': callback_data
#         }
#     
#     def _normalize_phone(self, phone: str) -> str:
#         """Normalize phone number to 255XXXXXXXXX format."""
#         # Remove any non-digit characters
#         phone = ''.join(filter(str.isdigit, phone))
#         
#         # Handle different formats
#         if phone.startswith('0'):
#             phone = '255' + phone[1:]
#         elif phone.startswith('+255'):
#             phone = phone[1:]
#         elif not phone.startswith('255'):
#             phone = '255' + phone
#         
#         return phone
#     
#     def initiate_payout(
#         self,
#         amount: Decimal,
#         recipient_phone: str,
#         payment_method: str,
#         reference: str,
#         description: str = ''
#     ) -> dict:
#         """
#         Initiate a payout to restaurant.
#         
#         Args:
#             amount: Payout amount in TZS
#             recipient_phone: Restaurant's phone number
#             payment_method: Payment method for payout
#             reference: Unique payout reference
#             description: Payout description
#         
#         Returns:
#             dict with payout response
#         """
#         phone = self._normalize_phone(recipient_phone)
#         
#         data = {
#             'vendor': self.vendor_id,
#             'transid': reference,
#             'utilityref': phone,
#             'amount': str(amount),
#             'utilitycode': self._get_utility_code(payment_method),
#             'remarks': description or 'Chakula Poa Restaurant Payout',
#         }
#         
#         try:
#             response = requests.post(
#                 f"{self.base_url}/utility/pay",
#                 json=data,
#                 headers=self._get_headers(data),
#                 timeout=30
#             )
#             response.raise_for_status()
#             return response.json()
#         except requests.RequestException as e:
#             return {
#                 'result': 'FAIL',
#                 'message': str(e),
#                 'error': True
#             }
#     
#     def _get_utility_code(self, payment_method: str) -> str:
#         """Get Selcom utility code for payment method."""
#         # These codes are examples - verify with Selcom documentation
#         codes = {
#             'mpesa': 'MPESA',
#             'airtel_money': 'AIRTELMONEY', 
#             'halopesa': 'HALOPESA',
#             'tigopesa': 'TIGOPESA',
#         }
#         return codes.get(payment_method.lower(), 'MPESA')


# ============================================================================
# MOCK IMPLEMENTATION FOR TESTING
# Use this during development before Selcom integration is complete
# ============================================================================

class MockSelcomPayment:
    """
    Mock Selcom payment for testing purposes.
    Simulates payment flow without actual API calls.
    """
    
    def initiate_payment(
        self, 
        amount, 
        phone_number, 
        payment_method,
        order_id,
        **kwargs
    ):
        """Simulate payment initiation."""
        return {
            'result': 'SUCCESS',
            'message': 'Payment initiated successfully (MOCK)',
            'order_id': order_id,
            'reference': f'MOCK-{order_id}',
            'gateway_buyer_uuid': 'mock-uuid-12345',
            'payment_status': 'PENDING',
        }
    
    def check_payment_status(self, order_id):
        """Simulate payment status check."""
        return {
            'result': 'SUCCESS',
            'order_id': order_id,
            'payment_status': 'COMPLETED',  # Always return completed for testing
            'transid': f'MOCK-TRANS-{order_id}',
            'reference': f'MOCK-REF-{order_id}',
        }
    
    def process_callback(self, callback_data):
        """Process mock callback."""
        return {
            'order_id': callback_data.get('order_id'),
            'transaction_id': 'MOCK-TRANS-123',
            'status': 'COMPLETED',
            'reference': 'MOCK-REF-123',
            'is_successful': True,
            'raw_data': callback_data
        }
    
    def initiate_payout(self, amount, recipient_phone, payment_method, reference, **kwargs):
        """Simulate payout initiation."""
        return {
            'result': 'SUCCESS',
            'message': 'Payout initiated successfully (MOCK)',
            'transid': reference,
            'reference': f'MOCK-PAYOUT-{reference}',
        }


# Export the appropriate class based on configuration
def get_payment_handler():
    """
    Get the appropriate payment handler.
    Returns MockSelcomPayment for testing, SelcomPayment for production.
    """
    if SELCOM_CONFIG['is_test_mode']:
        return MockSelcomPayment()
    
    # TODO: Uncomment when SelcomPayment is implemented
    # return SelcomPayment()
    
    return MockSelcomPayment()  # Default to mock for now
