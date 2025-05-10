// src/pages/dashboard/ApiPlayground.js
import React, { useState } from 'react';
import { SIMPLE_NAME_TO_PRICING_KEY_MAP } from '../../constants/pricing';

export default function ApiPlayground() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]); // Array of { role, content } objects
  const [currentMessage, setCurrentMessage] = useState(''); // Current message being typed
  const [currentRole, setCurrentRole] = useState('user'); // Current role for the message
  const [formData, setFormData] = useState({
    model: 'gpt-4.1-nano', // Default base model
    nValue: 8, // Default N value for Best-of-N (as per API default if not specified)
    temperature: 0.7,
    max_tokens: 1000, // Ensure this starts as a number
    include_candidates: true,
    apiKey: '', // Required for authentication
  });
  const [result, setResult] = useState(null); // Store the API response
  const [error, setError] = useState(null); // State to handle errors

  // Models list derived from pricing.js SIMPLE_NAME_TO_PRICING_KEY_MAP
  const models = Object.keys(SIMPLE_NAME_TO_PRICING_KEY_MAP); // Get all simple model names as an array

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Parse numerical fields to ensure they are stored as numbers in state
    if (name === 'max_tokens') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setFormData({
          ...formData,
          [name]: numValue, // Store as integer
        });
      } else {
        console.warn(`Invalid number for ${name}. Please enter a valid integer.`);
      }
    } else {
      // For other fields, set as-is
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    // Temperature is already handled as float
    setFormData({
      ...formData,
      [name]: parseFloat(value), // Ensure it's a float
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Ensure N value is a positive integer
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) { // Changed > 0 to >= 1 as N=1 is valid
      setFormData({
        ...formData,
        [name]: numValue, // Store as integer
      });
    } else if (value === '') {
      // Allow empty string temporarily, will default on submit or valid entry
      setFormData({
        ...formData,
        [name]: '', // Set to empty string temporarily, validation will handle it on run
      });
    } else {
      // If invalid number (e.g., negative, decimal), don't update, maybe show warning
      console.warn("Invalid input for Best of N. Please enter a positive integer.");
    }
  };

  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  const handleRoleChange = (e) => {
    setCurrentRole(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault(); // Prevent default form submission or new line
      addMessageToConversation(); // Add message to history without API call
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      runConversation(); // Trigger API call with Ctrl+Enter
    }
  };

  const addMessageToConversation = () => {
    if (currentMessage.trim() === '') return; // Don't add empty messages
    setConversation([...conversation, { role: currentRole, content: currentMessage }]);
    setCurrentMessage(''); // Clear input after adding
  };

  const runConversation = async () => {
    if (!formData.apiKey) {
      setError('API key is required. Please enter a valid API key.');
      return;
    }
    if (conversation.length === 0) {
      setError('No conversation history to send. Add at least one message.');
      return;
    }
    // Validate nValue before submitting
    const nValue = parseInt(formData.nValue, 10);
    if (isNaN(nValue) || nValue < 1) {
        setError('Invalid value for Best of N. Please enter a positive integer (minimum 1).');
        return;
    }

    // Validate max_tokens is a positive integer
    const maxTokensValue = parseInt(formData.max_tokens, 10);
    if (isNaN(maxTokensValue) || maxTokensValue < 1) {
        setError('Invalid value for Max Output Tokens. Please enter a positive integer.');
        return;
    }

    setIsLoading(true);
    setError(null);

    // Construct the full model ID with -B suffix (always append -B{nValue} as per updated requirement)
    let modelToSend = `${formData.model}-B${nValue}`; // Always append -B{nValue} for explicit N specification

    // Create a copy of formData for parameter mapping
    let requestBody = {
      model: modelToSend,
      input: conversation, // Send the entire conversation as a list of message objects
      include_candidates: formData.include_candidates,
    };

    // Handle model-specific parameter mapping based on model prefix
    if (modelToSend.startsWith('o')) { // For OpenAI reasoning models (e.g., 'o1-preview')
      // Use 'max_completion_tokens' instead of 'max_tokens'
      requestBody.max_completion_tokens = formData.max_tokens;
      // Temperature is not supported; omit it
      // Do not add temperature parameter
    } else {
      // For other models, use 'max_tokens' and 'temperature'
      requestBody.max_tokens = formData.max_tokens;
      requestBody.temperature = formData.temperature;
    }

    console.log(`Submitting API call to ${process.env.REACT_APP_API_BASE_URL}/api/generate with model: ${modelToSend}`);
    console.log('Request body:', JSON.stringify(requestBody));
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${formData.apiKey ? '***MASKED***' : 'null'}`,
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formData.apiKey}`,
        },
        body: JSON.stringify(requestBody), // Use the modified request body with model-specific parameters
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || 'API call failed');
      }

      const data = await response.json();
      console.log('API response received:', data);

      // Add the API response to the conversation history
      setConversation([...conversation, { role: 'assistant', content: data.selected_text }]);

      // Store full result for display if needed
      setResult(data);
    } catch (err) {
      console.error('Error during API call:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      setError(`Failed to generate response: ${err.message}. Ensure API key is valid and model parameters are supported.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">API Playground - Chat Interface</h2>
          <p className="text-slate-600 mt-1">Build a conversation and run it with the selected model. Enter a valid API key for authentication. Press Enter to add messages, Ctrl+Enter or click "Run" to execute the API call.</p>
        </div>

        {/* Settings Panel for Parameters */}
        <div className="p-6 space-y-6">
          {/* API Key Input */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
              API Key (Required)
            </label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={(e) => handleInputChange(e)}
              placeholder="Enter API key here (e.g., QC_...)"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
            <p className="mt-1 text-xs text-slate-500">Fetch your API key from the API Keys tab and enter it here.</p>
          </div>

          {/* Model and N Value Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-slate-700 mb-2">
                Model
              </label>
              <select
                id="model"
                name="model"
                value={formData.model}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Select a base model from the available options. Note: Some models (e.g., starting with 'o') may not support 'max_tokens' or 'temperature' parameters.</p>
            </div>

            <div>
              <label htmlFor="nValue" className="block text-sm font-medium text-slate-700 mb-2">
                Best of N Value
              </label>
              <input
                type="number"
                id="nValue"
                name="nValue"
                value={formData.nValue}
                onChange={handleNumberChange} // Custom handler for number validation
                min="1"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <p className="mt-1 text-xs text-slate-500">Number of candidates to generate (minimum 1).</p> {/* Updated hint */}
            </div>
          </div>

          {/* Temperature and Max Tokens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="max_tokens" className="block text-sm font-medium text-slate-700 mb-2">
                Max Output Tokens
              </label>
              <input
                type="number"
                id="max_tokens"
                name="max_tokens"
                value={formData.max_tokens}
                onChange={(e) => handleInputChange(e)} // Updated to handle parsing
                min="1"
                max="4000"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-slate-700 mb-3 flex justify-between">
                <span>Temperature: {formData.temperature.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">Higher = more creative</span>
              </label>
              <input
                type="range"
                id="temperature"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Precise (0.0)</span>
                <span>Creative (1.0)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="include_candidates"
              name="include_candidates"
              type="checkbox"
              checked={formData.include_candidates}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="include_candidates" className="ml-2 block text-sm text-slate-700">
              Include all candidate responses
            </label>
          </div>
        </div>
      </div>

      {/* Chat History Display */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">Conversation History</h3>
        </div>
        <div className="p-6 max-h-96 overflow-y-auto space-y-4">
          {conversation.map((msg, index) => (
            <div key={index} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50' : msg.role === 'assistant' ? 'bg-gray-50' : 'bg-indigo-50'}`}>
              <strong>{msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:</strong> <span className="whitespace-pre-wrap">{msg.content}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-2 text-slate-600 font-medium">Processing API call...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex space-x-4">
            {/* Role Selector */}
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              <option value="user">User</option>
              <option value="assistant">Assistant</option>
              <option value="system">System</option>
            </select>

            {/* Message Input */}
            <input
              type="text"
              value={currentMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message and press Enter to add, or Ctrl+Enter to run..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />

            {/* Run Button */}
            <button
              onClick={runConversation}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? 'Running...' : 'Run Conversation'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section for Detailed Response (if candidates are included) */}
      {result && result.candidate_responses && result.candidate_responses.length > (result.candidates_count > 0 ? 1 : 0) && formData.include_candidates && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Detailed Response (Candidates & Usage)</h3>
          </div>
          <div className="p-6 space-y-4">
            <h4 className="text-md font-semibold text-slate-700">All Candidate Responses ({result.candidates_count} total)</h4>
            <div className="space-y-4">
              {/* Map over candidate_responses array */}
              {result.candidate_responses.map((candidate, index) => {
                const isSelected = candidate === result.selected_text; // Check if this candidate matches selected_text
                return (
                  <div key={index} className={`p-4 rounded-lg border ${isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-slate-700">Candidate {index + 1}</span>
                      {isSelected && (
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 font-medium">Selected</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 whitespace-pre-wrap">{candidate}</div>
                  </div>
                );
              })}
            </div>

            <h4 className="text-md font-semibold text-slate-700 mt-4">Usage Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Input Tokens</div>
                <div className="text-lg font-semibold">{(result.usage?.input_tokens || 0).toLocaleString()}</div> {/* Safe access */}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Output Tokens</div>
                <div className="text-lg font-semibold">{(result.usage?.output_tokens || 0).toLocaleString()}</div> {/* Safe access */}
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Reasoning Tokens</div>
                <div className="text-lg font-semibold">{(result.usage?.reasoning_tokens || 0).toLocaleString()}</div> {/* Safe access */}
              </div>
            </div>
            {result.evaluator && result.evaluator !== 'N/A' && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Evaluator Model</div>
                <div className="text-sm font-semibold text-slate-800">{result.evaluator}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}