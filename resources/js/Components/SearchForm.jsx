import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Loader2, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

export default function SearchBar() {
  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const suggestionRef = useRef(null);

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.location.length < 2) {
        setLocationSuggestions([]);
        return;
      }
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/locations?query=${encodeURIComponent(formData.location)}`);
        const data = await res.json();
        setLocationSuggestions(data);
        setIsSuggestionsOpen(data.length > 0);
      } catch (err) {
        console.error(err);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [formData.location]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({ ...prev, location: loc }));
    setIsSuggestionsOpen(false);
  };

  const handleSubmit = () => {
    const { location, checkIn, checkOut, guests } = formData;

    if (!location) {
      toast.error("Please enter a location");
      return;
    }
    if (!checkIn || !checkOut) {
      toast.error("Please provide check-in and check-out dates");
      return;
    }

    router.get('/all-properties', {
      location,
      checkIn,
      checkOut,
      guests,
      searchMode: 'properties',
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="search-container">
        <div className="bar" ref={suggestionRef}>
          {/* Location */}
          <div className="location relative">
            <p className="field-label absolute text-xs">Where</p>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Search destination"
              className='inputType'
              onFocus={() => {
                if (locationSuggestions.length > 0) setIsSuggestionsOpen(true);
              }}
            />
            {formData.location && (
              <X className="clear-icon" onClick={() => setFormData(prev => ({ ...prev, location: '' }))} />
            )}
            {isLoadingSuggestions && <Loader2 className="loader-icon" />}
            {isSuggestionsOpen && (
              <ul className="suggestions-dropdown">
                {locationSuggestions.map((loc, i) => (
                  <li key={i} onClick={() => handleLocationSelect(loc)}>{loc}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Check in */}
          <div className="check-in relative">
            <p className="field-label absolute text-xs">Check in</p>
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              placeholder="Add dates"
              className='inputType'
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Check out */}
          <div className="check-out relative">
            <p className="field-label absolute text-xs">Check out</p>
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              placeholder="Add dates"
              className='inputType'
              min={formData.checkIn}
            />
          </div>

          {/* Guests */}
          <div className="guests relative">
            <p className="field-label absolute text-xs">Guests</p>
            <input
              type="text"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              placeholder="Add guests"
              className='inputType'
            />
            <button className="search-button" onClick={handleSubmit}>
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
