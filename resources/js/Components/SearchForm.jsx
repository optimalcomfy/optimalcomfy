import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, Users } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

// --- COMPONENT DEFINITIONS MOVED OUTSIDE ---



// Desktop Search Bar Component
const DesktopSearchBar = ({ formData, handleChange, handleLocationSelect, handleSubmit, isLoadingSuggestions, isSuggestionsOpen, setIsSuggestionsOpen, locationSuggestions, suggestionRef }) => (
  <div className="search-container desktop-search">
    <div className="bar" ref={suggestionRef}>
      {/* Location */}
      <div className="location relative">
        <p className="field-label absolute text-xs">Where to Ristay?</p>
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
          <X className="clear-icon" onClick={() => handleChange({ target: { name: 'location', value: '' } })} />
        )}
        {isLoadingSuggestions && <Loader2 className="loader-icon" />}
        {isSuggestionsOpen && (
          <div style={{borderRadius: '0px'}} className="mini absolute z-50 w-full bg-white border mt-1 shadow-lg max-h-48 overflow-y-auto">
            {locationSuggestions.length > 0 && locationSuggestions?.map((location, index) => (
              <div
                key={index}
                onClick={() => handleLocationSelect(location, 'destination')}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                {location}
              </div>
            ))}
          </div>
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
          className='inputType formForm'
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
          className='inputType formForm'
          min={formData.checkIn}
        />
      </div>

      {/* Guests */}
      <div className="guests flex items-center relative">
        <button className="search-button" onClick={handleSubmit}>
          <Search size={16} />
        </button>
      </div>
    </div>
  </div>
);

// Mobile Search Trigger Component
const MobileSearchTrigger = ({ onClick }) => (
  <div className="mobile-search-trigger" onClick={onClick}>
    <div className="search-trigger-content">
      <Search size={20} className="search-trigger-icon" />
      <div className="search-trigger-text">
        <span className="search-trigger-title">Where to?</span>
        <span className="search-trigger-subtitle">Anywhere • Any week • Add guests</span>
      </div>
    </div>
  </div>
);

// Mobile Search Modal Component
const MobileSearchModal = ({
  isModalOpen,
  closeModal,
  modalRef,
  suggestionRef,
  formData,
  handleChange,
  handleLocationSelect,
  handleSubmit,
  setFormData,
  isSuggestionsOpen,
  setIsSuggestionsOpen,
  locationSuggestions,
  isLoadingSuggestions
}) => (
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
          <div className="relative w-full" ref={suggestionRef}>
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <MapPin size={18} />
              <span>Where to Ristay?</span>
            </label>

            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Search destinations"
                onFocus={() => {
                  if (locationSuggestions.length > 0) setIsSuggestionsOpen(true);
                }}
                className="w-full border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-none"
              />

              {formData.location && (
                <X
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  size={18}
                  onClick={() =>
                    handleChange({ target: { name: 'location', value: '' } })
                  }
                />
              )}

              {isLoadingSuggestions && (
                <Loader2 className="absolute top-1/2 right-10 transform -translate-y-1/2 text-gray-400 animate-spin" size={18} />
              )}
            </div>

            {isSuggestionsOpen && (
              <div style={{borderRadius: '0px'}} className="absolute w-full bg-white border border-gray-300 rounded-none mt-1 shadow-md max-h-48 overflow-y-auto z-50">
                {locationSuggestions.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => handleLocationSelect(location, 'destination')}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  >
                    {location}
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Other fields... */}
          <div className="mobile-field-group">
            <label className="mobile-field-label"><Calendar size={20} /><span>Check in</span></label>
            <div className="mobile-field-input">
              <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} min={new Date().toISOString().split("T")[0]} className='formForm' />
            </div>
          </div>
          <div className="mobile-field-group">
            <label className="mobile-field-label"><Calendar size={20} /><span>Check out</span></label>
            <div className="mobile-field-input">
              <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} min={formData.checkIn} className='formForm' />
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


// --- MAIN SEARCHBAR COMPONENT ---
export default function SearchBar() {
  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState(['Nairobi CBD', 'JKIA Airport', 'Westlands', 'Karen', 'Kilimani']);
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

    if (isMobile) {
      setIsModalOpen(false);
    }

    router.get('/all-properties', {
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



  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {!isMobile && (
        <DesktopSearchBar
          formData={formData}
          handleChange={handleChange}
          handleLocationSelect={handleLocationSelect}
          handleSubmit={handleSubmit}
          isLoadingSuggestions={isLoadingSuggestions}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          locationSuggestions={locationSuggestions}
          suggestionRef={suggestionRef}
        />
      )}
      
      {isMobile && <MobileSearchTrigger onClick={openSearchModal} />}
      
      {isMobile && isModalOpen && (
        <MobileSearchModal
          isModalOpen={isModalOpen}
          closeModal={closeModal}
          modalRef={modalRef}
          suggestionRef={suggestionRef}
          formData={formData}
          handleChange={handleChange}
          handleLocationSelect={handleLocationSelect}
          handleSubmit={handleSubmit}
          setFormData={setFormData}
          isSuggestionsOpen={isSuggestionsOpen}
          setIsSuggestionsOpen={setIsSuggestionsOpen}
          locationSuggestions={locationSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
        />
      )}
    </>
  );
}
