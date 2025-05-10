// src/constants/pricing.js

const BASE_PRICING_PER_MILLION_TOKENS = {
    "gemini-1.5-flash-latest":           { input: 0.075,   output: 0.300,   category: "Google" },
    "gemini-2.5-flash":                  { input: 0.150,   output: 0.600,   category: "Google" },
    "gemini-2.0-flash-lite-preview":     { input: 0.075,   output: 0.300,   category: "Google" },
    "gemini-2.5-flash-thinking":         { input: 0.150,   output: 3.500,   category: "Google" },
    "gemini-1.5-flash-8b":               { input: 0.0375,  output: 0.150,   category: "Google" },
    "gemini-2.5-pro-exp-03-25":          { input: 1.250,   output: 10.000,  category: "Google" },
  
    "gpt-3.5-turbo":                     { input: 0.500,   output: 1.500,   category: "OpenAI" },
    "gpt-4-turbo":                       { input: 10.000,  output: 30.000,  category: "OpenAI" },
    "gpt-4o-2024-11-20":                 { input: 2.500,   output: 10.000,  category: "OpenAI" },
    "chatgpt-4o-latest":                 { input: 5.000,   output: 15.000,  category: "OpenAI" },
  
    "claude-3-5-haiku-20241022":         { input: 1.000,   output: 5.000,   image_token_ratio: 750, category: "Anthropic" },
    "claude-3-5-sonnet-20241022":        { input: 3.000,   output: 15.000,  image_token_ratio: 750, category: "Anthropic" },
    "claude-3-7-sonnet-20250219":        { input: 3.000,   output: 15.000,  image_token_ratio: 750, category: "Anthropic" },
    "claude-3-7-sonnet-thinking":        { input: 3.000,   output: 15.000,  image_token_ratio: 750, category: "Anthropic" },
    "claude-3-opus-20240229":            { input: 15.000,  output: 75.000,  image_token_ratio: 750, category: "Anthropic" },
    "claude-3-haiku-20240307":           { input: 0.250,   output: 1.250,  image_token_ratio: 750, category: "Anthropic" },
  
    "deepseek-chat":                     { input: 0.140,   output: 0.280,   category: "DeepSeek" },
    "deepseek-reasoner":                 { input: 0.550,   output: 2.190,   category: "DeepSeek" },
    "DeepSeek-R1-Zero":                  { input: 0.550,   output: 2.190,   category: "DeepSeek" },
    "DeepSeek-R1":                       { input: 0.550,   output: 2.190,   category: "DeepSeek" },
  
    "o1-mini":                           { input: 3.000,   output: 12.000,  category: "OpenAI" },
    "o3":                                { input: 10.000,  output: 40.000,  category: "OpenAI" },
    "o1-pro":                            { input: 150.000, output: 600.000, category: "OpenAI" },
    "o4-mini":                           { input: 1.100,   output: 4.400,   category: "OpenAI" },
  
    "gpt-4.5-preview":                   { input: 75.000,  output: 150.000, category: "OpenAI" },
  
    "gpt-4o-mini":                       { input: 0.150,   output: 0.600,   category: "OpenAI" },
    "gpt-4.1":                           { input: 2.000,   output: 8.000,   category: "OpenAI" },
    "gpt-4.1-mini":                      { input: 0.400,   output: 1.600,   category: "OpenAI" },
    "gpt-4.1-nano":                      { input: 0.100,   output: 0.400,   category: "OpenAI" },
  
    "grok-3-beta":                       { input: 3.000,   output: 15.000,  category: "X.AI" },
    "grok-3-fast-beta":                  { input: 5.000,   output: 25.000,  category: "X.AI" },
    "grok-3-mini-beta":                  { input: 0.300,   output: 0.500,   category: "X.AI" },
    "grok-3-mini-fast-beta":             { input: 0.600,   output: 4.000,   category: "X.AI" },
  };
  
  /**
   * Map the simple model names used in UI/API (e.g. "gpt-4o")
   * to the exact keys in BASE_PRICING_PER_MILLION_TOKENS.
   */
  const SIMPLE_NAME_TO_PRICING_KEY_MAP = {
    "gpt-4o":                           "gpt-4o-2024-11-20",
    "gpt-4-turbo":                     "gpt-4-turbo",
    "gpt-3.5-turbo":                   "gpt-3.5-turbo",
    "chatgpt-4o-latest":               "chatgpt-4o-latest",
    "o4-mini":                         "o4-mini",
    "o3":                              "o3",
    "o1-pro":                          "o1-pro",
    "gpt-4.1":                         "gpt-4.1",
    "gpt-4.1-mini":                    "gpt-4.1-mini",
    "gpt-4.1-nano":                    "gpt-4.1-nano",
    "claude-3-opus":                   "claude-3-opus-20240229",
    "claude-3-sonnet":                 "claude-3-5-sonnet-20241022",
    "claude-3-haiku":                  "claude-3-haiku-20240307",
    "claude-3-7-sonnet-20250219":      "claude-3-7-sonnet-20250219",
    "claude-3-7-sonnet-thinking":      "claude-3-7-sonnet-thinking",
    "claude-3-5-sonnet-20241022":      "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022":       "claude-3-5-haiku-20241022",
    "gemini-pro":                      "gemini-2.5-pro-exp-03-25",
    "gemini-1.5-flash-latest":         "gemini-1.5-flash-latest",
    "gemini-2.5-flash":                "gemini-2.5-flash",
    "gemini-2.5-flash-thinking":       "gemini-2.5-flash-thinking",
    "gemini-2.0-flash-lite-preview":   "gemini-2.0-flash-lite-preview",
    "gemini-1.5-flash-8b":             "gemini-1.5-flash-8b",
    "grok-3-beta":                     "grok-3-beta",
    "grok-3-fast-beta":                "grok-3-fast-beta",
    "grok-3-mini-beta":                "grok-3-mini-beta",
    "grok-3-mini-fast-beta":           "grok-3-mini-fast-beta",
    "grok-2":                          "grok-3-mini-beta",
    "deepseek-chat":                   "deepseek-chat",
    "deepseek-reasoner":               "deepseek-reasoner",
    "DeepSeek-R1-Zero":                "DeepSeek-R1-Zero",
    "DeepSeek-R1":                     "DeepSeek-R1",
    "reka-spark":                      "reka-spark",
    "reka-edge":                       "reka-edge",
    "reka-flash-3":                    "reka-flash-3",
    "reka-core":                       "reka-core",
    "reka-core-20240904":              "reka-core-20240904",
    "reka-edge-20240208":              "reka-edge-20240208",
    "Meta-Llama-3.1-70b-Instruct":     "Meta-Llama-3.1-70b-Instruct",
    "Meta-Llama-3.1-8b-Instruct":      "Meta-Llama-3.1-8b-Instruct",
    "Meta-Llama-3.1-405B-Instruct":    "Meta-Llama-3.1-405B-Instruct",
    "command-r-plus":                  "command-r-plus",
    "command-r-plus-08-2024":          "command-r-plus-08-2024",
    "command-r":                       "command-r",
    "command-r7b":                     "command-r7b",
    "command-r7b-12-2024":             "command-r7b-12-2024",
  };
  
  /**
   * Retrieve pricing info and Best-of-N for a given model ID.
   * @param {string} modelId   E.g. "gpt-4o-B5" or "claude-3-opus"
   * @returns { input:number, output:number, category:string, bestOfN:number }
   */
  function getPricingInfo(modelId) {
    const parts      = modelId.split("-B");
    const baseName   = parts[0];
    const bestOfN    = parts.length > 1 ? parseInt(parts[1] || "8", 10) : 1;
    const pricingKey = SIMPLE_NAME_TO_PRICING_KEY_MAP[baseName];
    const basePrices = BASE_PRICING_PER_MILLION_TOKENS[pricingKey];
  
    if (!basePrices) {
      console.warn(`Pricing not found for model "${modelId}" (mapped key: "${pricingKey}")`);
      return { input: 0, output: 0, category: "Unknown", bestOfN };
    }
  
    return { ...basePrices, bestOfN };
  }
  
  export { getPricingInfo, BASE_PRICING_PER_MILLION_TOKENS, SIMPLE_NAME_TO_PRICING_KEY_MAP };