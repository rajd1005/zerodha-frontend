"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Target, TrendingDown, Activity } from 'lucide-react';

export default function TradePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  
  // Trade Form State
  const [transactionType, setTransactionType] = useState('BUY');
  const [product, setProduct] = useState('MIS');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  
  // Advanced Features State
  const [targetPoints, setTargetPoints] = useState('');
  const [slPoints, setSlPoints] = useState('');
  const [trailPoints, setTrailPoints] = useState('');
  
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/data/search?query=${searchQuery}&exchange=NFO`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSearchResults(res.data);
        } catch (error) {
          console.error("Search error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, API_URL]);

  const handleSelectSymbol = (instrument) => {
    setSelectedSymbol(instrument);
    setSearchQuery(instrument.tradingsymbol);
    setSearchResults([]);
  };

  const handlePunchTrade = async (e) => {
    e.preventDefault();
    if (!selectedSymbol) return alert("Please search and select a symbol first.");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        exchange: selectedSymbol.exchange,
        symbol: selectedSymbol.tradingsymbol,
        instrumentToken: selectedSymbol.instrument_token,
        transactionType,
        quantity: Number(quantity),
        product,
        orderType,
        price: Number(price) || 0,
        targetPoints: Number(targetPoints) || undefined,
        slPoints: Number(slPoints) || undefined,
        trailPoints: Number(trailPoints) || undefined
      };

      const res = await axios.post(`${API_URL}/trades/place`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(res.data.message);
      
      // Reset Form
      setSearchQuery(''); setSelectedSymbol(null);
      setQuantity(1); setPrice(''); setTargetPoints(''); setSlPoints(''); setTrailPoints('');
      
    } catch (error) {
      alert("Trade Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Send className="text-blue-600" /> Execute Trade
      </h2>

      {/* Auto Search Bar */}
      <div className="relative mb-6 z-10">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
             setSearchQuery(e.target.value);
             if(selectedSymbol) setSelectedSymbol(null); // Clear selection if user types
          }}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
          placeholder="Search Symbol (e.g. NIFTY24APR22500CE)"
        />
        {isSearching && <div className="absolute right-4 top-4 text-xs text-blue-600 font-bold">Searching...</div>}
        
        {/* Search Dropdown */}
        {searchResults.length > 0 && !selectedSymbol && (
          <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-20">
            {searchResults.map((item) => (
              <div 
                key={item.instrument_token} 
                onClick={() => handleSelectSymbol(item)}
                className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition"
              >
                <p className="font-bold text-gray-900">{item.tradingsymbol}</p>
                <p className="text-xs text-gray-500">{item.exchange} • Lot Size: {item.lot_size}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handlePunchTrade} className="flex flex-col gap-6">
        
        {/* Buy / Sell Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button type="button" onClick={() => setTransactionType('BUY')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${transactionType === 'BUY' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500'}`}>BUY</button>
          <button type="button" onClick={() => setTransactionType('SELL')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${transactionType === 'SELL' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500'}`}>SELL</button>
        </div>

        {/* Basic Order Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 ml-1 font-medium">Quantity</label>
            <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900" />
          </div>
          <div>
            <label className="text-xs text-gray-500 ml-1 font-medium">Product</label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 appearance-none">
              <option value="MIS">MIS (Intraday)</option>
              <option value="NRML">NRML (Overnight)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 ml-1 font-medium">Order Type</label>
            <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 appearance-none">
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 ml-1 font-medium">Price (If Limit)</label>
            <input type="number" disabled={orderType === 'MARKET'} value={price} onChange={(e) => setPrice(e.target.value)} className={`w-full mt-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900 ${orderType === 'MARKET' ? 'bg-gray-100 opacity-50' : 'bg-white'}`} placeholder="0.00" />
          </div>
        </div>

        {/* Advanced Section: Targets & Trailing */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600"/> Advanced Settings (Point-Wise)</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-green-500" />
              <input type="number" placeholder="Target (Points)" value={targetPoints} onChange={(e) => setTargetPoints(e.target.value)} className="flex-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <input type="number" placeholder="Stop Loss (Points)" value={slPoints} onChange={(e) => setSlPoints(e.target.value)} className="flex-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
            </div>

            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-500" />
              <input type="number" placeholder="Trailing SL (Points)" value={trailPoints} onChange={(e) => setTrailPoints(e.target.value)} className="flex-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm text-gray-900" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !selectedSymbol}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition flex justify-center items-center ${
            !selectedSymbol ? 'bg-gray-400 cursor-not-allowed' : transactionType === 'BUY' ? 'bg-blue-600 shadow-blue-200' : 'bg-red-600 shadow-red-200'
          }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
             `Punch ${transactionType} Trade`
          )}
        </button>

      </form>
    </div>
  );
}
