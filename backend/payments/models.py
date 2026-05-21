"""
Payment/Transaction models for Chakula Poa.
"""
import uuid
from django.db import models
from django.conf import settings


class Transaction(models.Model):
    """Transaction model for payments."""
    
    PAYMENT_METHOD_CHOICES = [
        ('mpesa', 'M-Pesa'),
        ('airtel_money', 'Airtel Money'),
        ('halopesa', 'Halopesa'),
        ('mix_by_yas', 'Mix by Yas'),
        ('tigopesa', 'Tigo Pesa'),
        ('bank_transfer', 'Bank Transfer'),
        ('selcom', 'Selcom'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions'
    )
    
    # Restaurant receiving payment
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='transactions',
        help_text="Restaurant receiving this payment"
    )
    
    # Payment amounts
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Total amount paid by user
    currency = models.CharField(max_length=3, default='TZS')
    
    # Payment split - platform takes percentage, restaurant gets rest
    platform_fee_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=10.00,
        help_text="Platform fee percentage (e.g., 10.00 for 10%)"
    )
    platform_fee_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Amount going to platform"
    )
    restaurant_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Amount going to restaurant after platform fee"
    )
    
    # Payment method and references
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payer_phone = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        help_text="Phone number used for mobile money payment"
    )
    payment_reference = models.CharField(max_length=100, unique=True)
    external_reference = models.CharField(max_length=100, blank=True, null=True)
    
    # Payout tracking
    restaurant_payout_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending',
        help_text="Status of payout to restaurant"
    )
    restaurant_payout_reference = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        help_text="Reference for payout to restaurant"
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - TZS {self.amount} ({self.status})"
    
    def mark_completed(self, external_reference=None):
        """Mark transaction as completed."""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        if external_reference:
            self.external_reference = external_reference
        self.save()
        
        # Activate subscription if pending
        if self.subscription and self.subscription.status == 'pending':
            self.subscription.activate()
    
    @classmethod
    def generate_reference(cls):
        """Generate unique payment reference."""
        import random
        import string
        prefix = 'CPS'
        random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        return f"{prefix}{random_part}"
    
    def calculate_split(self):
        """Calculate and set the payment split between platform and restaurant."""
        from decimal import Decimal
        
        platform_fee = (self.amount * self.platform_fee_percentage) / Decimal('100')
        restaurant_share = self.amount - platform_fee
        
        self.platform_fee_amount = platform_fee
        self.restaurant_amount = restaurant_share
        self.save(update_fields=['platform_fee_amount', 'restaurant_amount'])
        
        return {
            'total': self.amount,
            'platform_fee': platform_fee,
            'restaurant_share': restaurant_share
        }


class SystemSettings(models.Model):
    """System-wide settings including platform fee configuration."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Setting'
        verbose_name_plural = 'System Settings'
    
    def __str__(self):
        return self.key
    
    @classmethod
    def get_platform_fee_percentage(cls):
        """Get the current platform fee percentage."""
        try:
            setting = cls.objects.get(key='platform_fee_percentage')
            return setting.value.get('percentage', 10.0)
        except cls.DoesNotExist:
            return 10.0  # Default 10%
    
    @classmethod
    def set_platform_fee_percentage(cls, percentage):
        """Set the platform fee percentage."""
        setting, created = cls.objects.update_or_create(
            key='platform_fee_percentage',
            defaults={
                'value': {'percentage': percentage},
                'description': 'Platform fee percentage deducted from each payment'
            }
        )
        return setting
