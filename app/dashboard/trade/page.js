"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Send, Target, TrendingDown, Activity, List, X } from 'lucide-react';

export default function TradePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  
  // States for LTP and Option Chain
  const [liveLtp, setLiveLtp] = useState(null);
  const [optionChain, setOptionChain] = useState(null);
  const [chainLtps, setChainLtps] = useState({});
  const [showChain, setShowChain] = useState(false);
  
  // Trade Form State
  const [transactionType, setTransactionType] = useState('BUY');
  const [product, setProduct] = useState('MIS');
  const [orderType, setOrderType] = useState('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  
  const [targetPoints, setTargetPoints] = useState('');
  const [slPoints, setSlPoints] = useState('');
  const [trailPoints, setTrailPoints] = useState('');
  
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3 && !selectedSymbol) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`${API_URL}/data/search?query=${searchQuery}&exchange=ALL`, {
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
  }, [searchQuery, API_URL, selectedSymbol]);

  // Live LTP Polling for Selected Symbol
  useEffect(() => {
    let interval;
    if (selectedSymbol && !showChain) {
      const fetchLtp = async () => {
        try {
          const token = localStorage.getItem('token');
          const instrumentString = `${selectedSymbol.exchange}:${selectedSymbol.tradingsymbol}`;
          const res = await axios.get(`${API_URL}/data/ltp?instruments=${instrumentString}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data && res.data[instrumentString]) {
            setLiveLtp(res.data[instrumentString].last_price);
          }
        } catch (e) { }
      };
      fetchLtp();
      interval = setInterval(fetchLtp, 2000); 
    }
    return () => clearInterval(interval);
  }, [selectedSymbol, showChain]);

  // Live LTP Polling for Option Chain
  useEffect(() => {
    let interval;
    if (showChain && optionChain && optionChain.chain) {
      const fetchChainLtp = async () => {
        try {
          const token = localStorage.getItem('token');
          let instruments = [];
          
          // Only fetch LTP for the visible chain items
          displayChain.forEach(row => {
            if(row.CE) instruments.push(`${row.CE.exchange}:${row.CE.tradingsymbol}`);
            if(row.PE) instruments.push(`${row.PE.exchange}:${row.PE.tradingsymbol}`);
          });
          
          if(instruments.length === 0) return;

          const res = await axios.get(`${API_URL}/data/ltp?instruments=${instruments.join(',')}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChainLtps(res.data);
        } catch (e) { }
      };
      fetchChainLtp();
      interval = setInterval(fetchChainLtp, 2000);
    }
    return () => clearInterval(interval);
  }, [showChain, optionChain]);

  const handleSelectSymbol = (instrument) => {
    setSelectedSymbol(instrument);
    setSearchQuery(instrument.tradingsymbol);
    setSearchResults([]);
    setQuantity(instrument.lot_size || 1); 
    setLiveLtp(null);
    setShowChain(false);
  };

  const loadOptionChain = async () => {
    if (!selectedSymbol || !selectedSymbol.name) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/data/option-chain?symbol=${selectedSymbol.name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.chain && res.data.chain.length > 0) {
        setOptionChain(res.data);
        setShowChain(true);
      } else {
        alert("No options found for this symbol right now.");
      }
    } catch (e) {
      alert("Failed to load option chain.");
    }
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
      
      setSearchQuery(''); 
      setSelectedSymbol(null); 
      setLiveLtp(null);
      setQuantity(1); 
      setPrice(''); 
      setTargetPoints(''); 
      setSlPoints(''); 
      setTrailPoints('');
      
    } catch (error) {
      alert("Trade Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // CALCULATE ATM AND SLICE +/- 20 STRIKES
  let displayChain = [];
  let atmStrike = null;

  if (optionChain && optionChain.chain && optionChain.chain.length > 0) {
    let chain = optionChain.chain;
    
    if (liveLtp) {
      let minDiff = Infinity;
      let atmIndex = 0;
      
      // Find the At-The-Money (ATM) strike closest to the underlying Live LTP
      chain.forEach((row, idx) => {
        const diff = Math.abs(row.strike - liveLtp);
        if (diff < minDiff) {
          minDiff = diff;
          atmIndex = idx;
          atmStrike = row.strike;
        }
      });

      // Slice to get +/- 20 strikes from ATM
      const startIndex = Math.max(0, atmIndex - 20);
      const endIndex = Math.min(chain.length, atmIndex + 21);
      displayChain = chain.slice(startIndex, endIndex);
    } else {
      displayChain = chain.slice(0, 41); // Fallback if LTP is missing
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Send className="text-blue-600" /> Execute Trade
      </h2>

      {/* Auto Search Bar */}
      <div className="relative mb-6 z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
             setSearchQuery(e.target.value);
             if(selectedSymbol) {
               setSelectedSymbol(null);
               setLiveLtp(null);
               setShowChain(false);
             }
          }}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
          placeholder="Search Symbol (e.g. INFY, NIFTY24APR22500CE)"
        />
        {isSearching && <div className="absolute right-4 top-4 text-xs text-blue-600 font-bold">Searching...</div>}
        
        {/* Search Dropdown */}
        {searchResults.length > 0 && !selectedSymbol && (
          <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-30">
            {searchResults.map((item) => (
              <div 
                key={item.instrument_token} 
                onClick={() => handleSelectSymbol(item)}
                className="p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900">{item.tradingsymbol}</p>
                  <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold">{item.exchange}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Lot Size: {item.lot_size}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Symbol Info & Option Chain Button */}
      {selectedSymbol && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-600 font-bold">{selectedSymbol.tradingsymbol}</p>
            <p className="text-xl font-black text-gray-900 mt-1">
              {liveLtp ? `₹${liveLtp.toFixed(2)}` : 'Fetching LTP...'}
            </p>
          </div>
          {!selectedSymbol.tradingsymbol.includes('CE') && !selectedSymbol.tradingsymbol.includes('PE') && (
            <button onClick={loadOptionChain} className="bg-white text-blue-600 px-3 py-2 rounded-xl text-xs font-bold shadow-sm border border-blue-100 flex items-center gap-1 active:scale-95">
              <List className="w-3 h-3"/> Option Chain
            </button>
          )}
        </div>
      )}

      {/* POPUP MODAL: Option Chain UI */}
      {showChain && optionChain && optionChain.chain && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col justify-end">
          <div className="bg-white w-full max-h-[85vh] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gray-900 text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{selectedSymbol.name} Options (+/- 20)</h3>
                <p className="text-xs text-gray-400">Expiry: {optionChain.expiry}</p>
              </div>
              <button onClick={() => setShowChain(false)} className="p-2 bg-gray-800 rounded-full active:scale-95 transition">
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>
            
            {/* Modal Body / Table */}
            <div className="overflow-y-auto flex-1 p-2 pb-10">
              <table className="w-full text-xs text-center border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3 text-green-700 w-1/3">CE LTP</th>
                    <th className="py-3 bg-gray-200 text-gray-900 font-bold border-x w-1/3">Strike</th>
                    <th className="py-3 text-red-700 w-1/3">PE LTP</th>
                  </tr>
                </thead>
                <tbody>
                  {displayChain.map((row) => {
                    const ceLtp = row.CE ? chainLtps[`${row.CE.exchange}:${row.CE.tradingsymbol}`]?.last_price : '-';
                    const peLtp = row.PE ? chainLtps[`${row.PE.exchange}:${row.PE.tradingsymbol}`]?.last_price : '-';
                    const isAtm = row.strike === atmStrike;
                    
                    return (
                      <tr key={row.strike} className={`border-b last:border-0 hover:bg-gray-50 ${isAtm ? 'bg-blue-50/70' : ''}`}>
                        <td className="py-3 text-green-600 font-bold cursor-pointer" onClick={() => { row.CE && handleSelectSymbol(row.CE); }}>
                          {ceLtp}
                        </td>
                        <td className={`py-3 font-bold border-x relative ${isAtm ? 'bg-blue-100 text-blue-900' : 'bg-gray-50 text-gray-800'}`}>
                          {row.strike}
                          {isAtm && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 text-[8px] text-blue-600 uppercase tracking-widest font-black">ATM</span>}
                        </td>
                        <td className="py-3 text-red-600 font-bold cursor-pointer" onClick={() => { row.PE && handleSelectSymbol(row.PE); }}>
                          {peLtp}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trade Form */}
      <form onSubmit={handlePunchTrade} className="flex flex-col gap-6">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button type="button" onClick={() => setTransactionType('BUY')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${transactionType === 'BUY' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500'}`}>BUY</button>
          <button type="button" onClick={() => setTransactionType('SELL')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition ${transactionType === 'SELL' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500'}`}>SELL</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 ml-1 font-medium">Quantity (Lot: {selectedSymbol?.lot_size || 1})</label>
            <input required type="number" min="1" step={selectedSymbol?.lot_size || 1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full mt-1 px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-gray-900" />
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

        <button 
          type="submit" 
          disabled={loading || !selectedSymbol}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition flex justify-center items-center mb-8 ${
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
