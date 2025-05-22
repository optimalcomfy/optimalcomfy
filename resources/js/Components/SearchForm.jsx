import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import DatePicker from 'react-datepicker';
import { Search, Calendar, Users, ChevronDown, X, Loader2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './SearchForm.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SearchForm() {
  const [formData, setFormData] = useState({
    location: '',
    checkIn: null,
    checkOut: null,
    adult: '1',
    child: '0',
  });

  const [dateRange, setDateRange] = useState([null, null]);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState('properties');
  const suggestionRef = useRef(null);

  useEffect(() => {
    const [start, end] = dateRange;
    setFormData(prev => ({
      ...prev,
      checkIn: start,
      checkOut: end,
    }));
  }, [dateRange]);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.location) {
      toast.error("Please enter a location");
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    const formattedData = {
      ...formData,
      checkIn: formData.checkIn.toISOString().split('T')[0],
      checkOut: formData.checkOut.toISOString().split('T')[0],
      searchMode,
    };

    router.get('/all-properties', formattedData);
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({ ...prev, location: loc }));
    setIsSuggestionsOpen(false);
  };

  const clearField = (field) => {
    if (field === 'dates') {
      setDateRange([null, null]);
    } else {
      setFormData(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="search-form-container max-w-6xl">
        <div className="search-fields">
          {/* Location */}
          <div className="field-group" ref={suggestionRef}>
            <label>Where are you going?</label>
            <div className="field-input">
              <Search className="icon" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Search location"
                autoComplete="off"
                onFocus={() => {
                  if (locationSuggestions.length > 0) setIsSuggestionsOpen(true);
                }}
              />
              {formData.location && <X className="clear-icon" onClick={() => clearField('location')} />}
              {isLoadingSuggestions && <Loader2 className="loader-icon" />}
            </div>
            {isSuggestionsOpen && (
              <ul className="suggestions-list">
                {locationSuggestions.map((loc, i) => (
                  <li key={i} onClick={() => handleLocationSelect(loc)}>{loc}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Date Range Picker */}
          <div className="field-group">
            <label>Dates</label>
            <div className="field-input">
              <Calendar className="icon" />
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
                placeholderText="Select your stay dates"
                className="datepicker-input"
                isClearable
              />
              {(formData.checkIn || formData.checkOut) && (
                <X className="clear-icon" onClick={() => clearField('dates')} />
              )}
            </div>
          </div>

          {/* Guests */}
          <div className="field-group">
            <label>Guests</label>
            <div className="field-input">
              <Users className="icon" />
              <select name="adult" value={formData.adult} onChange={handleChange} className="select-input">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Adult{n > 1 ? 's' : ''}</option>)}
              </select>
              <select name="child" value={formData.child} onChange={handleChange} className="select-input">
                {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n} Child{n > 1 ? 'ren' : ''}</option>)}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-container">
            <button className="submit-button" onClick={handleSubmit}>Search</button>
          </div>
        </div>
      </div>
    </>
  );
}
