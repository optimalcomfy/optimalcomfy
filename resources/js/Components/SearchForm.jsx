import React, { useState, useEffect, useRef } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

const DesktopSearchBar = ({ 
  formData, 
  handleChange, 
  handleLocationSelect, 
  handleSubmit, 
  isLoadingSuggestions, 
  isSuggestionsOpen, 
  locationSuggestions, 
  suggestionRef,
  inputRef,
  setIsSuggestionsOpen
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
          onFocus={() => {
            if (formData.location.length > 0 && locationSuggestions.length > 0) {
              setIsSuggestionsOpen(true);
            }
          }}
          placeholder="Search destination"
          className="inputType formForm"
        />
        
        {formData.location &&     
        <X
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          size={18}
          onClick={() => {
            handleChange({ target: { name: 'location', value: '' } });
            setIsSuggestionsOpen(false);
          }}
        />}

        {isLoadingSuggestions && <Loader2 className="loader-icon animate-spin" />}
        {isSuggestionsOpen && (
          <div style={{borderRadius: '0px'}} className="mini absolute z-50 w-full bg-white border mt-1 shadow-lg max-h-48 overflow-y-auto">
            {locationSuggestions.map((location, index) => (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocationSelect(location);
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                {location}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="check-in relative">
        <p className="field-label absolute text-xs">Check in date</p>
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
        <p className="field-label absolute text-xs">Checkout date</p>
        <input
          type="date"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          min={formData.checkIn}
          className="inputType formForm"
        />
      </div>

      <div className="guests flex items-center relative">
        <button className="search-button" onClick={handleSubmit}>
          <Search size={16} />
        </button>
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
  locationSuggestions,
  setIsSuggestionsOpen
}) => {
  const handleTouchMove = (e) => {
    if (isSuggestionsOpen) {
      e.preventDefault();
    }
  };

  const { url } = usePage();
  const [isWhich] = useState(url.split('?')[0]);

  return (
    <div 
      className={`mobile-search-modal ${isModalOpen ? 'active' : ''}`}
      onTouchMove={handleTouchMove}
    >
      <div className="modal-overlay" onClick={closeModal}></div>
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header flex justify-between my-2 border-b border-gray-200">
          <Link 
            href={route('home')} 
            className={`modal-title px-4 py-2 text-lg font-medium ${(isWhich === '/' || isWhich === '/all-properties' || isWhich === '/property-detail' || isWhich === '/login' || isWhich === '/register' || isWhich === '/property-booking' || isWhich === '/privacy-policy' || isWhich === '/host-calendar-policy' || isWhich === '/terms-and-conditions') ? 'text-peachDark border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'} transition duration-150 ease-in-out`}
          >
            Search stays
          </Link>
          <Link 
            href={route('all-cars')} 
            className={`modal-title px-4 py-2 text-lg font-medium ${route().current('all-cars') ? 'text-peachDark border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'} transition duration-150 ease-in-out`}
          >
            Search Rides
          </Link>
        </div>

        <div className="modal-body">
          <div className="mobile-search-fields flex flex-col gap-2">
            <div className="mobile-field-group" ref={suggestionRef}>
              <label className="mobile-field-label">
                <MapPin size={20} />
                <span>Where</span>
              </label>
              <div className="mobile-field-input relative">
                <input
                  ref={inputRef}
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  onFocus={() => {
                    if (formData.location.length > 0) {
                      setIsSuggestionsOpen(true);
                    }
                  }}
                  placeholder="Search destinations"
                  className="rounded-md w-full"
                />
                {formData.location && (
                  <X 
                    className="clear-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChange({ target: { name: 'location', value: '' } });
                      setIsSuggestionsOpen(false);
                    }} 
                  />
                )}
                {isLoadingSuggestions && (
                  <Loader2 className="loader-icon animate-spin absolute right-8 top-1/2 transform -translate-y-1/2" />
                )}
              </div>
              {isSuggestionsOpen && (
                <ul 
                  className="mobile-suggestions-dropdown absolute z-50 w-full bg-white border mt-1 shadow-lg"
                  style={{
                    borderRadius: '0px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {locationSuggestions.length > 0 ? (
                    locationSuggestions.map((location, index) => (
                      <div
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLocationSelect(location);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLocationSelect(location);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 active:bg-gray-200"
                      >
                        {location}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-gray-500">
                      {isLoadingSuggestions ? 'Searching...' : 'No results found'}
                    </div>
                  )}
                </ul>
              )}
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Check in date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-md w-full"
                />
              </div>
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Checkout date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  min={formData.checkIn}
                  className="rounded-md w-full"
                />
              </div>
            </div>
          </div>
          <div className="modal-footer flex justify-end my-2 gap-8">
            <button 
              className="submit-search-btn w-full flex items-center justify-center gap-2 bg-[#0d3c46] text-white px-4 py-1 rounded-md" 
              onClick={handleSubmit}
            >
              Search <Search className="" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [lastSelectedLocation, setLastSelectedLocation] = useState('');

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
    const handleRouteChange = () => {
      if (isMobile) {
        setIsModalOpen(false);
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobile]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.location.length < 3) {
        setLocationSuggestions([]);
        setIsSuggestionsOpen(false);
        return;
      }
      
      if (formData.location === lastSelectedLocation) {
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(`/locations?query=${encodeURIComponent(formData.location)}`);
        const data = await res.json();
        setLocationSuggestions(data);
        if (inputRef.current === document.activeElement && formData.location !== lastSelectedLocation) {
          setIsSuggestionsOpen(data.length > 0);
        }
      } catch (err) {
        console.error(err);
        setLocationSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [formData.location, lastSelectedLocation]);

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
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLastSelectedLocation('');
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => ({ ...prev, location: loc }));
    setLastSelectedLocation(loc);
    setIsSuggestionsOpen(false);
    setIsLoadingSuggestions(false);
    if (isMobile) {
      inputRef.current.blur();
    }
  };

  const handleSubmit = () => {
    const { location, checkIn, checkOut, guests } = formData;

    if (!location) return toast.error('Please enter a location');
    if (!checkIn || !checkOut) return toast.error('Please provide check-in and check-out dates');

    if (isMobile) setIsModalOpen(false);

    router.get('/all-properties', {
      location,
      checkIn,
      checkOut,
      guests,
      searchMode: 'properties',
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

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
          setIsSuggestionsOpen={setIsSuggestionsOpen}
        />
      ) : (
        <>
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
            setIsSuggestionsOpen={setIsSuggestionsOpen}
          />
        </>
      )}
    </>
  );
}