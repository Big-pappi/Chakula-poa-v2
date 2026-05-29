"""
Views for Payment management.
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer, InitiatePaymentSerializer


class InitiatePaymentView(generics.CreateAPIView):
    """Initiate a payment."""
    serializer_class = InitiatePaymentSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        
        return Response({
            'order_id': str(transaction.id),
            'reference': transaction.payment_reference,
            'payment_reference': transaction.payment_reference,
            'subscription_id': str(transaction.subscription_id) if transaction.subscription_id else None,
            'amount': str(transaction.amount),
            'status': transaction.status,
            'payment_status': transaction.status,
            'message': 'Payment completed successfully (trial mode).'
        }, status=status.HTTP_201_CREATED)


class PaymentStatusView(APIView):
    """Check payment status."""
    
    def get(self, request, payment_id):
        try:
            transaction = Transaction.objects.get(id=payment_id, user=request.user)
            return Response({
                'status': transaction.status,
                'transaction_id': transaction.external_reference
            })
        except Transaction.DoesNotExist:
            return Response(
                {'detail': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class PaymentHistoryView(generics.ListAPIView):
    """Get user's payment history."""
    serializer_class = TransactionSerializer
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class PaymentCallbackView(APIView):
    """Webhook for payment provider callbacks."""
    permission_classes = []  # Allow unauthenticated webhook calls
    
    def post(self, request):
        # This would be called by M-Pesa/Airtel Money after payment
        # Implement based on your payment provider's specification
        
        reference = request.data.get('reference')
        status_code = request.data.get('status')
        external_reference = request.data.get('transaction_id')
        
        try:
            transaction = Transaction.objects.get(payment_reference=reference)
            
            if status_code == 'success':
                transaction.mark_completed(external_reference)
                return Response({'message': 'Payment processed successfully'})
            else:
                transaction.status = 'failed'
                transaction.save()
                return Response({'message': 'Payment failed'})
                
        except Transaction.DoesNotExist:
            return Response(
                {'detail': 'Transaction not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Admin view for transactions
from users.views import IsSuperAdmin, IsAdminUser


class AdminTransactionListView(generics.ListAPIView):
    """
    List transactions for admins. Restaurant admins only see payments for
    their own restaurant; super admins see all payments.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Transaction.objects.all()

        # Restaurant admins are scoped to their own restaurant's payments
        if getattr(user, 'role', None) == 'admin' and getattr(user, 'restaurant_id', None):
            queryset = queryset.filter(restaurant_id=user.restaurant_id)

        # Optional explicit restaurant filter (super admin) - supports legacy param
        restaurant_id = (
            self.request.query_params.get('restaurant_id')
            or self.request.query_params.get('university_id')
        )
        if restaurant_id:
            queryset = queryset.filter(restaurant_id=restaurant_id)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('user', 'subscription', 'restaurant')


from .models import SystemSettings


class SystemSettingsListView(APIView):
    """Get all system settings (super admin only)."""
    permission_classes = [IsSuperAdmin]
    
    def get(self, request):
        settings = SystemSettings.objects.all()
        result = {}
        for setting in settings:
            result[setting.key] = setting.value
        return Response(result)


class SystemSettingDetailView(APIView):
    """Get or update a specific system setting (super admin only)."""
    permission_classes = [IsSuperAdmin]
    
    def get(self, request, key):
        try:
            setting = SystemSettings.objects.get(key=key)
            return Response({
                'key': setting.key,
                'value': setting.value,
                'description': setting.description
            })
        except SystemSettings.DoesNotExist:
            return Response(
                {'detail': 'Setting not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    def post(self, request, key):
        value = request.data.get('value')
        description = request.data.get('description', '')
        
        setting, created = SystemSettings.objects.update_or_create(
            key=key,
            defaults={
                'value': value,
                'description': description
            }
        )
        
        return Response({
            'key': setting.key,
            'value': setting.value,
            'message': 'Setting updated successfully'
        })


class MaintenanceModeView(APIView):
    """Public endpoint to check maintenance mode status."""
    permission_classes = []  # Allow unauthenticated access
    
    def get(self, request):
        try:
            setting = SystemSettings.objects.get(key='maintenance_mode')
            return Response({'maintenance_mode': setting.value})
        except SystemSettings.DoesNotExist:
            return Response({'maintenance_mode': False})
