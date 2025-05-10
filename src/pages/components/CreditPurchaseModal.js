// CreditPurchaseModal.js
import React, { useState } from 'react';
// REMOVE: import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'; // No longer needed for Stripe Checkout
// import { createPaymentForCredits } from '../../api'; // OLD API function for Elements
import { createCheckoutSession } from '../../api'; // NEW API function for Stripe Checkout

const CreditPurchaseModal = ({ isOpen, onClose }) => {
  const [credits, setCredits] = useState(''); // State for input credits
  const [loading, setLoading] = useState(false); // Loading state for payment processing
  const [error, setError] = useState(null); // Error state for displaying messages
  // REMOVE: const stripe = useStripe(); // Stripe hook no longer needed directly here
  // REMOVE: const elements = useElements(); // Elements hook no longer needed directly here
  const authToken = localStorage.getItem('authToken'); // Retrieve JWT token from local storage

  // Handle change in credits input
  const handleCreditsChange = (e) => {
    setCredits(e.target.value);
  };

  // Calculate cost with 10% margin (pre-tax)
  const calculateCost = () => {
    const numCredits = parseFloat(credits);
    if (isNaN(numCredits) || numCredits <= 0) return 0.00;
    return (numCredits * 1.10).toFixed(2); // Apply 10% service fee, tax will be added by Stripe
  };

  // Handle form submission for payment
  const handleSubmit = async (e) => {
    e.preventDefault();
    // REMOVE: Stripe Elements check:
    // if (!stripe || !elements) {
    //   setError('Stripe has not loaded yet. Please try again.');
    //   return;
    // }
    setLoading(true);
    setError(null);

    try {
      const numCredits = parseFloat(credits);
      if (isNaN(numCredits) || numCredits <= 0) {
        throw new Error('Please enter a valid number of credits.');
      }

      // Call the API to create a Stripe Checkout session
      // This replaces the createPaymentForCredits and stripe.confirmCardPayment calls
      const response = await createCheckoutSession(authToken, numCredits);
      const { url } = response; // Expecting 'url' from the backend for redirection

      if (url) {
        // Redirect the user to Stripe's hosted Checkout page
        window.location.href = url;
      } else {
        // This case should ideally not happen if the backend is working correctly
        throw new Error('Failed to retrieve Stripe Checkout URL. Please try again.');
      }
      // If redirection is successful, setLoading(false) might not be reached
      // as the user navigates away. It's okay.

    } catch (err) {
      setError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false); // Ensure loading is set to false on error
    }
    // REMOVE: finally block as setLoading(false) is handled in catch or by navigation
    // finally {
    //   setLoading(false);
    // }
  };

  // Do not render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto my-10">
        <h2 className="text-xl font-bold mb-4">Purchase Credits</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display error messages */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-gray-700">
              Number of Credits
            </label>
            <input
              type="number"
              id="credits"
              min="1"
              step="1"
              value={credits}
              onChange={handleCreditsChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="text-sm text-gray-600">
            Estimated Cost: ${calculateCost()} USD (plus applicable taxes, calculated at checkout)
          </div>
          {/* REMOVE CardElement section - Stripe Checkout handles card input */}
          {/* <div>
            <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
              Card Details
            </label>
            <div className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm">
              <CardElement id="card-element" />
            </div>
          </div> */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading} // REMOVE: || !stripe (Stripe object no longer a direct dependency for submit button)
              className={`px-4 py-2 text-white rounded-md ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditPurchaseModal;