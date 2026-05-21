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
            'payment_reference': transaction.payment_reference,
            'amount': str(transaction.amount),
            'message': 'Payment initiated. Please complete payment on your mobile phone.'
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
from users.views import IsSuperAdmin


class AdminTransactionListView(generics.ListAPIView):
    """List all transactions (super admin only)."""
    serializer_class = TransactionSerializer
    permission_classes = [IsSuperAdmin]
    
    def get_queryset(self):
        queryset = Transaction.objects.all()
        
        university_id = self.request.query_params.get('university_id')
        if university_id:
            queryset = queryset.filter(user__university_id=university_id)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('user', 'subscription')


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
