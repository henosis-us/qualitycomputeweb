// api.js
// API utility functions for interacting with the backend.
// Uses fetch for HTTP requests. Make sure to handle CORS if necessary.

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://qualitycompute.henosis.us'; // Set this in .env file for production

export async function registerUser(name, email, username, password) {
  try {
    // Log the URL being requested for debugging
    console.log(`Attempting to register user at URL: ${BASE_URL}/api/register`);
    // Log the request body for debugging
    console.log('Request body:', JSON.stringify({ name, email, username, password }));

    const response = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    return data; // { message, user_id }
  } catch (error) {
    // Log the full error object for detailed debugging
    console.error('API Error - Register User:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function loginUser(email, password) {
  try {
    console.log(`Attempting to login at URL: ${BASE_URL}/api/login`);
    console.log('Request body:', JSON.stringify({ email, password }));
    console.log('Request headers:', {
      'Content-Type': 'application/json'
    });
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    return data; // { message, user: { user_id, name, email, username }, token }
  } catch (error) {
    console.error('API Error - Login User:', error);
    console.error('API Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export async function verifyEmailCode(userId, verificationCode) {
  try {
    // Log the URL and request body for debugging
    console.log(`Attempting to verify email code at URL: ${BASE_URL}/api/verify_email`);
    console.log('Request body:', JSON.stringify({ user_id: userId, verification_code: verificationCode }));

    const response = await fetch(`${BASE_URL}/api/verify_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, verification_code: verificationCode }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Verification failed. Please try again.' }));
      throw new Error(errorData.error || 'Failed to verify email');
    }

    const data = await response.json();
    return data; // { message: "Email verified successfully" } or similar
  } catch (error) {
    console.error('API Error - Verify Email Code:', error);
    throw error;
  }
}

export async function generateApiKey(token, userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/generate_api_key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use JWT token for authentication
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate API key');
    }

    const data = await response.json();
    return data; // { message, api_key }
  } catch (error) {
    console.error('API Error - Generate API Key:', error);
    throw error;
  }
}

export async function getApiKeys(token, userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/get_api_keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Use JWT token for authentication
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve API keys');
    }

    const data = await response.json();
    return data; // { message, user_id, api_keys: [{ api_key, created_at }, ...] }
  } catch (error) {
    console.error('API Error - Get API Keys:', error);
    throw error;
  }
}

export async function getAnalyticsData(token, timeRange = '7d') {
  try {
    const response = await fetch(`${BASE_URL}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ time_range: timeRange }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve analytics');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - Get Analytics Data:', error);
    throw error;
  }
}

export async function getApiLogs(token, page = 1, perPage = 10) {
  try {
    const response = await fetch(`${BASE_URL}/api/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ page, per_page: perPage }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve API logs');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error - Get API Logs:', error);
    throw error;
  }
}

export async function getOverviewData(token, timeRange = '7d') {
  try {
    const response = await fetch(`${BASE_URL}/api/overview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ time_range: timeRange }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve overview data');
    }
    const data = await response.json();
    return data; // Returns { name, credits, apiCalls, recentCalls, usageByModel, dailyUsage }
  } catch (error) {
    console.error('API Error - Get Overview Data:', error);
    throw error;
  }
}

export async function getUserSettings(token) {
  try {
    console.log(`Attempting to get user settings at URL: ${BASE_URL}/api/get_settings`);
    const response = await fetch(`${BASE_URL}/api/get_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to retrieve user settings');
    }

    const data = await response.json();
    return data; // { settings: { account: { organization_name }, notifications: { email_alerts, low_credit_threshold, usage_reports } } }
  } catch (error) {
    console.error('API Error - Get User Settings:', error);
    throw error;
  }
}

export async function updateUserSettings(token, settings) {
  try {
    console.log(`Attempting to update user settings at URL: ${BASE_URL}/api/update_settings`);
    console.log('Request body:', JSON.stringify({ settings }));
    const response = await fetch(`${BASE_URL}/api/update_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update user settings');
    }

    const data = await response.json();
    return data; // { message: "Settings updated successfully" }
  } catch (error) {
    console.error('API Error - Update User Settings:', error);
    throw error;
  }
}

export async function changePassword(token, userId, currentPassword, newPassword) {
  try {
    console.log(`Attempting to change password at URL: ${BASE_URL}/change_password`);
    console.log('Request body:', JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword }));
    const response = await fetch(`${BASE_URL}/change_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }

    const data = await response.json();
    return data; // { message: "Password updated successfully" }
  } catch (error) {
    console.error('API Error - Change Password:', error);
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    console.log(`Attempting to request password reset for email: ${email} at URL: ${BASE_URL}/api/forgot_password`);
    const response = await fetch(`${BASE_URL}/api/forgot_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to request password reset. Please try again.' }));
      console.error('API Error - Request Password Reset:', errorData.error || 'Server error during password reset request.');
      throw new Error(errorData.error || 'Failed to request password reset.');
    }

    const data = await response.json();
    return data; // { message: "If an account with this email exists, a password reset link has been sent." }
  } catch (error) {
    console.error('API Error - Request Password Reset (Catch Block):', error);
    throw error;
  }
}

export async function confirmPasswordReset(resetToken, newPassword) {
  try {
    console.log(`Attempting to confirm password reset with token: ${resetToken} at URL: ${BASE_URL}/api/reset_password`);
    const response = await fetch(`${BASE_URL}/api/reset_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reset_token: resetToken, new_password: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Password reset failed. The link may be invalid or expired.' }));
      throw new Error(errorData.error || 'Password reset failed.');
    }

    const data = await response.json();
    return data; // { message: "Password reset successfully." }
  } catch (error) {
    console.error('API Error - Confirm Password Reset:', error);
    throw error;
  }
}

// New function for Stripe Checkout session creation
export async function createCheckoutSession(token, credits) {
  try {
    const response = await fetch(`${BASE_URL}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ credits: parseFloat(credits) }), // Ensure credits is sent as a number
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }
    const data = await response.json();
    return data; // Expect { sessionId, url }
  } catch (error) {
    console.error('API Error - Create Checkout Session:', error);
    throw error;
  }
}