import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { fetchJson } from '../api/http.js';
import { API_BASE } from '../api/base.js';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, reload } = useAuth();

  const plans = [
    {
      name: 'Free Trial',
      price: 0,
      credits: 100,
      period: 'one-time',
      features: [
        '100 free credits on signup',
        'Resume upload & analysis (free)',
        'Smart question generation',
        'Instant feedback analysis',
        'Basic chatbot access'
      ],
      cta: isAuthenticated ? 'Current Plan' : 'Get Started',
      highlight: false
    },
    {
      name: 'Credit Pack - Small',
      price: 4.99,
      packageType: 'small',
      credits: 100,
      period: 'one-time',
      features: [
        '100 credits',
        'Never expires',
        'Use for chatbot interactions',
        'Resume bot questions',
        'Instant feedback'
      ],
      cta: 'Buy Credits',
      highlight: false
    },
    {
      name: 'Credit Pack - Medium',
      price: 19.99,
      packageType: 'medium',
      credits: 500,
      period: 'one-time',
      features: [
        '500 credits',
        '60% better value',
        'Never expires',
        'All chatbot features',
        'Priority support'
      ],
      cta: 'Buy Credits',
      highlight: true
    },
    {
      name: 'Credit Pack - Large',
      price: 39.99,
      packageType: 'large',
      credits: 1200,
      period: 'one-time',
      features: [
        '1200 credits (20% bonus)',
        'Best value',
        'Never expires',
        'All features included',
        'Premium support'
      ],
      cta: 'Buy Credits',
      highlight: false
    }
  ];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async (plan) => {
    if (plan.price === 0) return;
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    if (!plan.packageType) {
      alert('Invalid package selection.');
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load Razorpay. Please try again.');
      return;
    }

    try {
      const data = await fetchJson(`${API_BASE}/api/payments/razorpay/order`, {
        method: 'POST',
        body: { packageType: plan.packageType }
      }, { auth: 'required' });

      const options = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'HireMate',
        description: plan.name,
        order_id: data.order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: async (response) => {
          try {
            await fetchJson(`${API_BASE}/api/payments/razorpay/verify`, {
              method: 'POST',
              body: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                packageType: plan.packageType
              }
            }, { auth: 'required' });

            if (reload) await reload();
            alert('Payment successful! Credits added to your account.');
          } catch (err) {
            alert(err.message || 'Payment verification failed. Please contact support.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      alert(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-neutral-900 px-4 py-10">
      <main className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Simple, Credit-Based Pricing</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Pay only for what you use. Buy credits once, use them anytime. No subscriptions, no recurring charges.
          </p>
          {isAuthenticated && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-zinc-300 text-sm">Your balance:</span>
              <span className="text-white font-semibold text-lg">{user?.credits ?? 0} credits</span>
            </div>
          )}
        </div>

        {/* Free Features Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <h2 className="text-xl font-semibold text-white mb-3">✨ Always Free Features</h2>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-zinc-300">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Resume upload and analysis</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>View interview preparation tips</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Access to documentation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Basic profile management</span>
            </div>
          </div>
        </div>

        {/* Credit Usage Info */}
        <div className="mb-12 p-6 rounded-2xl bg-zinc-900/60 backdrop-blur border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">💳 What Costs Credits?</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-black/20 border border-white/10">
              <div className="text-indigo-400 font-semibold mb-1">Chatbot Messages</div>
              <div className="text-2xl font-bold text-white mb-1">1 credit</div>
              <div className="text-xs text-zinc-500">per AI response</div>
            </div>
            <div className="p-4 rounded-lg bg-black/20 border border-white/10">
              <div className="text-purple-400 font-semibold mb-1">Resume Bot Q&A</div>
              <div className="text-2xl font-bold text-white mb-1">2 credits</div>
              <div className="text-xs text-zinc-500">per question about your resume</div>
            </div>
            <div className="p-4 rounded-lg bg-black/20 border border-white/10">
              <div className="text-pink-400 font-semibold mb-1">Instant Feedback</div>
              <div className="text-2xl font-bold text-white mb-1">3 credits</div>
              <div className="text-xs text-zinc-500">per answer analysis</div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-indigo-500/20 to-purple-500/20 border-2 border-indigo-500/50'
                  : 'bg-zinc-900/60 border border-white/10'
              } backdrop-blur`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                  BEST VALUE
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                {plan.period !== 'one-time' && (
                  <span className="text-zinc-400 text-sm ml-1">/{plan.period}</span>
                )}
              </div>

              <div className="mb-6 p-3 rounded-lg bg-black/20 border border-white/10">
                <div className="text-2xl font-bold text-indigo-400">{plan.credits}</div>
                <div className="text-xs text-zinc-400">credits</div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={plan.price === 0 && isAuthenticated}
                className={`w-full py-2.5 rounded-lg font-medium transition ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
                    : 'bg-white/10 text-white hover:bg-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {plan.price === 0 && isAuthenticated ? 'Current Plan' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="p-4 rounded-lg bg-zinc-900/60 border border-white/10">
              <summary className="font-medium text-white cursor-pointer">Do credits expire?</summary>
              <p className="mt-2 text-sm text-zinc-400">No! Your purchased credits never expire. Use them whenever you need them.</p>
            </details>
            <details className="p-4 rounded-lg bg-zinc-900/60 border border-white/10">
              <summary className="font-medium text-white cursor-pointer">Can I get a refund?</summary>
              <p className="mt-2 text-sm text-zinc-400">Unused credits can be refunded within 30 days of purchase. Contact support for assistance.</p>
            </details>
            <details className="p-4 rounded-lg bg-zinc-900/60 border border-white/10">
              <summary className="font-medium text-white cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-sm text-zinc-400">We accept all major credit cards, debit cards, and digital wallets through Stripe.</p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to={isAuthenticated ? '/' : '/register'}
            className="inline-block px-8 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
          >
            {isAuthenticated ? 'Back to Home' : 'Get Started Free'}
          </Link>
        </div>
      </main>
    </div>
  );
}
