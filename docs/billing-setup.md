# Billing Setup Guide

This guide explains how to set up billing for the AI Productivity App using Clerk's built-in billing features.

## Prerequisites

- Clerk account with billing features enabled
- Stripe account (or another payment provider supported by Clerk)

## Setup Steps

### 1. Configure Clerk Billing

1. Log in to your Clerk Dashboard
2. Go to **Billing** section
3. Connect your Stripe account
4. Configure your pricing plans:
   - **Free Plan**: Default plan with limits
   - **Pro Plan**: $9.99/month with unlimited features

### 2. Set Up Pricing Table

The pricing page uses Clerk's `<PricingTable />` component. To configure:

1. In Clerk Dashboard, go to **Billing > Pricing Tables**
2. Create a new pricing table
3. Add your plans with features:

**Free Plan Features:**
- ✓ Up to 50 tasks
- ✓ Up to 5 goals
- ✓ 3 AI tasks per day
- ✓ Basic categories

**Pro Plan Features:**
- ✓ Unlimited tasks
- ✓ Unlimited goals
- ✓ Unlimited AI features
- ✓ Advanced analytics
- ✓ Calendar sync
- ✓ Email notifications
- ✓ Webhook integrations
- ✓ Export to PDF/CSV

### 3. Configure Webhooks

1. In Clerk Dashboard, go to **Webhooks**
2. Create a new webhook endpoint:
   - URL: `https://your-domain.com/api/webhooks/clerk`
   - Events to subscribe:
     - `user.subscription.created`
     - `user.subscription.updated`
     - `user.subscription.deleted`

3. Copy the webhook secret and add to your `.env` file:
   ```
   CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### 4. Environment Variables

Add these to your `.env` file:

```bash
# Clerk API Keys (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Webhook Secret
CLERK_WEBHOOK_SECRET=whsec_...

# Internal API Secret (generate a secure random string)
INTERNAL_API_SECRET=your_secure_random_string
```

### 5. Database Setup

The billing system creates a `user_subscriptions` table to cache plan information locally. Run migrations:

```bash
docker compose exec backend alembic upgrade head
```

## Testing the Integration

### 1. Test Pricing Page
- Navigate to `/pricing`
- Verify the pricing table displays correctly
- Click on "Subscribe" for Pro plan

### 2. Test Webhook
Use Clerk's webhook testing tool:
1. Go to Webhooks in Clerk Dashboard
2. Select your webhook
3. Use "Test" feature to send sample events

### 3. Test Feature Gates
- Create a free account
- Try to use AI task creation more than 3 times
- Verify the upgrade prompt appears

### 4. Test Pro Features
- Upgrade to Pro plan
- Verify unlimited AI task creation
- Check that Pro badge appears in dashboard

## Production Checklist

- [ ] Update CORS settings in backend for production domain
- [ ] Set production webhook URL in Clerk
- [ ] Use production Stripe keys
- [ ] Set up proper monitoring for webhook failures
- [ ] Configure email notifications for subscription events
- [ ] Set up analytics to track conversion rates

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is correct
2. Verify webhook secret matches
3. Check backend logs for errors
4. Use ngrok for local testing

### Plan Status Not Updating
1. Check database for user_subscriptions record
2. Verify webhook is processing correctly
3. Check Clerk Dashboard for user's subscription status

### Feature Gates Not Working
1. Clear browser cache/localStorage
2. Check ProFeatureGate component implementation
3. Verify Clerk's `has()` method is working