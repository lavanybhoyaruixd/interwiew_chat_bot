const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  validateCreatePayment,
  validateCreateSubscription
} = require('../middleware/validation');
const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/payments/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  try {
    const plans = paymentService.getPlans();
    const creditPackages = paymentService.getCreditPackages();

    res.json({
      success: true,
      plans,
      creditPackages
    });
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get plans'
    });
  }
});

// @route   POST /api/payments/create-subscription
// @desc    Create a new subscription
// @access  Private
router.post('/create-subscription', authenticate, validateCreateSubscription, async (req, res) => {
  try {
    const { planType } = req.body;
    const userId = req.user.id;

    const subscription = await paymentService.createSubscription(userId, planType);

    logger.info(`Subscription creation initiated for user: ${userId}, plan: ${planType}`);

    res.json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });

  } catch (error) {
    logger.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subscription'
    });
  }
});

// @route   POST /api/payments/create-payment
// @desc    Create payment intent for credit purchase
// @access  Private
router.post('/create-payment', authenticate, validateCreatePayment, async (req, res) => {
  try {
    const { packageType } = req.body;
    const userId = req.user.id;

    const payment = await paymentService.createCreditPayment(userId, packageType);

    logger.info(`Credit payment initiated for user: ${userId}, package: ${packageType}`);

    res.json({
      success: true,
      message: 'Payment intent created successfully',
      payment
    });

  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment'
    });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel user's subscription
// @access  Private
router.post('/cancel-subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await paymentService.cancelSubscription(userId);

    logger.info(`Subscription canceled for user: ${userId}`);

    res.json({
      success: true,
      message: 'Subscription canceled successfully',
      result
    });

  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel subscription'
    });
  }
});

// @route   GET /api/payments/billing
// @desc    Get user's billing information
// @access  Private
router.get('/billing', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const billingInfo = await paymentService.getBillingInfo(userId);

    res.json({
      success: true,
      billing: billingInfo
    });

  } catch (error) {
    logger.error('Get billing info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get billing information'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but secured with Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const body = req.body;

    if (!signature) {
      logger.warn('Webhook received without signature');
      return res.status(400).json({
        success: false,
        message: 'No signature provided'
      });
    }

    const result = await paymentService.handleWebhook(body, signature);

    logger.info('Webhook processed successfully');

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      result
    });

  } catch (error) {
    logger.error('Webhook processing error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get user's payment history
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // This would typically fetch from a payments collection
    // For now, return empty array as placeholder
    const payments = [];

    res.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    });

  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history'
    });
  }
});

// @route   POST /api/payments/update-payment-method
// @desc    Update user's payment method
// @access  Private
router.post('/update-payment-method', authenticate, async (req, res) => {
  try {
    // This would typically handle payment method updates
    // Implementation depends on specific Stripe setup
    
    res.json({
      success: true,
      message: 'Payment method update functionality not implemented yet'
    });

  } catch (error) {
    logger.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method'
    });
  }
});

module.exports = router;
