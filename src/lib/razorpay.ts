// Razorpay Live Gateway Configuration and Integration Helper
// Live Key ID configured from environment or fallback default

export const RAZORPAY_LIVE_KEY_ID = 
  ((import.meta as any)?.env?.VITE_RAZORPAY_KEY_ID as string) || 
  'rzp_live_TRvY1heMKDgp8s';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR (Rupees)
  description?: string;
  notes?: Record<string, string>;
  customer: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onSuccess: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    method?: string;
  }) => Promise<void> | void;
  onDismiss?: () => void;
  onError?: (error: any) => void;
}

/**
 * Loads Razorpay official checkout SDK if not already present on window
 */
export const loadRazorpaySDK = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay SDK from CDN');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Opens Razorpay Official Modal with UPI, Cards, Netbanking, Wallets
 */
export const openRazorpayPayment = async (options: RazorpayPaymentOptions): Promise<boolean> => {
  const isLoaded = await loadRazorpaySDK();

  if (!isLoaded || !window.Razorpay) {
    console.error('Razorpay SDK unavailable');
    if (options.onError) {
      options.onError(new Error('Razorpay SDK could not be initialized'));
    }
    return false;
  }

  try {
    const rzpOptions = {
      key: RAZORPAY_LIVE_KEY_ID,
      amount: Math.round(options.amount * 100), // Amount in paise
      currency: 'INR',
      name: 'Rakhi Coaching Classes',
      description: options.description || 'Class 12th Commerce Study Notes & Revision Material',
      image: '/vite.svg',
      prefill: {
        name: options.customer.name || '',
        email: options.customer.email || '',
        contact: options.customer.phone || ''
      },
      notes: {
        institute: 'Rakhi Coaching Classes',
        website: 'https://rakhicoachingclasses.com',
        ...(options.notes || {})
      },
      theme: {
        color: '#f97316' // Rakhi Coaching signature Orange
      },
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
        }
      },
      handler: function (response: any) {
        if (options.onSuccess) {
          options.onSuccess({
            razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            method: response.razorpay_payment_method || 'Online Gateway'
          });
        }
      }
    };

    const rzpInstance = new window.Razorpay(rzpOptions);
    
    rzpInstance.on('payment.failed', function (response: any) {
      console.error('Razorpay Payment Failed:', response.error);
      if (options.onError) {
        options.onError(response.error);
      }
    });

    rzpInstance.open();
    return true;
  } catch (err) {
    console.error('Error invoking Razorpay:', err);
    if (options.onError) {
      options.onError(err);
    }
    return false;
  }
};
