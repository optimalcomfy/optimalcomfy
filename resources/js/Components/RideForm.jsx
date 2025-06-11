import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, Users, CarIcon } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

export default function RideForm() {
  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const suggestionRef = useRef(null);
  const modalRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isMobile]);

  // Fetch location suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.location.length < 3) {
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
      if (modalRef.current && !modalRef.current.contains(event.target) && isMobile) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

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

    // Close modal on mobile after search
    if (isMobile) {
      setIsModalOpen(false);
    }

    router.get('/search-cars', {
      location,
      checkIn,
      checkOut,
      guests,
      searchMode: 'properties',
    });
  };

  const openSearchModal = () => {
    if (isMobile) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Desktop search bar (original design)
  const DesktopSearchBar = () => (
    <div className="search-container desktop-search">
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
            className='inputType formForm'
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
          <p className="field-label absolute text-xs">Pick up date</p>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            placeholder="Add dates"
            className='inputType formForm'
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Check out */}
        <div className="check-out relative">
          <p className="field-label absolute text-xs">Drop date</p>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            placeholder="Add dates"
            className='inputType formForm'
            min={formData.checkIn}
          />
        </div>

        {/* Guests */}
        <div className="guests relative">
          <p className="field-label absolute text-xs">Ride type</p>
          <input
            type="text"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            placeholder="Add guests"
            className='inputType formForm'
          />
          <button className="search-button" onClick={handleSubmit}>
            <Search size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile search trigger button
  const MobileSearchTrigger = () => (
    <div className="mobile-search-trigger" onClick={openSearchModal}>
      <div className="search-trigger-content">
        <Search size={20} className="search-trigger-icon" />
        <div className="search-trigger-text">
          <span className="search-trigger-title">Where to?</span>
          <span className="search-trigger-subtitle">Anywhere • Any week • Add guests</span>
        </div>
      </div>
    </div>
  );

  // Mobile search modal
  const MobileSearchModal = () => (
    <div className={`mobile-search-modal mb-2 ${isModalOpen ? 'active' : ''}`}>
      <div className="modal-overlay" onClick={closeModal}></div>
      <div className="modal-content" ref={modalRef}>
        {/* Modal Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={closeModal}>
            <X size={24} />
          </button>
          <h2 className="modal-title">Search Properties</h2>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="mobile-search-fields">
            {/* Location Field */}
            <div className="mobile-field-group" ref={suggestionRef}>
              <label className="mobile-field-label">
                <MapPin size={20} />
                <span>Where</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Search destinations"
                  className='formForm'
                  onFocus={() => {
                    if (locationSuggestions.length > 0) setIsSuggestionsOpen(true);
                  }}
                />
                {formData.location && (
                  <X className="clear-icon" onClick={() => setFormData(prev => ({ ...prev, location: '' }))} />
                )}
                {isLoadingSuggestions && <Loader2 className="loader-icon animate-spin" />}
              </div>
              {isSuggestionsOpen && (
                <ul className="mobile-suggestions-dropdown">
                  {locationSuggestions.map((loc, i) => (
                    <li key={i} onClick={() => handleLocationSelect(loc)}>
                      <MapPin size={16} />
                      <span>{loc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Check-in Field */}
            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Pick up date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className='formForm'
                />
              </div>
            </div>

            {/* Check-out Field */}
            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Drop date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  min={formData.checkIn}
                  className='formForm'
                />
              </div>
            </div>

            {/* Guests Field */}
            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <CarIcon size={20} />
                <span>Ride types</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  placeholder="Add guests"
                  className='formForm'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer gap-8">
          <button className="modal-clear-btn" onClick={() => setFormData({ location: '', checkIn: '', checkOut: '', guests: '' })}>
            Clear all
          </button>
          <button className="modal-search-btn flex items-center gap-4" onClick={handleSubmit}>
            <Search size={20} />
            Search
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Show desktop search on larger screens */}
      {!isMobile && <DesktopSearchBar />}
      
      {/* Show mobile trigger on mobile screens */}
      {isMobile && <MobileSearchTrigger />}
      
      {/* --- MODIFIED LINE --- */}
      {/* Mobile search modal - Render only when it is open */}
      {isMobile && isModalOpen && <MobileSearchModal />}
    </>
  );
}
