import React, { useState, useRef, useEffect } from 'react';
import { Search, ArrowLeftRight } from 'lucide-react';
import airportsData from './airports.json';
import { FlightSearch, FlightResults } from './Results';
import {Dropdown, DropdownButton} from 'react-bootstrap';
import bannerImage from './images/DC3.webp';

const airports = airportsData.map(airport => ({
  code: airport.IATA,
  name: airport.AIRPORT,
  city: airport.CITY
}));

export default function SearchBar() {
  const [tripType, setTripType] = useState('roundtrip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cabinClass, setCabinClass] = useState('economy');
  
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  const [routes, setRoutes] = useState({ outbound: [], return: [] });
  const [showRoutes, setShowRoutes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('outbound'); // 'outbound' or 'return'
  
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // Filter airports based on search query
  const filterAirports = (query) => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return airports.filter(airport => 
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery)
    ).slice(0, 5); // Limit to 5 suggestions
  };

  // Handle from field changes
  const handleFromChange = (value) => {
    setFrom(value);
    const suggestions = filterAirports(value);
    setFromSuggestions(suggestions);
    setShowFromSuggestions(suggestions.length > 0);
  };

  // Handle to field changes
  const handleToChange = (value) => {
    setTo(value);
    const suggestions = filterAirports(value);
    setToSuggestions(suggestions);
    setShowToSuggestions(suggestions.length > 0);
  };

  // Select airport from suggestions
  const selectFromAirport = (airport) => {
    setFrom(`${airport.city} (${airport.code})`);
    setShowFromSuggestions(false);
  };

  const selectToAirport = (airport) => {
    setTo(`${airport.city} (${airport.code})`);
    setShowToSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSearch() {
    console.log({ tripType, from, to, departDate, returnDate, cabinClass });
    // Implement search functionality here
    setLoading(true);
    setShowRoutes(false);
    setViewType('outbound'); // Reset to outbound view

     try {
      const searchResults = await FlightSearch({
        from,
        to,
        tripType,
        departDate,
        returnDate,
        cabinClass
      });
      
      setRoutes(searchResults);
      setTimeout(() => setShowRoutes(true), 100);
    } catch (error) {
      console.error('Search failed:', error);
      alert(error.message || 'Failed to fetch flight data. Please try again.');
      setRoutes({ outbound: [], return: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="w-full min-h-screen">
      {/* Banner Background */}

      <div 
        className="w-full h-96 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${bannerImage})`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat' }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-500 bg-opacity-65"></div>
        
        {/* Content over banner */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-20">
          <h1 className="text-5xl font-bold text-white mb-4 text-center">
            Find Your Perfect Flight
          </h1>
          <p className="text-xl text-white mb-8 text-center">
            Search and compare flights to get the best deals
          </p>

          <div className="w-full max-w-6xl mx-auto p-4">
            {/* Top Controls */}
            <div className="flex gap-4 mb-4">
              <div className="relative">
                <DropdownButton
                  id="trip-type-dropdown"
                  title={tripType === 'roundtrip' ? 'Round-trip' : 'One-way'}
                  variant="light"
                  onSelect={(value) => setTripType(value)}
                >
                  <Dropdown.Item eventKey="roundtrip">Round-trip</Dropdown.Item>
                  <Dropdown.Item eventKey="oneway">One-way</Dropdown.Item>
                </DropdownButton>
              </div>

              <div className="relative">
                <DropdownButton
                  id="cabin-class-dropdown"
                  title={
                    cabinClass === 'economy' ? 'Economy' :
                    cabinClass === 'premium' ? 'Premium Economy' :
                    cabinClass === 'business' ? 'Business' :
                    'First Class'
                  }
                  variant="light"
                  onSelect={(value) => setCabinClass(value)}
                >
                  <Dropdown.Item eventKey="economy">Economy</Dropdown.Item>
                  <Dropdown.Item eventKey="premium">Premium Economy</Dropdown.Item>
                  <Dropdown.Item eventKey="business">Business</Dropdown.Item>
                  <Dropdown.Item eventKey="first">First Class</Dropdown.Item>
                </DropdownButton>
              </div>
            </div>

            {/* Main Search Bar */}
            <div className="bg-white rounded-lg shadow-lg overflow-visible relative">
              <div className="flex items-stretch">
                {/* From Field */}
                <div className="flex-1 px-4 py-3 relative" ref={fromRef}>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <input
                    type="text"
                    value={from}
                    onChange={(e) => handleFromChange(e.target.value)}
                    onFocus={() => {
                      if (from) {
                        const suggestions = filterAirports(from);
                        setFromSuggestions(suggestions);
                        setShowFromSuggestions(suggestions.length > 0);
                      }
                    }}
                    placeholder="From?"
                    className="w-full text-lg font-medium outline-none text-gray-800 placeholder-gray-400"
                  />
                  {from && (
                    <button
                      onClick={() => {
                        setFrom('');
                        setShowFromSuggestions(false);
                      }}
                      className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                    >
                      ×
                    </button>
                  )}
                  </div>

                  {/* From Suggestions Dropdown */}
                  {showFromSuggestions && fromSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1">
                      {fromSuggestions.map((airport) => (
                        <div
                          key={airport.code}
                          onClick={() => selectFromAirport(airport)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800">{airport.city}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                            <div className="text-gray-600 font-semibold">{airport.code}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px bg-gray-200 h-12"></div>
                </div>

                {/* Swap Button */}
                <div className="flex items-center justify-center px-2">
                  <button
                    onClick={() => {
                      const temp = from;
                      setFrom(to);
                      setTo(temp);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeftRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px bg-gray-200 h-12"></div>
                </div>

                {/* To Field */}
                <div className="flex-1 px-4 py-3 relative" ref={toRef}>
                  <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => handleToChange(e.target.value)}
                      onFocus={() => {
                        if (to) {
                          const suggestions = filterAirports(to);
                          setToSuggestions(suggestions);
                          setShowToSuggestions(suggestions.length > 0);
                        }
                      }}
                      placeholder="To?"
                      className="w-full text-lg font-medium outline-none text-gray-800 placeholder-gray-400"
                    />
                    {to && (
                      <button
                        onClick={() => {
                          setTo('');
                          setShowToSuggestions(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  
                  {/* To Suggestions Dropdown */}
                  {showToSuggestions && toSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1">
                      {toSuggestions.map((airport) => (
                        <div
                          key={airport.code}
                          onClick={() => selectToAirport(airport)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 border-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-800">{airport.city}</div>
                              <div className="text-sm text-gray-500">{airport.name}</div>
                            </div>
                            <div className="text-gray-600 font-semibold">{airport.code}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Separator */}
                <div className="flex items-center justify-center">
                  <div className="w-px bg-gray-200 h-12"></div>
                </div>

                {/* Date Fields */}
                <div className="flex-1 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="text-xs text-gray-500 mb-1">Departure</div>
                  <input
                    type="date"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                    className="w-full text-lg font-medium outline-none text-gray-800 cursor-pointer"
                    style={{ colorScheme: 'light' }}
                  />
                </div>

                {tripType === 'roundtrip' && (
                  <>
                    {/* Separator */}
                    <div className="flex items-center justify-center">
                      <div className="w-px bg-gray-200 h-12"></div>
                    </div>
                    
                    <div className="flex-1 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="text-xs text-gray-500 mb-1">Return</div>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full text-lg font-medium outline-none text-gray-800 cursor-pointer"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                  </>
                )}

                {/* Search Button */}
                <button
                  style={{ borderRadius: '8px' }}
                  onClick={handleSearch}
                  className="bg-orange-600 hover:bg-orange-700 px-8 flex items-center justify-center transition-colors"
                >
                  <Search className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
        </div>
      </div>
      {/* Flight Results */}
      <FlightResults 
        routes={routes} 
        showRoutes={showRoutes} 
        loading={loading}
        viewType={viewType}
        onViewChange={setViewType}
      /> 
      </div>
    </div>
  );
}
