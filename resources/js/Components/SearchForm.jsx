import React, { useState, useEffect, useRef } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, Users, Plus, Minus, BedDouble, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom/client';
import Swal from 'sweetalert2';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const MobileSearchTrigger = ({ formData, openModal, handleLocationClick, handleDateClick, handleGuestsClick, handleSubmit }) => (
  <div className="mobile-search-trigger md:hidden w-full max-w-md mx-auto">
    <div
      className="bg-white border border-gray-300 rounded-full shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={openModal}
    >
      <div className="flex items-center justify-between">
        {/* Location Section */}
        <div
          className="flex-1 text-center"
          onClick={(e) => {
            e.stopPropagation();
            handleLocationClick();
          }}
        >
          <p className="text-xs font-medium text-gray-600">
            {formData.location || 'Where to Ristay?'}
          </p>
        </div>

        {/* Dates Section */}
        <div
          className="flex-1 text-center border-l border-gray-300"
          onClick={(e) => {
            e.stopPropagation();
            handleDateClick('checkIn');
          }}
        >
          <p className="text-xs font-medium text-gray-600">
            {formData.checkIn && formData.checkOut
              ? `${format(new Date(formData.checkIn), 'MMM d')} - ${format(new Date(formData.checkOut), 'MMM d')}`
              : 'Your Ristay dates'
            }
          </p>
        </div>

        {/* Guests Section */}
        <div
          className="flex-1 text-center border-l border-gray-300"
          onClick={(e) => {
            e.stopPropagation();
            handleGuestsClick();
          }}
        >
          <p className="text-xs font-medium text-gray-600">
            {formData.guests ? `${formData.guests} guest${formData.guests > 1 ? 's' : ''}` : `Who's coming?`}
          </p>
        </div>

        {/* Search Button */}
        <div className="ml-2">
          <div className="bg-[#0d3c46] rounded-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}>
            <Search size={16} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const DesktopSearchBar = ({
  formData,
  handleLocationClick,
  handleDateClick,
  handleGuestsClick,
  handleSubmit
}) => (
  <div className="search-container desktop-search">
    <div className="bar">
      <div className="location relative">
        <p className="field-label absolute text-xs">Where</p>
        <div
          onClick={handleLocationClick}
          className="inputType formForm cursor-pointer flex items-center"
        >
          <p className="value-display">
            {formData.location || 'Where to Ristay?'}
          </p>
          {formData.location && (
            <X
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                handleLocationClick();
              }}
            />
          )}
        </div>
      </div>

      <div className="check-in relative">
        <p className="field-label absolute text-xs">Check in date</p>
        <div
          onClick={() => handleDateClick('checkIn')}
          className="inputType formForm cursor-pointer"
        >
          <p className="value-display flex text-nowrap">
            {formData.checkIn ? format(new Date(formData.checkIn), 'MMM d, yyyy') : 'Select'}
          </p>
        </div>
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Checkout date</p>
        <div
          onClick={() => handleDateClick('checkOut')}
          className="inputType formForm cursor-pointer"
        >
          <p className="value-display flex text-nowrap">
            {formData.checkOut ? format(new Date(formData.checkOut), 'MMM d, yyyy') : 'Select'}
          </p>
        </div>
      </div>

      <div className="guests flex items-center relative">
        <p className="field-label absolute text-xs">Who</p>
        <div
          onClick={handleGuestsClick}
          className="inputType formForm cursor-pointer"
        >
          <p className="value-display">
            {formData.guests ? `${formData.guests} guest${formData.guests > 1 ? 's' : ''}` : 'Add guests'}
          </p>
        </div>

        <button className="search-button" onClick={handleSubmit}>
          <Search size={16} />
        </button>
      </div>
    </div>
  </div>
);


export default function SearchForm() {
  const [formData, setFormData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 0,
    adults: 1,
    children: 0,
    infants: 0
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState('location');
  const [autoProgress, setAutoProgress] = useState(false);

  // Initialize form data from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location') || '';
    const checkIn = urlParams.get('checkIn') || '';
    const checkOut = urlParams.get('checkOut') || '';
    const guests = parseInt(urlParams.get('guests') || '0');
    const adults = parseInt(urlParams.get('adults') || '1');
    const children = parseInt(urlParams.get('children') || '0');
    const infants = parseInt(urlParams.get('infants') || '0');

    setFormData(prev => ({
      ...prev,
      location,
      checkIn,
      checkOut,
      guests: guests || adults + children,
      adults,
      children,
      infants
    }));
  }, []);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Body overflow management
  useEffect(() => {
    document.body.style.overflow = isModalOpen && isMobile ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isMobile]);

  // Route change handler
  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobile) {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobile]);

  // Auto-progress through steps
  useEffect(() => {
    if (isModalOpen && isMobile && autoProgress) {
      const progressToNextStep = () => {
        if (currentStep === 'location' && formData.location) {
          setCurrentStep('dates');
          setAutoProgress(false);
          setTimeout(() => {
            handleDateClick('checkIn');
          }, 300);
        } else if (currentStep === 'dates' && formData.checkIn && formData.checkOut) {
          setCurrentStep('guests');
          setAutoProgress(false);
          setTimeout(() => {
            handleGuestsClick();
          }, 300);
        } else if (currentStep === 'guests' && formData.guests > 0) {
          setAutoProgress(false);
          setTimeout(() => {
            handleSubmit(true);
          }, 300);
        } else {
          setAutoProgress(false);
        }
      };

      progressToNextStep();
    }
  }, [formData, currentStep, isModalOpen, isMobile, autoProgress]);

  const fetchLocationSuggestions = async (query) => {
    if (query.length < 2) return [];

    try {
      const res = await fetch(`/locations?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const clearLocation = () => {
    setFormData(prev => ({
      ...prev,
      location: ''
    }));
    setCurrentStep('location');
  };

  const handleLocationClick = async () => {
    if (isMobile && isModalOpen) {
      setCurrentStep('location');
    }

    if (formData.location) {
      clearLocation();
      return;
    }

    let searchQuery = formData.location || '';

    const { value: result } = await Swal.fire({
      title: 'Where to?',
      html: `
        <div id="airbnb-location-search" style="text-align: left;">
          <div style="position: relative; margin-bottom: 20px;">
            <input
              id="location-search-input"
              type="text"
              placeholder="Search destinations"
              value="${searchQuery}"
              style="
                width: 100%;
                padding: 16px 20px;
                border: 2px solid #DDDDDD;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 400;
                outline: none;
                transition: border-color 0.2s ease;
              "
            />
            <div id="search-loading" style="display: none; position: absolute; right: 15px; top: 50%; transform: translateY(-50%);">
              <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #FF385C; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
          </div>

          <div id="suggestions-container" style="max-height: 300px; overflow-y: auto;">
            <div id="recent-searches" style="margin-bottom: 24px;">
              <h4 style="font-size: 14px; font-weight: 600; color: #222222; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Popular destinations</h4>
              <div class="suggestion-item" data-location="Nairobi, Kenya" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <div style="color: white; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Nairobi</div>
                  <div style="color: #717171; font-size: 14px;">Kenya</div>
                </div>
              </div>
              <div class="suggestion-item" data-location="Mombasa, Kenya" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <div style="color: white; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4z"></path>
                      <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3z"></path>
                      <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l.35.36 2.29-2.29-2.29-2.29z"></path>
                      <path d="M11 15.99l-2.29 2.29 2.29 2.29 2.29-2.29z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Mombasa</div>
                  <div style="color: #717171; font-size: 14px;">Kenya</div>
                </div>
              </div>
              <div class="suggestion-item" data-location="Kisumu, Kenya" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <div style="color: white; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 20c2.83-2.83 5.83-4.14 9-4 3.17.14 6.17 1.17 9 4"></path>
                      <path d="M2 16c2.83-2.83 5.83-4.14 9-4 3.17.14 6.17 1.17 9 4"></path>
                      <path d="M2 12c2.83-2.83 5.83-4.14 9-4 3.17.14 6.17 1.17 9 4"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Kisumu</div>
                  <div style="color: #717171; font-size: 14px;">Kenya</div>
                </div>
              </div>
            </div>

            <div id="search-results" style="display: none;">
              <h4 style="font-size: 14px; font-weight: 600; color: #222222; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Search results</h4>
              <div id="results-list"></div>
            </div>
          </div>
        </div>

        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .suggestion-item:hover {
            background-color: #F7F7F7 !important;
          }

          #location-search-input:focus {
            border-color: #FF385C !important;
            box-shadow: 0 0 0 2px rgba(255, 56, 92, 0.1) !important;
          }
        </style>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      width: '500px',
      customClass: {
        popup: 'airbnb-location-popup'
      },
      didOpen: () => {
        const input = document.getElementById('location-search-input');
        const suggestionsContainer = document.getElementById('suggestions-container');
        const searchResults = document.getElementById('search-results');
        const resultsList = document.getElementById('results-list');
        const searchLoading = document.getElementById('search-loading');
        const recentSearches = document.getElementById('recent-searches');
        let timeoutId;

        document.addEventListener('click', (e) => {
          if (e.target.closest('.suggestion-item')) {
            const location = e.target.closest('.suggestion-item').getAttribute('data-location');
            Swal.close();
            setTimeout(() => {
              setFormData(prev => ({ ...prev, location }));
              if (isMobile && isModalOpen) {
                setAutoProgress(true);
              }
            }, 100);
          }
        });

        input.addEventListener('input', async (e) => {
          const query = e.target.value;

          if (timeoutId) clearTimeout(timeoutId);

          if (query.length >= 2) {
            searchLoading.style.display = 'block';
            recentSearches.style.display = 'none';

            timeoutId = setTimeout(async () => {
              try {
                const suggestions = await fetchLocationSuggestions(query);
                searchLoading.style.display = 'none';

                if (suggestions.length > 0) {
                  resultsList.innerHTML = suggestions.map(location => `
                    <div class="suggestion-item" data-location="${location}" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                        <div style="color: #666; display: flex; align-items: center; justify-content: center;">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #222222; font-size: 16px;">${location}</div>
                        <div style="color: #717171; font-size: 14px;">Destination</div>
                      </div>
                    </div>
                  `).join('');
                  searchResults.style.display = 'block';
                } else {
                  resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #717171;">No results found</div>';
                  searchResults.style.display = 'block';
                }
              } catch (error) {
                searchLoading.style.display = 'none';
                console.error('Error fetching suggestions:', error);
              }
            }, 500);
          } else {
            searchLoading.style.display = 'none';
            searchResults.style.display = 'none';
            recentSearches.style.display = 'block';
          }
        });

        input.focus();
      }
    });
  };

  const handleDateClick = async (dateType) => {
    if (isMobile && isModalOpen) {
      setCurrentStep('dates');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const initialRange = {
      startDate: formData.checkIn ? new Date(formData.checkIn) : today,
      endDate: formData.checkOut ? new Date(formData.checkOut) : addDays(today, 1),
      key: 'selection'
    };

    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.padding = '10px 0';

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '600px';
    wrapper.style.margin = '0 auto';

    container.appendChild(wrapper);

    let selectedRange = { ...initialRange };

    const { value: result } = await Swal.fire({
      title: 'Select dates',
      html: container,
      showCancelButton: true,
      confirmButtonText: isMobile && isModalOpen ? 'Next' : 'Save',
      cancelButtonText: 'Back',
      width: 'auto',
      customClass: {
        popup: 'airbnb-calendar-popup',
        container: 'swal2-container-date-range'
      },
      didOpen: () => {
        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <div className="custom-date-range">
            <DateRange
              editableDateInputs={true}
              onChange={item => {
                selectedRange.startDate = item.selection.startDate;
                selectedRange.endDate = item.selection.endDate;
              }}
              moveRangeOnFirstSelection={false}
              ranges={[selectedRange]}
              minDate={today}
              rangeColors={['#f7855e']}
              months={1}
              direction="horizontal"
              preventSnapRefocus={true}
              calendarFocus="backwards"
              className="custom-date-range"
            />
          </div>
        );
      },
      willClose: () => {
        if (wrapper._reactRoot) {
          wrapper._reactRoot.unmount();
          wrapper._reactRoot = null;
        }
      }
    });

    if (result) {
      const { startDate, endDate } = selectedRange;

      setFormData(prev => ({
        ...prev,
        checkIn: format(startDate, 'yyyy-MM-dd'),
        checkOut: format(endDate, 'yyyy-MM-dd')
      }));

      if (isMobile && isModalOpen) {
        setAutoProgress(true);
      }
    } else if (isMobile && isModalOpen) {
      setCurrentStep('location');
    }
  };

  const handleGuestsClick = async () => {
    if (isMobile && isModalOpen) {
      setCurrentStep('guests');
    }

    let localGuests = {
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants
    };

    const updateButtonStates = () => {
      const decreaseAdults = document.getElementById('decrease-adults');
      const decreaseChildren = document.getElementById('decrease-children');
      const decreaseInfants = document.getElementById('decrease-infants');

      if (decreaseAdults) {
        decreaseAdults.disabled = localGuests.adults <= 1;
        decreaseAdults.style.color = localGuests.adults <= 1 ? '#B0B0B0' : '#222222';
        decreaseAdults.style.cursor = localGuests.adults <= 1 ? 'not-allowed' : 'pointer';
      }

      if (decreaseChildren) {
        decreaseChildren.disabled = localGuests.children <= 0;
        decreaseChildren.style.color = localGuests.children <= 0 ? '#B0B0B0' : '#222222';
        decreaseChildren.style.cursor = localGuests.children <= 0 ? 'not-allowed' : 'pointer';
      }

      if (decreaseInfants) {
        decreaseInfants.disabled = localGuests.infants <= 0;
        decreaseInfants.style.color = localGuests.infants <= 0 ? '#B0B0B0' : '#222222';
        decreaseInfants.style.cursor = localGuests.infants <= 0 ? 'not-allowed' : 'pointer';
      }
    };

    const updateDisplay = () => {
      const adultsCount = document.getElementById('adults-count');
      const childrenCount = document.getElementById('children-count');
      const infantsCount = document.getElementById('infants-count');
      const guestSummary = document.getElementById('guest-summary');

      if (adultsCount) adultsCount.textContent = localGuests.adults;
      if (childrenCount) childrenCount.textContent = localGuests.children;
      if (infantsCount) infantsCount.textContent = localGuests.infants;

      if (guestSummary) {
        const total = localGuests.adults + localGuests.children;
        guestSummary.textContent = `${total} guest${total !== 1 ? 's' : ''} selected`;
      }
    };

    const { value: result } = await Swal.fire({
      title: 'Who\'s coming?',
      html: `
        <div id="airbnb-guests-popup" style="text-align: left; font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
          <div class="guest-category" style="padding: 24px 0; border-bottom: 1px solid #EBEBEB;">
            <div style="display: flex; justify-content: between; align-items: center;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #222222; font-size: 16px; margin-bottom: 4px;">Adults</div>
                <div style="color: #717171; font-size: 14px;">Ages 13 or above</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <button type="button" id="decrease-adults" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #B0B0B0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span id="adults-count" style="font-weight: 600; color: #222222; min-width: 20px; text-align: center;">${localGuests.adults}</span>
                <button type="button" id="increase-adults" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="guest-category" style="padding: 24px 0; border-bottom: 1px solid #EBEBEB;">
            <div style="display: flex; justify-content: between; align-items: center;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #222222; font-size: 16px; margin-bottom: 4px;">Children</div>
                <div style="color: #717171; font-size: 14px;">Ages 2-12</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <button type="button" id="decrease-children" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #B0B0B0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span id="children-count" style="font-weight: 600; color: #222222; min-width: 20px; text-align: center;">${localGuests.children}</span>
                <button type="button" id="increase-children" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="guest-category" style="padding: 24px 0;">
            <div style="display: flex; justify-content: between; align-items: center;">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #222222; font-size: 16px; margin-bottom: 4px;">Infants</div>
                <div style="color: #717171; font-size: 14px;">Under 2</div>
              </div>
              <div style="display: flex; align-items: center; gap: 16px;">
                <button type="button" id="decrease-infants" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #B0B0B0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <span id="infants-count" style="font-weight: 600; color: #222222; min-width: 20px; text-align: center;">${localGuests.infants}</span>
                <button type="button" id="increase-infants" style="width: 32px; height: 32px; border: 1px solid #B0B0B0; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div id="guest-summary" style="margin-top: 24px; padding: 16px; background: #F7F7F7; border-radius: 12px; font-size: 14px; color: #717171;">
            ${localGuests.adults + localGuests.children} guest${(localGuests.adults + localGuests.children) !== 1 ? 's' : ''} selected
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isMobile && isModalOpen ? 'Search' : 'Save',
      cancelButtonText: 'Back',
      width: '500px',
      customClass: {
        popup: 'airbnb-guests-popup'
      },
      didOpen: () => {
        updateButtonStates();

        document.getElementById('increase-adults').addEventListener('click', () => {
          localGuests.adults++;
          updateDisplay();
          updateButtonStates();
        });

        document.getElementById('decrease-adults').addEventListener('click', () => {
          if (localGuests.adults > 1) {
            localGuests.adults--;
            updateDisplay();
            updateButtonStates();
          }
        });

        document.getElementById('increase-children').addEventListener('click', () => {
          localGuests.children++;
          updateDisplay();
          updateButtonStates();
        });

        document.getElementById('decrease-children').addEventListener('click', () => {
          if (localGuests.children > 0) {
            localGuests.children--;
            updateDisplay();
            updateButtonStates();
          }
        });

        document.getElementById('increase-infants').addEventListener('click', () => {
          localGuests.infants++;
          updateDisplay();
          updateButtonStates();
        });

        document.getElementById('decrease-infants').addEventListener('click', () => {
          if (localGuests.infants > 0) {
            localGuests.infants--;
            updateDisplay();
            updateButtonStates();
          }
        });
      }
    });

    if (result) {
      const totalGuests = localGuests.adults + localGuests.children;

      setFormData(prev => ({
        ...prev,
        adults: localGuests.adults,
        children: localGuests.children,
        infants: localGuests.infants,
        guests: totalGuests
      }));

      if (isMobile && isModalOpen) {
        setAutoProgress(true);
      }
    } else if (isMobile && isModalOpen) {
      setCurrentStep('dates');
    }
  };

  const handleSubmit = async (skipConfirmation = false) => {
    const { location, checkIn, checkOut, guests } = formData;

    if (!location) {
      if (isMobile && isModalOpen) {
        setCurrentStep('location');
      }
      Swal.fire({
        icon: 'warning',
        title: 'Missing Location',
        text: 'Please select a destination to search for properties.',
        confirmButtonColor: '#FF385C',
        confirmButtonText: 'Select Location'
      }).then(() => {
        handleLocationClick();
      });
      return;
    }

    if (!checkIn || !checkOut) {
      if (isMobile && isModalOpen) {
        setCurrentStep('dates');
      }
      Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both check-in and check-out dates.',
        confirmButtonColor: '#FF385C',
        confirmButtonText: 'Select Dates'
      }).then(() => {
        handleDateClick('checkIn');
      });
      return;
    }

    if (!guests || guests === 0) {
      if (isMobile && isModalOpen) {
        setCurrentStep('guests');
      }
      Swal.fire({
        icon: 'warning',
        title: 'Missing Guests',
        text: 'Please select the number of guests.',
        confirmButtonColor: '#FF385C',
        confirmButtonText: 'Select Guests'
      }).then(() => {
        handleGuestsClick();
      });
      return;
    }

    if (!skipConfirmation && !isMobile) {
      const result = await Swal.fire({
        title: 'Ready to search?',
        html: `
          <div style="text-align: left; margin: 24px 0; font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
            <div style="background: #F7F7F7; border-radius: 16px; padding: 24px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FF385C, #E31C5F); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <div style="color: white; display: flex; align-items: center; justify-content: center;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${location}</div>
                  <div style="color: #717171; font-size: 14px;">Destination</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1; margin-right: 12px;">
                  <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Check-in</div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${format(new Date(checkIn), 'MMM d, yyyy')}</div>
                </div>

                <div style="flex: 1; margin-left: 12px;">
                  <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Check-out</div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${format(new Date(checkOut), 'MMM d, yyyy')}</div>
                </div>
              </div>

              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #EBEBEB;">
                <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Guests</div>
                <div style="font-weight: 600; color: #222222; font-size: 16px;">${guests} guest${guests !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Search stays',
        cancelButtonText: 'Edit details',
        confirmButtonColor: '#FF385C',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'airbnb-confirm-popup',
          confirmButton: 'airbnb-confirm-btn',
          cancelButton: 'airbnb-cancel-btn'
        }
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    Swal.fire({
      html: `
        <div style="text-align: center; padding: 40px 20px; font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
          <div style="width: 80px; height: 80px; margin: 0 auto 24px; position: relative;">
            <div style="width: 80px; height: 80px; border: 4px solid #f3f3f3; border-top: 4px solid #FF385C; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          </div>
          <h3 style="font-size: 24px; font-weight: 600; color: #222222; margin: 0 0 12px 0;">Searching for stays</h3>
          <p style="font-size: 16px; color: #717171; margin: 0;">Looking for the perfect place in ${location}...</p>
        </div>

        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showCancelButton: false,
      background: '#ffffff',
      customClass: {
        popup: 'airbnb-loading-popup'
      }
    });

    if (isMobile) {
      setIsModalOpen(false);
      setCurrentStep('location');
      setAutoProgress(false);
    }

    try {
      router.get('/all-properties', {
        location,
        checkIn,
        checkOut,
        guests,
        adults: formData.adults,
        children: formData.children,
        infants: formData.infants,
        searchMode: 'properties',
      });

      setTimeout(() => {
        Swal.close();
      }, 1500);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'We couldn\'t search for properties right now. Please try again.',
        confirmButtonColor: '#FF385C',
        confirmButtonText: 'Try again',
        customClass: {
          popup: 'airbnb-error-popup'
        }
      });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep('location');
    setAutoProgress(false);
  };


  return (
    <>
      <style jsx global>{`
        .airbnb-location-popup .swal2-popup,
        .airbnb-calendar-popup .swal2-popup,
        .airbnb-guests-popup .swal2-popup,
        .airbnb-confirm-popup .swal2-popup,
        .airbnb-loading-popup .swal2-popup,
        .airbnb-error-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }

        .airbnb-confirm-btn {
          background-color: #FF385C !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 14px 24px !important;
          font-size: 16px !important;
        }

        .airbnb-cancel-btn {
          background-color: transparent !important;
          border: 1px solid #DDDDDD !important;
          border-radius: 8px !important;
          color: #222222 !important;
          font-weight: 600 !important;
          padding: 14px 24px !important;
          font-size: 16px !important;
        }

        .swal2-title {
          font-size: 22px !important;
          font-weight: 600 !important;
          color: #222222 !important;
        }

        .swal2-container-date-range {
          z-index: 99999 !important;
        }

        .rdrDefinedRangesWrapper {
          display: none;
        }

        .rdrDateDisplayWrapper {
          background-color: #f7855e;
        }

        .rdrDateDisplayItem input {
          color: white;
        }

        .rdrDayToday .rdrDayNumber span:after {
          background-color: #FF385C;
        }

        .rdrDayHovered {
          border-color: #FF385C;
        }

        .rdrDayActive {
          background-color: #FF385C;
        }

        .rdrInRange {
          background-color: rgba(255, 56, 92, 0.1);
        }

        .rdrDateDisplayItemActive input {
            color: #7d888d !important;
        }

        .rdrDateDisplayItem input {
            cursor: pointer;
            height: 2.5em;
            line-height: 2.5em;
            border: 0px;
            background: transparent;
            width: 100%;
            color: #849095 !important;
        }

        .search-container .bar > div {
          transition: all 0.2s ease;
        }

        .search-container .bar > div:hover {
          background-color: #f7f7f7;
        }

        .search-container .bar > div.active {
          background-color: #ffffff;
          box-shadow: 0 0 0 2px #222222;
          border-radius: 32px;
        }

        .mobile-search-trigger {
          padding: 0 16px;
        }

        @media (max-width: 768px) {
            .mobile-search-trigger {
                padding: 0 0px;
            }
        }

        .value-display {
          margin: 0;
          padding: 0;
          color: inherit;
          font-size: 10px;
          font-weight: inherit;
        }

        .value-display-mobile {
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .inputType.formForm {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .search-flow-step {
          transition: all 0.3s ease;
        }

        .search-flow-step.active-step {
          transform: scale(1.02);
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 8px;
        }

        .progress-indicator {
          margin: 20px 0;
        }

        .mobile-search-modal.active .modal-content {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .modal-content {
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>

      {!isMobile ? (
        <DesktopSearchBar
          formData={formData}
          handleLocationClick={handleLocationClick}
          handleDateClick={handleDateClick}
          handleGuestsClick={handleGuestsClick}
          handleSubmit={handleSubmit}
        />
      ) : (
        <>
          <MobileSearchTrigger
            formData={formData}
            openModal={openModal}
            handleLocationClick={handleLocationClick}
            handleDateClick={handleDateClick}
            handleGuestsClick={handleGuestsClick}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </>
  );
}
