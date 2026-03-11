"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ShoppingBag, Trash2, Send } from 'lucide-react';

export default function BasketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [basket, setBasket] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Search Logic
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

  const handleAddToBasket = (instrument) => {
    const newTrade = {
      id: Date.now().toString(),
      exchange: instrument.exchange,
      symbol: instrument.tradingsymbol,
      instrumentToken: instrument.instrument_token,
      transactionType: 'BUY',
      quantity: instrument.lot_size,
      product: 'MIS',
      orderType: 'MARKET',
      price: '',
      targetPoints: '',
      slPoints: '',
      trailPoints: ''
    };
    
    setBasket([...basket, newTrade]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateBasketItem = (id, field, value) => {
    setBasket(basket.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeBasketItem = (id) => {
    setBasket(basket.filter(item => item.id !== id));
  };

  const handlePunchBasket = async () => {
    if (basket.length === 0) return alert("Basket is empty!");
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Clean up the data before sending
      const formattedBasket = basket.map(item => ({
        exchange: item.exchange,
        symbol: item.symbol,
        instrumentToken: item.instrumentToken,
        transactionType: item.transactionType,
        quantity: Number(item.quantity),
        product: item.product,
        orderType: item.orderType,
        price: Number(item.price) || 0,
        targetPoints: Number(item.targetPoints) || undefined,
        slPoints: Number(item.slPoints) || undefined,
        trailPoints: Number(item.trailPoints) || undefined
      }));

      const res = await axios.post(`${API_URL}/trades/basket`, { basket: formattedBasket }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(res.data.message);
      setBasket([]); // Clear basket on success
      
    } catch (error) {
      alert("Basket Execution Failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="text-blue-600" /> Basket Orders
      </h2>

      {/* Auto Search Bar */}
      <div className="relative mb-6 z-20">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
          placeholder="Search and Add to Basket..."
        />
        
        {searchResults.length > 0 && (
          <div className="absolute top-16 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-30">
            {searchResults.map((item) => (
              <div 
                key={item.instrument_token} 
                onClick={() => handleAddToBasket(item)}
                className="p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-900">{item.tradingsymbol}</p>
                  <p className="text-xs text-gray-500">{item.exchange} • Lot Size: {item.lot_size}</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Add</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Basket Items List */}
      <div className="space-y-4 mb-24 z-10 relative">
        {basket.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 text-sm">
            Your basket is empty. Search above to add symbols.
          </div>
        ) : (
          basket.map((item, index) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-50">
                <span className="font-bold text-gray-900">{index + 1}. {item.symbol}</span>
                <button onClick={() => removeBasketItem(item.id)} className="text-red-500 p-1 bg-red-50 rounded-lg active:scale-95"><Trash2 className="w-4 h-4"/></button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select value={item.transactionType} onChange={(e) => updateBasketItem(item.id, 'transactionType', e.target.value)} className={`text-sm font-bold rounded-lg p-2 outline-none ${item.transactionType === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateBasketItem(item.id, 'quantity', e.target.value)} className="bg-gray-50 border rounded-lg p-2 text-sm text-center outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <input type="number" placeholder="Target pt" value={item.targetPoints} onChange={(e) => updateBasketItem(item.id, 'targetPoints', e.target.value)} className="bg-green-50 text-green-700 border border-green-100 placeholder-green-300 rounded-lg p-2 text-xs text-center outline-none" />
                <input type="number" placeholder="SL pt" value={item.slPoints} onChange={(e) => updateBasketItem(item.id, 'slPoints', e.target.value)} className="bg-red-50 text-red-700 border border-red-100 placeholder-red-300 rounded-lg p-2 text-xs text-center outline-none" />
                <input type="number" placeholder="Trail pt" value={item.trailPoints} onChange={(e) => updateBasketItem(item.id, 'trailPoints', e.target.value)} className="bg-orange-50 text-orange-700 border border-orange-100 placeholder-orange-300 rounded-lg p-2 text-xs text-center outline-none" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sticky Execution Button */}
      {basket.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-6 z-40">
           <button 
            onClick={handlePunchBasket}
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-300 active:scale-95 transition flex justify-center items-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Send className="w-5 h-5"/> Execute Full Basket</>}
          </button>
        </div>
      )}
    </div>
  );
}
