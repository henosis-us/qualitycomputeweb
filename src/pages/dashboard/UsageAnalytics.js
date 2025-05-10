import React, { useState, useEffect, useMemo } from 'react';
import { getAnalyticsData } from '../../api';
import { getPricingInfo } from '../../constants/pricing';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

export default function UsageAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [granularity, setGranularity] = useState('daily'); // Default to daily, removed hourly
  const [groupBy, setGroupBy] = useState('model');
  const [dimension, setDimension] = useState('tokens');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('bar'); // 'bar', 'line', 'pie', 'table'

  // Retrieve authToken (JWT) from local storage
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    if (!authToken) {
      console.error('No auth token found, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const responseData = await getAnalyticsData(authToken, timeRange, granularity, groupBy, dimension);
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        setData(responseData.analytics || []);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'Failed to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, granularity, groupBy, dimension, authToken]);

  // Handler for filter changes
  const handleTimeRangeChange = (newRange) => setTimeRange(newRange);
  const handleGranularityChange = (newGranularity) => setGranularity(newGranularity);
  const handleGroupByChange = (newGroupBy) => setGroupBy(newGroupBy);
  const handleDimensionChange = (newDimension) => setDimension(newDimension);
  const handleViewTypeChange = (newViewType) => setViewType(newViewType);

  // Compute cost for a given token count, token type, and model
  const computeCost = (tokens, tokenType, model) => {
    if (!model || dimension !== 'cost') return 0;
    const pricing = getPricingInfo(model);
    if (pricing.category === "Unknown") return 0;
    const pricePerToken = tokenType === 'input' ? pricing.input / 1000000 : pricing.output / 1000000; // Assuming input and output pricing; adjust if reasoning has different pricing
    return (tokens * pricePerToken).toFixed(6);
  };

  // Get the value based on dimension, using model-specific pricing if available, else average
  const getValue = (item) => {
    if (dimension === 'tokens') {
      return (item.input_tokens || 0) + (item.output_tokens || 0) + (item.reasoning_tokens || 0);
    } else { // cost
      if (groupBy === 'model' && item.model) {
        return parseFloat(computeCost(item.input_tokens, 'input', item.model)) + 
               parseFloat(computeCost(item.output_tokens, 'output', item.model)) + 
               parseFloat(computeCost(item.reasoning_tokens, 'reasoning', item.model)); // Note: reasoning might need specific pricing if defined
      } else { // fallback for api_key or when model not available
        return ((item.input_tokens || 0) * 0.000001) + ((item.output_tokens || 0) * 0.000002) + ((item.reasoning_tokens || 0) * 0.000002);
      }
    }
  };

  // Format date based on granularity for x-axis labels and tables, using UTC explicitly
  const formatDate = (dateStr, granularity) => {
    let date;
    switch (granularity) {
      case 'daily':
        // dateStr is 'YYYY-MM-DD' (UTC), parse as UTC midnight
        date = new Date(dateStr + 'T00:00:00Z');
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
      case 'weekly':
        // dateStr is 'YYYY-MM-DD' (UTC week start), parse as UTC
        date = new Date(dateStr + 'T00:00:00Z');
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }) + ' (Week Start)';
      case 'monthly':
        // dateStr is 'YYYY-MM' (UTC), create a Date object for the first day of the month in UTC
        const [year, month] = dateStr.split('-');
        date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1)); // month is 0-based in Date constructor
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', year: 'numeric' });
      default:
        // Fallback, treat as a full date string
        date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-US', { timeZone: 'UTC' });
    }
  };

  // Aggregate data by granularity and group, ensuring UTC usage for bucket keys
  const aggregateDataByGranularityAndGroup = (rawData, granularity, groupBy) => {
    const aggregated = {}; // { bucketKey: { groupKey: { sums } or token type sums } }

    rawData.forEach(item => {
      const date = new Date(item.time_bucket); // Assume item.time_bucket is an ISO string (e.g., '2023-04-30T00:00:00Z')
      if (isNaN(date.getTime())) {
        return; // Skip invalid dates
      }
      let bucketKey;
      switch (granularity) {
        case 'daily':
          bucketKey = date.toISOString().slice(0, 10); // UTC date 'YYYY-MM-DD'
          break;
        case 'weekly':
          // Calculate week start in UTC (Sunday as start)
          const utcDay = date.getUTCDay(); // 0-6, Sunday is 0
          const weekStartDate = new Date(date); // Copy the date
          weekStartDate.setUTCDate(date.getUTCDate() - utcDay); // Set to Sunday in UTC
          weekStartDate.setUTCHours(0, 0, 0, 0); // Normalize to UTC midnight
          bucketKey = weekStartDate.toISOString().slice(0, 10); // UTC date string
          break;
        case 'monthly':
          bucketKey = date.toISOString().slice(0, 7); // UTC 'YYYY-MM'
          break;
        default:
          bucketKey = item.time_bucket; // Fallback, should not occur
      }

      if (!aggregated[bucketKey]) {
        aggregated[bucketKey] = {};
      }

      if (groupBy === 'token_type') {
        if (!aggregated[bucketKey].input_tokens) aggregated[bucketKey].input_tokens = 0;
        aggregated[bucketKey].input_tokens += item.input_tokens || 0;
        if (!aggregated[bucketKey].output_tokens) aggregated[bucketKey].output_tokens = 0;
        aggregated[bucketKey].output_tokens += item.output_tokens || 0;
        if (!aggregated[bucketKey].reasoning_tokens) aggregated[bucketKey].reasoning_tokens = 0;
        aggregated[bucketKey].reasoning_tokens += item.reasoning_tokens || 0;
      } else { // groupBy is 'model' or 'api_key'
        const groupKey = groupBy === 'model' ? (item.model || 'unknown') : (item.api_key || 'unknown');
        if (!aggregated[bucketKey][groupKey]) {
          aggregated[bucketKey][groupKey] = {
            input_tokens: 0,
            output_tokens: 0,
            reasoning_tokens: 0,
            call_count: 0
          };
        }
        aggregated[bucketKey][groupKey].input_tokens += item.input_tokens || 0;
        aggregated[bucketKey][groupKey].output_tokens += item.output_tokens || 0;
        aggregated[bucketKey][groupKey].reasoning_tokens += item.reasoning_tokens || 0;
        aggregated[bucketKey][groupKey].call_count += item.call_count || 0;
      }
    });

    // Convert to sorted array of { time_bucket, data }
    const buckets = Object.keys(aggregated).sort((a, b) => new Date(a) - new Date(b)); // Sort by date string (UTC-based)
    return buckets.map(bucket => ({
      time_bucket: bucket,
      data: aggregated[bucket]
    }));
  };

  // Memoized aggregated data
  const aggregatedData = useMemo(() => {
    return aggregateDataByGranularityAndGroup(data, granularity, groupBy);
  }, [data, granularity, groupBy]);

  // Prepare data for charts - normalize and transform as needed for bar and line charts
  const prepareChartData = () => {
    if (aggregatedData.length === 0) return [];
    
    if (groupBy === 'token_type') {
      return aggregatedData.map(item => ({
        time_bucket: item.time_bucket,
        input_tokens: item.data.input_tokens,
        output_tokens: item.data.output_tokens,
        reasoning_tokens: item.data.reasoning_tokens
      }));
    } else if (groupBy === 'model' || groupBy === 'api_key') {
      // Get all unique groups across all buckets
      const allGroupsSet = new Set();
      aggregatedData.forEach(bucketItem => {
        Object.keys(bucketItem.data).forEach(group => allGroupsSet.add(group));
      });
      const groupsArray = Array.from(allGroupsSet);

      // For each bucket, create object with time_bucket and group_total for each group
      return aggregatedData.map(bucketItem => {
        const bucketObj = { time_bucket: bucketItem.time_bucket };
        groupsArray.forEach(group => {
          const groupData = bucketItem.data[group] || { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0 };
          bucketObj[`${group}_total`] = getValue(groupData); // Compute value based on dimension
        });
        return bucketObj;
      });
    }
    return [];
  };

  // Color palette for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#83a6ed'];

  // Render the appropriate graph based on viewType and groupBy
  const renderGraph = () => {
    const chartData = prepareChartData();
    
    if (viewType === 'table') {
      return renderTable();
    }
    
    if (chartData.length === 0 && viewType !== 'pie') {
      return <div className="text-center p-8">No data to display</div>;
    }
    
    if (viewType === 'pie') {
      return renderPieChart();
    }
    
    if (viewType === 'line') {
      return renderLineChart(chartData);
    }
    
    // Default to bar chart
    return renderBarChart(chartData);
  };

  // Render line chart
  const renderLineChart = (chartData) => {
    if (chartData.length === 0) return null;
    
    if (groupBy === 'token_type') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_bucket" tickFormatter={(value) => formatDate(value, granularity)} />
            <YAxis />
            <Tooltip 
              formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} 
            />
            <Legend />
            <Line type="monotone" dataKey="input_tokens" name="Input Tokens" stroke={COLORS[0]} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="output_tokens" name="Output Tokens" stroke={COLORS[1]} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="reasoning_tokens" name="Reasoning Tokens" stroke={COLORS[2]} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (groupBy === 'model' || groupBy === 'api_key') {
      const groupKeyName = groupBy === 'model' ? 'Model' : 'API Key';
      // Extract group keys from chartData (ensures all groups are included)
      const firstDataItem = chartData[0];
      const groupKeys = Object.keys(firstDataItem).filter(key => key !== 'time_bucket' && key.endsWith('_total')).map(key => key.replace('_total', ''));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_bucket" tickFormatter={(value) => formatDate(value, granularity)} />
            <YAxis />
            <Tooltip 
              formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} 
            />
            <Legend />
            {groupKeys.map((group, index) => (
              <Line 
                key={group} 
                type="monotone" 
                dataKey={`${group}_total`} 
                name={`${groupKeyName}: ${group}`} 
                stroke={COLORS[index % COLORS.length]} 
                activeDot={{ r: 8 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  // Render bar chart
  const renderBarChart = (chartData) => {
    if (chartData.length === 0) return null;
    
    if (groupBy === 'token_type') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_bucket" tickFormatter={(value) => formatDate(value, granularity)} />
            <YAxis />
            <Tooltip 
              formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} 
            />
            <Legend />
            <Bar dataKey="input_tokens" name="Input Tokens" fill={COLORS[0]} />
            <Bar dataKey="output_tokens" name="Output Tokens" fill={COLORS[1]} />
            <Bar dataKey="reasoning_tokens" name="Reasoning Tokens" fill={COLORS[2]} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (groupBy === 'model' || groupBy === 'api_key') {
      const groupKeyName = groupBy === 'model' ? 'Model' : 'API Key';
      // Extract group keys from chartData (ensures all groups are included)
      const firstDataItem = chartData[0];
      const groupKeys = Object.keys(firstDataItem).filter(key => key !== 'time_bucket' && key.endsWith('_total')).map(key => key.replace('_total', ''));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time_bucket" tickFormatter={(value) => formatDate(value, granularity)} />
            <YAxis />
            <Tooltip 
              formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} 
            />
            <Legend />
            {groupKeys.map((group, index) => (
              <Bar 
                key={group} 
                dataKey={`${group}_total`} 
                name={`${groupKeyName}: ${group}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  // Render pie chart using aggregated data
  const renderPieChart = () => {
    if (groupBy === 'token_type') {
      const totalData = aggregatedData.reduce((acc, item) => {
        acc.input_tokens += item.data.input_tokens || 0;
        acc.output_tokens += item.data.output_tokens || 0;
        acc.reasoning_tokens += item.data.reasoning_tokens || 0;
        return acc;
      }, { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0 });

      const pieData = [
        { name: 'Input Tokens', value: dimension === 'cost' ? (totalData.input_tokens * 0.000001) : totalData.input_tokens },
        { name: 'Output Tokens', value: dimension === 'cost' ? (totalData.output_tokens * 0.000002) : totalData.output_tokens },
        { name: 'Reasoning Tokens', value: dimension === 'cost' ? (totalData.reasoning_tokens * 0.000002) : totalData.reasoning_tokens }
      ];

      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (groupBy === 'model' || groupBy === 'api_key') {
      const totals = {};
      aggregatedData.forEach(bucketItem => {
        Object.entries(bucketItem.data).forEach(([groupKey, groupData]) => {
          if (!totals[groupKey]) {
            totals[groupKey] = { input_tokens: 0, output_tokens: 0, reasoning_tokens: 0 };
          }
          totals[groupKey].input_tokens += groupData.input_tokens || 0;
          totals[groupKey].output_tokens += groupData.output_tokens || 0;
          totals[groupKey].reasoning_tokens += groupData.reasoning_tokens || 0;
        });
      });

      const pieData = Object.entries(totals).map(([key, val]) => ({
        name: key,
        value: getValue(val) // Use getValue to compute based on dimension
      }));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => dimension === 'cost' ? `$${value.toFixed(2)}` : value.toLocaleString()} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    return null;
  };

  // Render data table (detailed view) using aggregated data
  const renderTable = () => {
    if (aggregatedData.length === 0) {
      return <div className="text-center p-8">No data to display</div>;
    }

    if (groupBy === 'token_type') {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Bucket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Input Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Output Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reasoning Tokens</th>
                {dimension === 'cost' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Cost (Approx)</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {aggregatedData.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(item.time_bucket, granularity)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.data.input_tokens.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.data.output_tokens.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.data.reasoning_tokens.toLocaleString()}</td>
                  {dimension === 'cost' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      ${((item.data.input_tokens * 0.000001) + (item.data.output_tokens * 0.000002) + (item.data.reasoning_tokens * 0.000002)).toFixed(6)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (groupBy === 'model' || groupBy === 'api_key') {
      const groupName = groupBy === 'model' ? 'Model' : 'API Key';
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time Bucket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{groupName}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Input Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Output Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reasoning Tokens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Call Count</th>
                {dimension === 'cost' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Input Cost</th>
                )}
                {dimension === 'cost' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Output Cost</th>
                )}
                {dimension === 'cost' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reasoning Cost</th>
                )}
                {dimension === 'cost' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total Cost</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {aggregatedData.flatMap((bucketItem, bucketIndex) => 
                Object.entries(bucketItem.data).map(([groupKey, groupData]) => (
                  <tr key={`${bucketIndex}-${groupKey}`} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDate(bucketItem.time_bucket, granularity)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{groupKey}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{groupData.input_tokens.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{groupData.output_tokens.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{groupData.reasoning_tokens.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{groupData.call_count.toLocaleString()}</td>
                    {dimension === 'cost' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        ${(groupBy === 'model' 
                          ? parseFloat(computeCost(groupData.input_tokens, 'input', groupKey)) 
                          : (groupData.input_tokens * 0.000001)).toFixed(6)}
                      </td>
                    )}
                    {dimension === 'cost' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        ${(groupBy === 'model' 
                          ? parseFloat(computeCost(groupData.output_tokens, 'output', groupKey)) 
                          : (groupData.output_tokens * 0.000002)).toFixed(6)}
                      </td>
                    )}
                    {dimension === 'cost' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        ${(groupBy === 'model' 
                          ? parseFloat(computeCost(groupData.reasoning_tokens, 'reasoning', groupKey)) 
                          : (groupData.reasoning_tokens * 0.000002)).toFixed(6)} // Assuming reasoning uses output rate; adjust if needed
                      </td>
                    )}
                    {dimension === 'cost' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        ${(groupBy === 'model' 
                          ? (parseFloat(computeCost(groupData.input_tokens, 'input', groupKey)) + 
                             parseFloat(computeCost(groupData.output_tokens, 'output', groupKey)) + 
                             parseFloat(computeCost(groupData.reasoning_tokens, 'reasoning', groupKey))) 
                          : ((groupData.input_tokens * 0.000001) + (groupData.output_tokens * 0.000002) + (groupData.reasoning_tokens * 0.000002))).toFixed(6)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  // Main render function for analytics content
  const renderAnalytics = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 font-medium">Loading analytics data...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700 text-sm shadow-md">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h12.876c1.684 0 3.062-1.378 3.062-3.078V8.078c0-1.7-1.378-3.078-3.062-3.078H5.062C3.378 5 2 6.378 2 8.078v8.844c0 1.7 1.378 3.078 3.062 3.078z" />
          </svg>
          {error} Please try refreshing the page or contact support.
        </div>
      );
    }
    
    if (aggregatedData.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">
          No data available for the selected filters.
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {renderGraph()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Usage Analytics</h2>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => handleViewTypeChange('bar')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'bar' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Bar
            </button>
            <button
              onClick={() => handleViewTypeChange('line')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'line' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Line
            </button>
            <button
              onClick={() => handleViewTypeChange('pie')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'pie' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pie
            </button>
            <button
              onClick={() => handleViewTypeChange('table')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${viewType === 'table' ? 'bg-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Table
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={timeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        <select
          value={granularity}
          onChange={(e) => handleGranularityChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <select
          value={groupBy}
          onChange={(e) => handleGroupByChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="model">Group by Model</option>
          <option value="api_key">Group by API Key</option>
          <option value="token_type">Group by Token Type</option>
        </select>
        <select
          value={dimension}
          onChange={(e) => handleDimensionChange(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="tokens">Dimension: Tokens</option>
          <option value="cost">Dimension: Cost</option>
        </select>
      </div>
      
      {renderAnalytics()}
    </div>
  );
}