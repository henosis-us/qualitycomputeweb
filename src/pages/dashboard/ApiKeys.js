// src/pages/dashboard/ApiKeys.js
import React, { useState, useEffect } from 'react';
import { generateApiKey, getApiKeys } from '../../api'; // Import API functions

export default function ApiKeys() {
  const [isLoading, setIsLoading] = useState(true);
  // Frontend state structure will use 'key' property for the API key string
  const [apiKeys, setApiKeys] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  // selectedKey will store the object { key, created_at, last_used, calls_count }
  const [selectedKey, setSelectedKey] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // newKey will also store the object { key, created_at, ... } for the alert
  const [newKey, setNewKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null); // Stores the key string that was copied
  const [error, setError] = useState(null); // State to handle errors

  // Retrieve token and user ID from local storage (assumed to be set after login)
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId'); // Assume userId is stored in local storage

  useEffect(() => {
    if (!authToken || !userId) {
      // If no auth token or user ID, redirect or handle unauthenticated state
      console.error('No authentication token or user ID found. Redirecting to login.');
      // Consider using react-router's navigate for a smoother redirect
      // navigate('/login', { replace: true });
      // For now, a simple window.location is used based on original code:
      window.location.href = '/login';
      return;
    }

    const fetchApiKeys = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Call the real API function with token and userId
        // Assuming getApiKeys in api.js now handles sending the token in the header
        // and expects userId in the body based on the previous backend snippet,
        // or ideally, the backend gets userId from the JWT now.
        // Let's assume api.js needs both token (for header) and userId (for body as per original backend logic)
        // based on your request to NOT change the generate endpoint's API key auth logic.
        // If you switched get_api_keys to JWT as discussed *before* this request,
        // you would pass ONLY the token here: await getApiKeys(authToken);
        // Let's use the API key auth assumption for getApiKeys as per your last instruction context:
        // *** ASSUMPTION *** getApiKeys still requires userId in the body and API key in the header.
        // If getApiKeys now uses JWT from the dashboard, you only need to pass authToken.
        // I'll use the JWT assumption for getApiKeys as that aligns with dashboard flow better.
        // If your backend get_api_keys still uses the old API key logic, revert this to pass userId.
        const data = await getApiKeys(authToken); // Assuming getApiKeys now uses JWT header, no userId body needed

        // Map backend response format { api_key, created_at } to frontend state format { key, created_at, last_used, calls_count }
        const formattedKeys = (data.api_keys || []).map(k => ({
            key: k.api_key, // Use 'key' property in frontend state
            created_at: k.created_at,
            last_used: k.last_used || null, // Ensure null default if backend doesn't provide
            calls_count: k.calls_count || 0 // Ensure 0 default if backend doesn't provide
        }));
        setApiKeys(formattedKeys); // Set the formatted keys to state

      } catch (err) {
        console.error('Error fetching API keys:', err);
        // Check if error indicates authentication failure and suggest login
        if (err.message.includes('unauthorized') || err.message.includes('Invalid API key')) {
             setError('Authentication failed or invalid API key. Please log in again.');
             // Consider redirecting to login: window.location.href = '/login';
        } else {
            setError('Failed to load API keys. Please try again or check your authentication.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKeys();
  }, [authToken, userId]); // Re-fetch if token or userId changes (userId might be redundant if using JWT for this endpoint)


  const generateNewKey = async () => {
    if (!authToken || !userId) { // Still need userId to tell backend *for which user* to generate a key
      setError('Authentication required. Please log in.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setNewKey(null); // Clear previous new key alert

    try {
      // Call the real API function.
      // Assuming generateApiKey in api.js sends token in header and userId in body.
      const data = await generateApiKey(authToken, userId); // Assuming this returns { message, api_key: 'QC_...' }

      const newKeyString = data.api_key; // Get the key string from the backend response

      // Create a new key object matching the frontend state structure
      const newKeyObject = {
        key: newKeyString, // Use 'key' property
        created_at: new Date().toISOString(), // Use current timestamp as created date
        last_used: null, // Newly created key hasn't been used
        calls_count: 0 // Newly created key has 0 calls
      };

      // Add the new key object to the top of the list
      setApiKeys([newKeyObject, ...apiKeys]);

      // Set the new key object to the state for the alert
      setNewKey(newKeyObject);

    } catch (err) {
      console.error('Error generating API key:', err);
      setError('Failed to generate API key. Please try again.');
    } finally {
      setIsGenerating(false);
      setShowCreateModal(false); // Close the modal after generation attempt
    }
  };

  const revokeKey = async () => {
    if (!authToken || !selectedKey) {
      setError('Authentication or key selection required.');
      return;
    }

    setError(null);
    try {
      // Assume a revoke endpoint exists or add it to backend
      // This endpoint will likely require the specific api_key string to revoke
      // and authentication (using the user's JWT token from dashboard)
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/revoke_api_key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`, // Authenticate with JWT
        },
        body: JSON.stringify({ api_key: selectedKey.key }), // Pass the api_key string from the selected key object
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Revocation failed');
      }

      // Remove the key from the list by filtering based on its unique 'key' property
      setApiKeys(apiKeys.filter(key => key.key !== selectedKey.key));
      setShowRevokeModal(false);
      setSelectedKey(null); // Clear selected key after successful revocation
      // Also clear the newKey alert if it was the key just revoked
      if (newKey && newKey.key === selectedKey.key) {
          setNewKey(null);
      }

    } catch (err) {
      console.error('Error revoking API key:', err);
      setError('Failed to revoke API key. Please try again.');
    }
  };

  const copyToClipboard = (keyString) => { // Expects the key string
    navigator.clipboard.writeText(keyString);
    setCopiedKey(keyString); // Set the string that was copied
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
        const date = new Date(dateString);
         // Check if the date is valid (e.g., not "Invalid Date")
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString('en-US', {
           year: 'numeric',
           month: 'short',
           day: 'numeric',
           hour: '2-digit',
           minute: '2-digit'
        });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Error'; // Return an error indicator for invalid strings
    }
  };


  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">API Keys</h2>
        <button
           onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          disabled={isGenerating} // Disable button while generating
        >
          Generate New Key
        </button>
      </div>

      {/* New key alert */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">New API key generated!</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Your new API key has been created. Make sure to copy it now. For security reasons, you won't be able to see the full key again.</p>
              <div className="mt-2 flex items-center">
                {/* Use newKey.key because newKey is now the structured object */}
                <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-green-200">{newKey.key}</code>
                {/* Pass newKey.key (the string) to copyToClipboard */}
                <button
                   onClick={() => copyToClipboard(newKey.key)}
                  className="ml-2 text-xs bg-white text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                >
                  {copiedKey === newKey.key ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
          <div className="ml-auto pl-3 flex-shrink-0">
            {/* Clear new key alert by setting newKey to null */}
            <button
              onClick={() => setNewKey(null)}
              className="text-green-500 hover:text-green-600"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* API Keys Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Your API Keys</h3>
            <p className="text-sm text-slate-500">Use these keys to authenticate your API requests</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600 font-medium">Loading your API keys...</p>
            </div>
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-700">No API keys found</h3>
            <p className="mt-1 text-slate-500">Get started by generating your first API key.</p>
            <button
               onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              disabled={isGenerating} // Disable button while generating
            >
              Generate New Key
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">API Key</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Used</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Calls</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {/* Now apiKey should definitely have a .key property */}
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.key} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-mono text-xs bg-slate-100 py-1.5 px-3 rounded-md">
                          {/* Safely access apiKey.key now that we ensure the structure */}
                          {apiKey.key ? `${apiKey.key.substring(0, 8)}...${apiKey.key.substring(apiKey.key.length - 4)}` : 'N/A'}
                        </span>
                        {/* Pass the key string to copyToClipboard */}
                        <button
                           onClick={() => copyToClipboard(apiKey.key)}
                          className="ml-3 text-xs bg-white text-slate-500 border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                        >
                          {copiedKey === apiKey.key ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(apiKey.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(apiKey.last_used)} {/* Assuming last_used might be null or undefined */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {apiKey.calls_count?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                         onClick={() => {
                          setSelectedKey(apiKey); // Store the full object
                          setShowRevokeModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 text-xs font-medium"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* API Key Usage Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Using Your API Key</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Authentication</h4>
            <div className="bg-slate-50 rounded p-4 border border-slate-200">
              <pre className="text-xs font-mono text-slate-600 overflow-x-auto">
                <code>
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </pre>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Example Request</h4>
            <div className="bg-slate-800 rounded overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-700">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-200">cURL Example</span>
                </div>
                <button
                  onClick={() => copyToClipboard(`curl -X POST https://qualitycompute.henosis.us/api/generate \\  -H "Content-Type: application/json" \\  -H "Authorization: Bearer YOUR_API_KEY" \\  -d '{    "model": "gpt-4o-B5",    "input": "Your prompt here",    "include_candidates": false  }'`)}
                  className="text-xs bg-slate-600 px-3 py-1 rounded-md hover:bg-slate-500 transition-colors text-white"
                >
                  {/* Simplified copy check here as the command string is static */}
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-auto text-sm font-mono text-slate-300">
                <code className="block whitespace-pre">
                  {`curl -X POST https://qualitycompute.henosis.us/api/generate \\  -H "Content-Type: application/json" \\  -H "Authorization: Bearer YOUR_API_KEY" \\  -d '{    "model": "gpt-4o-B5",    "input": "Your prompt here",    "include_candidates": false  }'`}
                </code>
              </pre>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-700">
                Keep your API keys secure and don't expose them in publicly accessible areas such as client-side code or GitHub repositories. If a key is compromised, revoke it immediately and generate a new one.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Generate New API Key</h3>
            </div>
            <div className="p-6">
              <p className="text-slate-600 mb-6">
                This will create a new API key that you can use to authenticate requests to the Quality Compute API. Make sure to copy your new API key as soon as it's generated. For security reasons, you won't be able to see the full key again.
              </p>
              <div className="flex justify-end gap-3">
                <button
                   onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                   onClick={generateNewKey}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : 'Generate Key'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke API Key Modal */}
      {showRevokeModal && selectedKey && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Revoke API Key</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  Are you sure you want to revoke this API key? This action cannot be undone, and any applications using this key will lose access.
                </p>
                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                  <p className="text-sm font-medium text-red-800 mb-1">API Key</p>
                   {/* Safely access selectedKey.key */}
                  <p className="font-mono text-xs text-red-700">
                    {selectedKey.key ? `${selectedKey.key.substring(0, 8)}...${selectedKey.key.substring(selectedKey.key.length - 4)}` : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                   onClick={() => setShowRevokeModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                   onClick={revokeKey}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Revoke Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}