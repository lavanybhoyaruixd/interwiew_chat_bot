/* eslint-env node */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const logger = require('../utils/logger');
const createStripe = require('stripe');

// Initialize Stripe with safe mock fallback in development when key is missing
let stripe;
if (!process.env.STRIPE_SECRET_KEY) {
  logger.warn('STRIPE_SECRET_KEY is missing; paymentService running in MOCK mode');
  const genId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  stripe = {
    customers: {
      create: async ({ email, name, metadata }) => ({ id: genId('cus'), email, name, metadata })
    },
    subscriptions: {
  create: async ({ customer, items, payment_behavior, expand, metadata }) => ({
        id: genId('sub'),
        status: 'active',
        latest_invoice: { payment_intent: { client_secret: 'mock_client_secret' } },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        metadata: metadata || {}
      }),
      retrieve: async (id) => ({
        id,
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        metadata: {}
      }),
      del: async (id) => ({ id, status: 'canceled' })
    },
    paymentIntents: {
      create: async ({ amount, currency, customer, metadata, description }) => ({
        id: genId('pi'),
        client_secret: 'mock_client_secret',
        status: 'succeeded'
      })
    },
    webhooks: {
  constructEvent: (body /* raw */, signature, secret) => {
        try {
          return typeof body === 'string' ? JSON.parse(body) : body;
        } catch {
          return { type: 'mock.event', data: { object: { metadata: {} } } };
        }
      }
    }
  };
} else {
  stripe = createStripe(process.env.STRIPE_SECRET_KEY);
}
const User = require('../models/User');

class PaymentService {
  constructor() {
    this.plans = {
      free: {
        name: 'Free Plan',
        credits: 100,
        price: 0,
        features: ['Basic questions', 'Limited feedback']
      },
      premium: {
        name: 'Premium Plan',
        credits: 1000,
        price: 1999, // $19.99 in cents
        priceId: 'price_premium_monthly', // Replace with actual Stripe price ID
        features: ['Advanced questions', 'Detailed feedback', 'Resume analysis', 'Performance analytics']
      },
      enterprise: {
        name: 'Enterprise Plan',
        credits: 5000,
        price: 4999, // $49.99 in cents
        priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
        features: ['Unlimited questions', 'Premium feedback', 'Custom questions', 'Team analytics']
      }
    };

    this.creditPackages = {
      small: { credits: 100, price: 499, name: '100 Credits' }, // $4.99
      medium: { credits: 500, price: 1999, name: '500 Credits' }, // $19.99
      large: { credits: 1200, price: 3999, name: '1200 Credits' } // $39.99 (20% bonus)
    };
  }

  // Create Stripe customer
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      logger.info(`Created Stripe customer: ${customer.id} for user: ${user._id}`);
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  // Create subscription
  async createSubscription(userId, planType) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = this.plans[planType];
      if (!plan || planType === 'free') {
        throw new Error('Invalid plan type');
      }

      // Create customer if doesn't exist
      let customerId = user.subscription.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
        user.subscription.stripeCustomerId = customerId;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: plan.priceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: userId,
          planType: planType
        }
      });

      // Update user subscription info
      user.subscription.stripeSubscriptionId = subscription.id;
      user.subscription.type = planType;
      user.subscription.status = subscription.status;
      user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      
      await user.save();

      logger.info(`Created subscription: ${subscription.id} for user: ${userId}`);

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Create payment intent for credit purchase
  async createCreditPayment(userId, packageType) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const creditPackage = this.creditPackages[packageType];
      if (!creditPackage) {
        throw new Error('Invalid credit package');
      }

      // Create customer if doesn't exist
      let customerId = user.subscription.stripeCustomerId;
      if (!customerId) {
        const customer = await this.createCustomer(user);
        customerId = customer.id;
        user.subscription.stripeCustomerId = customerId;
        await user.save();
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: creditPackage.price,
        currency: 'usd',
        customer: customerId,
        metadata: {
          userId: userId,
          type: 'credit_purchase',
          packageType: packageType,
          credits: creditPackage.credits
        },
        description: `Purchase ${creditPackage.name} for HireMate`
      });

      logger.info(`Created payment intent: ${paymentIntent.id} for user: ${userId}`);

      return {
        clientSecret: paymentIntent.client_secret,
        amount: creditPackage.price,
        credits: creditPackage.credits
      };
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Handle successful payment
  async handleSuccessfulPayment(paymentIntent) {
    try {
      const { userId, type, packageType, credits } = paymentIntent.metadata;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (type === 'credit_purchase') {
        // Add credits to user account
        await user.addCredits(parseInt(credits));
        logger.info(`Added ${credits} credits to user: ${userId}`);
      }

      // You can add more payment types here (subscription payments, etc.)

      return { success: true };
    } catch (error) {
      logger.error('Error handling successful payment:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      logger.info(`Received Stripe webhook: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handleSuccessfulPayment(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleSubscriptionPayment(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      logger.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle subscription payment success
  async handleSubscriptionPayment(invoice) {
    try {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const userId = subscription.metadata.userId;
      const planType = subscription.metadata.planType;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const plan = this.plans[planType];
      if (plan) {
        // Add monthly credits
        await user.addCredits(plan.credits);
        
        // Update subscription status
        user.subscription.status = subscription.status;
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();

        logger.info(`Added ${plan.credits} credits to user: ${userId} for subscription payment`);
      }
    } catch (error) {
      logger.error('Error handling subscription payment:', error);
    }
  }

  // Handle subscription updates
  async handleSubscriptionUpdate(subscription) {
    try {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);

      if (user) {
        user.subscription.status = subscription.status;
        user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        await user.save();

        logger.info(`Updated subscription for user: ${userId}`);
      }
    } catch (error) {
      logger.error('Error handling subscription update:', error);
    }
  }

  // Handle subscription cancellation
  async handleSubscriptionCancellation(subscription) {
    try {
      const userId = subscription.metadata.userId;
      const user = await User.findById(userId);

      if (user) {
        user.subscription.type = 'free';
        user.subscription.status = 'canceled';
        user.subscription.stripeSubscriptionId = null;
        await user.save();

        logger.info(`Canceled subscription for user: ${userId}`);
      }
    } catch (error) {
      logger.error('Error handling subscription cancellation:', error);
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.subscription.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);

      user.subscription.type = 'free';
      user.subscription.status = 'canceled';
      user.subscription.stripeSubscriptionId = null;
      await user.save();

      logger.info(`Canceled subscription for user: ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Get available plans
  getPlans() {
    return this.plans;
  }

  // Get credit packages
  getCreditPackages() {
    return this.creditPackages;
  }

  // Get user's billing info
  async getBillingInfo(userId) {
    try {
      const user = await User.findById(userId).select('subscription credits');
      if (!user) {
        throw new Error('User not found');
      }

      let subscriptionDetails = null;
      if (user.subscription.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(
          user.subscription.stripeSubscriptionId
        );
        subscriptionDetails = {
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        };
      }

      return {
        credits: user.credits,
        subscription: {
          type: user.subscription.type,
          status: user.subscription.status,
          details: subscriptionDetails
        },
        availablePlans: this.plans,
        creditPackages: this.creditPackages
      };
    } catch (error) {
      logger.error('Error getting billing info:', error);
      throw new Error('Failed to get billing information');
    }
  }
}

module.exports = new PaymentService();
