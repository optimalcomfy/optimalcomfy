import React, { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, CarIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

// --- COMPONENT DEFINITIONS MOVED OUTSIDE ---

const DesktopSearchBar = ({ 
  formData, 
  handleChange, 
  handleLocationSelect, 
  handleSubmit, 
  isLoadingSuggestions, 
  isSuggestionsOpen, 
  locationSuggestions, 
  suggestionRef,
  inputRef
}) => (
  <div className="search-container desktop-search">
    <div className="bar">
      <div className="location relative" ref={suggestionRef}>
        <p className="field-label absolute text-xs">Where</p>
        <input
          ref={inputRef}
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          onFocus={() => locationSuggestions.length > 0 && setIsSuggestionsOpen(true)}
          placeholder="Search destination"
          className="inputType formForm"
        />
        {formData.location && <X className="clear-icon" onClick={() => handleChange({ target: { name: 'location', value: '' } })} />}
        {isLoadingSuggestions && <Loader2 className="loader-icon animate-spin" />}
        {isSuggestionsOpen && (

          <div className="absolute z-50 w-full bg-white border rounded-sm mt-1 shadow-lg max-h-48 overflow-y-auto">
            {locationSuggestions.length > 0 && locationSuggestions?.map((location, index) => (
              <div
                key={index}
                onClick={() => handleLocationSelect(location, 'pickup_location')}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                {location}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="check-in relative">
        <p className="field-label absolute text-xs">Pick up date</p>
        <input
          type="date"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="inputType formForm"
        />
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Drop date</p>
        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          min={formData.checkIn}
          className="inputType formForm"
        />
      </div>

      <div className="guests relative">
        <p className="field-label absolute text-xs">Ride type</p>
        <input
          type="text"
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          placeholder="Add guests"
          className="inputType formForm"
        />
        <button className="search-button" onClick={handleSubmit}>
          <Search size={16} />
        </button>
      </div>
    </div>
  </div>
);

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

const MobileSearchModal = ({
  isModalOpen,
  closeModal,
  modalRef,
  suggestionRef,
  inputRef,
  formData,
  handleChange,
  handleLocationSelect,
  handleSubmit,
  isLoadingSuggestions,
  isSuggestionsOpen,
  locationSuggestions
}) => (
  <div className={`mobile-search-modal ${isModalOpen ? 'active' : ''}`}>
    <div className="modal-overlay" onClick={closeModal}></div>
    <div className="modal-content" ref={modalRef}>
      <div className="modal-header">
        <button className="modal-close-btn" onClick={closeModal}>
          <X size={24} />
        </button>
        <h2 className="modal-title">Search Properties</h2>
      </div>

      <div className="modal-body">
        <div className="mobile-search-fields">
          <div className="mobile-field-group" ref={suggestionRef}>
            <label className="mobile-field-label">
              <MapPin size={20} />
              <span>Where</span>
            </label>
            <div className="mobile-field-input">
              <input
                ref={inputRef}
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onFocus={() => locationSuggestions.length > 0 && setIsSuggestionsOpen(true)}
                placeholder="Search destinations"
                className="formForm"
              />
              {formData.location && <X className="clear-icon" onClick={() => handleChange({ target: { name: 'location', value: '' } })} />}
              {isLoadingSuggestions && <Loader2 className="loader-icon animate-spin" />}
            </div>
            {isSuggestionsOpen && (
              <ul className="mobile-suggestions-dropdown">
                  {locationSuggestions.length > 0 && locationSuggestions?.map((location, index) => (
                    <div
                      key={index}
                      onClick={() => handleLocationSelect(location, 'destination')}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      {location}
                    </div>
                  ))}
              </ul>
            )}
          </div>

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
                className="formForm"
              />
            </div>
          </div>

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
                className="formForm"
              />
            </div>
          </div>

          <div className="mobile-field-group">
            <label className="mobile-field-label">
              <CarIcon size={20} />
              <span>Ride type</span>
            </label>
            <div className="mobile-field-input">
              <input
                type="text"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                placeholder="Add guests"
                className="formForm"
              />
            </div>
          </div>
        </div>

        <button className="submit-search-btn" onClick={handleSubmit}>
          Search <Search className="ml-2" size={16} />
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN RIDEFORM COMPONENT ---
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
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen && isMobile ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isMobile]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.location.length < 3) {
        setLocationSuggestions([]);
        setIsSuggestionsOpen(false);
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
    const handleClickOutside = (e) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsSuggestionsOpen(false);
      }

      if (modalRef.current && !modalRef.current.contains(e.target) && isMobile) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => ({ ...prev, location: loc }));
    setIsSuggestionsOpen(false);
  };

  const handleSubmit = () => {
    const { location, checkIn, checkOut, guests } = formData;

    if (!location) return toast.error('Please enter a location');
    if (!checkIn || !checkOut) return toast.error('Please provide check-in and check-out dates');

    if (isMobile) setIsModalOpen(false);

    router.get('/search-cars', {
      location,
      checkIn,
      checkOut,
      guests,
      searchMode: 'properties',
    });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {!isMobile ? (
        <DesktopSearchBar
          formData={formData}
          handleChange={handleChange}
          handleLocationSelect={handleLocationSelect}
          handleSubmit={handleSubmit}
          isLoadingSuggestions={isLoadingSuggestions}
          isSuggestionsOpen={isSuggestionsOpen}
          locationSuggestions={locationSuggestions}
          suggestionRef={suggestionRef}
          inputRef={inputRef}
        />
      ) : (
        <>
          <MobileSearchTrigger onClick={openModal} />
          <MobileSearchModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            modalRef={modalRef}
            suggestionRef={suggestionRef}
            inputRef={inputRef}
            formData={formData}
            handleChange={handleChange}
            handleLocationSelect={handleLocationSelect}
            handleSubmit={handleSubmit}
            isLoadingSuggestions={isLoadingSuggestions}
            isSuggestionsOpen={isSuggestionsOpen}
            locationSuggestions={locationSuggestions}
          />
        </>
      )}
    </>
  );
}