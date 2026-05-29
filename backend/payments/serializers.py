"""
Serializers for Payment models.
"""
from rest_framework import serializers
from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Transaction serializer."""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    subscription_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'user', 'user_name', 'subscription', 'subscription_name',
            'amount', 'currency', 'payment_method', 'payment_reference',
            'external_reference', 'status', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'user', 'payment_reference', 'created_at', 'completed_at']


class InitiatePaymentSerializer(serializers.Serializer):
    """
    Serializer for initiating payment.

    Accepts either an existing pending `subscription_id` or a `plan_id`
    (in which case a pending subscription is created on the fly). All
    supported payment methods are allowed. Runs in TRIAL mode: the payment
    is auto-completed instead of calling a live payment gateway.
    """
    subscription_id = serializers.UUIDField(required=False)
    plan_id = serializers.UUIDField(required=False)
    payment_method = serializers.ChoiceField(choices=Transaction.PAYMENT_METHOD_CHOICES)
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True)
    # amount is accepted for compatibility but the server always trusts plan.price
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, attrs):
        if not attrs.get('subscription_id') and not attrs.get('plan_id'):
            raise serializers.ValidationError(
                "Either subscription_id or plan_id is required."
            )
        return attrs

    def validate_subscription_id(self, value):
        from subscriptions.models import Subscription
        if value:
            try:
                Subscription.objects.get(id=value)
            except Subscription.DoesNotExist:
                raise serializers.ValidationError("Subscription not found.")
        return value

    def validate_plan_id(self, value):
        from subscriptions.models import SubscriptionPlan
        if value:
            try:
                SubscriptionPlan.objects.get(id=value, is_active=True)
            except SubscriptionPlan.DoesNotExist:
                raise serializers.ValidationError("Invalid or inactive plan.")
        return value

    def create(self, validated_data):
        from subscriptions.models import Subscription, SubscriptionPlan
        from django.utils import timezone
        from datetime import timedelta

        user = self.context['request'].user

        # Resolve (or create) the subscription being paid for
        if validated_data.get('subscription_id'):
            subscription = Subscription.objects.get(id=validated_data['subscription_id'])
            plan = subscription.plan
        else:
            plan = SubscriptionPlan.objects.get(id=validated_data['plan_id'])
            subscription = Subscription.objects.create(
                user=user,
                plan=plan,
                start_date=timezone.now().date(),
                end_date=timezone.now().date() + timedelta(days=plan.duration_days),
                status='pending',
                remaining_meals=plan.meals_per_day * plan.duration_days,
            )

        # Create the transaction tied to the plan's restaurant so it reflects
        # to the correct restaurant admin.
        transaction = Transaction.objects.create(
            user=user,
            subscription=subscription,
            restaurant=plan.restaurant,
            amount=plan.price,
            payment_method=validated_data['payment_method'],
            payer_phone=validated_data.get('phone_number') or None,
            payment_reference=Transaction.generate_reference(),
            metadata={
                'phone_number': validated_data.get('phone_number'),
                'plan_name': plan.name,
                'trial': True,
            }
        )
        # Split the payment between platform and restaurant
        transaction.calculate_split()

        # TRIAL MODE: no live payment gateway. Auto-complete the payment which
        # activates the subscription and lets the restaurant admin see it.
        transaction.mark_completed()

        return transaction
