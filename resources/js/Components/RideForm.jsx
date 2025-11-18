import React, { useState, useEffect, useRef } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, Car } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom/client';
import Swal from 'sweetalert2';
import { DateRange } from 'react-date-range';
import { addDays, format, differenceInDays } from 'date-fns';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const MobileSearchTrigger = ({ formData, openModal, handleLocationClick, handleDateClick, handleSubmit }) => (
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
              : 'Your Ristay Dates'
            }
          </p>
        </div>

        {/* Search Button */}
        <div className="ml-2">
          <div className="bg-[#0d3c46] rounded-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            handleSubmit();
          }}>
            <Car size={16} className="text-white" />
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
  handleSubmit
}) => (
  <div className="search-container desktop-search">
    <div className="bar">
      <div className="location relative">
        <p className="field-label absolute text-xs">Pick-up Location</p>
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
        <p className="field-label absolute text-xs">Pick-up Date</p>
        <div
          onClick={() => handleDateClick('checkIn')}
          className="inputType formForm cursor-pointer"
        >
          <p className="value-display flex text-nowrap">
            {formData.checkIn ? format(new Date(formData.checkIn), 'MMM d, yyyy') : 'Select date'}
          </p>
        </div>
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Drop-off Date</p>
        <div
          onClick={() => handleDateClick('checkOut')}
          className="inputType formForm cursor-pointer"
        >
          <p className="value-display flex text-nowrap">
            {formData.checkOut ? format(new Date(formData.checkOut), 'MMM d, yyyy') : 'Select date'}
          </p>
        </div>
      </div>

      <div className="guests flex items-center relative">
        <button className="search-button" onClick={handleSubmit}>
          <Car size={16} />
        </button>
      </div>
    </div>
  </div>
);

const MobileSearchModal = ({
  isModalOpen,
  closeModal,
  modalRef,
  formData,
  handleLocationClick,
  handleDateClick,
  handleSubmit,
  currentStep
}) => {
  if (!isModalOpen) return null;

  return (
    <div className="mobile-search-modal active fixed inset-0 z-50 md:hidden">
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
      <div
        className="modal-content fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-h-[90vh] overflow-hidden"
        ref={modalRef}
      >
        {/* Header */}
        <div className="modal-header flex justify-between items-center p-4 border-b border-gray-200">
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold text-gray-800">Find your ride</h3>
          <div className="w-6"></div> {/* Spacer for balance */}
        </div>

        {/* Progress Steps */}
        <div className="progress-indicator px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-center space-x-8">
            <div className={`step flex flex-col items-center ${currentStep === 'location' ? 'active-step' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'location' ? 'bg-[#0d3c46]' : 'bg-gray-300'}`}></div>
              <span className={`text-xs mt-1 ${currentStep === 'location' ? 'text-[#0d3c46] font-medium' : 'text-gray-500'}`}>
                Location
              </span>
            </div>
            <div className={`step flex flex-col items-center ${currentStep === 'dates' ? 'active-step' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'dates' ? 'bg-[#0d3c46]' : 'bg-gray-300'}`}></div>
              <span className={`text-xs mt-1 ${currentStep === 'dates' ? 'text-[#0d3c46] font-medium' : 'text-gray-500'}`}>
                Dates
              </span>
            </div>
            <div className={`step flex flex-col items-center ${currentStep === 'search' ? 'active-step' : ''}`}>
              <div className={`w-3 h-3 rounded-full ${currentStep === 'search' ? 'bg-[#0d3c46]' : 'bg-gray-300'}`}></div>
              <span className={`text-xs mt-1 ${currentStep === 'search' ? 'text-[#0d3c46] font-medium' : 'text-gray-500'}`}>
                Search
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body p-4">
          {/* Location Step */}
          <div className={`search-flow-step ${currentStep === 'location' ? 'active' : 'hidden'}`}>
            <h4 className="text-lg font-medium mb-4">Where do you need a ride?</h4>
            <div
              className="border border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#0d3c46] transition-colors"
              onClick={handleLocationClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pick-up location</p>
                  <p className="text-lg font-medium">
                    {formData.location || 'Select location'}
                  </p>
                </div>
                <MapPin className="text-gray-400" size={20} />
              </div>
            </div>
            <button
              className="w-full mt-6 bg-[#0d3c46] text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (formData.location) {
                  setCurrentStep('dates');
                  setTimeout(() => {
                    handleDateClick('checkIn');
                  }, 300);
                }
              }}
              disabled={!formData.location}
            >
              Next
            </button>
          </div>

          {/* Dates Step */}
          <div className={`search-flow-step ${currentStep === 'dates' ? 'active' : 'hidden'}`}>
            <h4 className="text-lg font-medium mb-4">When do you need the car?</h4>
            <div className="space-y-3">
              <div
                className="border border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#0d3c46] transition-colors"
                onClick={() => handleDateClick('checkIn')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pick-up date</p>
                    <p className="text-lg font-medium">
                      {formData.checkIn ? format(new Date(formData.checkIn), 'MMM d, yyyy') : 'Select date'}
                    </p>
                  </div>
                  <Calendar className="text-gray-400" size={20} />
                </div>
              </div>
              <div
                className="border border-gray-300 rounded-xl p-4 cursor-pointer hover:border-[#0d3c46] transition-colors"
                onClick={() => handleDateClick('checkOut')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Drop-off date</p>
                    <p className="text-lg font-medium">
                      {formData.checkOut ? format(new Date(formData.checkOut), 'MMM d, yyyy') : 'Select date'}
                    </p>
                  </div>
                  <Calendar className="text-gray-400" size={20} />
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
                onClick={() => setCurrentStep('location')}
              >
                Back
              </button>
              <button
                className="flex-1 bg-[#0d3c46] text-white py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  if (formData.checkIn && formData.checkOut) {
                    handleSubmit(true);
                  }
                }}
                disabled={!formData.checkIn || !formData.checkOut}
              >
                Search
              </button>
            </div>
          </div>

          {/* Search Step */}
          <div className={`search-flow-step ${currentStep === 'search' ? 'active' : 'hidden'}`}>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#0d3c46] rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-white" size={24} />
              </div>
              <h4 className="text-lg font-medium mb-2">Searching for rides</h4>
              <p className="text-gray-600">Finding the perfect vehicle for you...</p>
            </div>
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
    carType: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState('location');
  const [autoProgress, setAutoProgress] = useState(false);

  const modalRef = useRef(null);

  // Initialize form data from URL parameters if they exist
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const location = urlParams.get('location') || '';
    const checkIn = urlParams.get('checkIn') || '';
    const checkOut = urlParams.get('checkOut') || '';

    setFormData(prev => ({
      ...prev,
      location,
      checkIn,
      checkOut
    }));
  }, []);

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

  // Auto-progress through steps when data is filled in mobile modal
  useEffect(() => {
    if (isModalOpen && isMobile && autoProgress) {
      console.log('Auto-progress triggered. Current step:', currentStep, 'Form data:', formData);

      const progressToNextStep = () => {
        if (currentStep === 'location' && formData.location) {
          console.log('Auto-progressing from location to dates');
          setCurrentStep('dates');
          setAutoProgress(false);
          // Open date picker automatically
          setTimeout(() => {
            handleDateClick('checkIn');
          }, 300);
        } else if (currentStep === 'dates' && formData.checkIn && formData.checkOut) {
          console.log('Auto-progressing from dates to search');
          setAutoProgress(false);
          // Auto-submit after dates are selected
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

    // If there's already a location and we're clicking the X, clear it
    if (formData.location) {
      clearLocation();
      return;
    }

    let searchQuery = formData.location || '';

    const { value: result } = await Swal.fire({
      title: 'Where do you need a ride?',
      html: `
        <div id="car-location-search" style="text-align: left;">
          <div style="position: relative; margin-bottom: 20px;">
            <input
              id="location-search-input"
              type="text"
              placeholder="Where to Ristay?"
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
              <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #0d3c46; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            </div>
          </div>

          <div id="suggestions-container" style="max-height: 300px; overflow-y: auto;">
            <div id="recent-searches" style="margin-bottom: 24px;">
              <h4 style="font-size: 14px; font-weight: 600; color: #222222; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Popular pickup locations</h4>
              <div class="suggestion-item" data-location="Nairobi CBD, Kenya" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Nairobi CBD</div>
                  <div style="color: #717171; font-size: 14px;">Central Business District</div>
                </div>
              </div>
              <div class="suggestion-item" data-location="Jomo Kenyatta Airport, Nairobi" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 18px;">✈️</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">JKIA</div>
                  <div style="color: #717171; font-size: 14px;">Jomo Kenyatta International Airport</div>
                </div>
              </div>
              <div class="suggestion-item" data-location="Mombasa Airport, Kenya" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Mombasa Airport</div>
                  <div style="color: #717171; font-size: 14px;">Moi International Airport</div>
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
            border-color: #0d3c46 !important;
            box-shadow: 0 0 0 2px rgba(13, 60, 70, 0.1) !important;
          }
        </style>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      width: '500px',
      customClass: {
        popup: 'car-location-popup'
      },
      didOpen: () => {
        const input = document.getElementById('location-search-input');
        const suggestionsContainer = document.getElementById('suggestions-container');
        const searchResults = document.getElementById('search-results');
        const resultsList = document.getElementById('results-list');
        const searchLoading = document.getElementById('search-loading');
        const recentSearches = document.getElementById('recent-searches');
        let timeoutId;

        // Handle suggestion item clicks
        document.addEventListener('click', (e) => {
          if (e.target.closest('.suggestion-item')) {
            const location = e.target.closest('.suggestion-item').getAttribute('data-location');
            Swal.close();
            setTimeout(() => {
              setFormData(prev => ({ ...prev, location }));
              // Auto-progress to dates on mobile
              if (isMobile && isModalOpen) {
                console.log('Location selected, setting auto progress');
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #222222; font-size: 16px;">${location}</div>
                        <div style="color: #717171; font-size: 14px;">Pickup Location</div>
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

    // Prepare initial range
    const initialRange = {
      startDate: formData.checkIn ? new Date(formData.checkIn) : today,
      endDate: formData.checkOut ? new Date(formData.checkOut) : addDays(today, 1),
      key: 'selection'
    };

    // Create a container for the DateRange component
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.padding = '10px 0';

    // Create a wrapper for the DateRange to control its size
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '600px';
    wrapper.style.margin = '0 auto';

    container.appendChild(wrapper);

    let selectedRange = { ...initialRange };

    const { value: result } = await Swal.fire({
      title: dateType === 'checkIn' ? 'Select Pick-up Date' : 'Select Drop-off Date',
      html: container,
      showCancelButton: true,
      confirmButtonText: isMobile && isModalOpen ? 'Next' : 'Confirm',
      cancelButtonText: 'Back',
      width: 'auto',
      customClass: {
        popup: 'car-calendar-popup',
        container: 'swal2-container-date-range'
      },
      didOpen: () => {
        // Render the DateRange component
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
              rangeColors={['#0d3c46']}
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
        // Clean up the React root when the modal closes
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

      // Auto-progress to search on mobile
      if (isMobile && isModalOpen) {
        console.log('Dates selected, setting auto progress');
        setAutoProgress(true);
      }
    } else if (isMobile && isModalOpen) {
      // If user clicks back, go back to location step
      setCurrentStep('location');
    }
  };

  const handleSubmit = async (skipConfirmation = false) => {
    const { location, checkIn, checkOut } = formData;

    // Validate all required fields
    if (!location) {
      if (isMobile && isModalOpen) {
        setCurrentStep('location');
      }
      Swal.fire({
        icon: 'warning',
        title: 'Missing Location',
        text: 'Please select a pickup location to search for cars.',
        confirmButtonColor: '#0d3c46',
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
        text: 'Please select both pick-up and drop-off dates.',
        confirmButtonColor: '#0d3c46',
        confirmButtonText: 'Select Dates'
      }).then(() => {
        handleDateClick('checkIn');
      });
      return;
    }

    // Skip confirmation on mobile for auto-flow
    if (!skipConfirmation && !isMobile) {
      // Calculate rental duration
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);
      const durationDays = differenceInDays(endDate, startDate) + 1;

      // Show search confirmation with car rental style
      const result = await Swal.fire({
        title: 'Ready to find your ride?',
        html: `
          <div style="text-align: left; margin: 24px 0; font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
            <div style="background: #F7F7F7; border-radius: 16px; padding: 24px; margin-bottom: 16px;">
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0d3c46, #0a2f38); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 20px;">🚗</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${location}</div>
                  <div style="color: #717171; font-size: 14px;">Pickup Location</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <div style="flex: 1; margin-right: 12px;">
                  <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Pick-up</div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${format(new Date(checkIn), 'MMM d, yyyy')}</div>
                </div>

                <div style="flex: 1; margin-left: 12px;">
                  <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Drop-off</div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">${format(new Date(checkOut), 'MMM d, yyyy')}</div>
                </div>
              </div>

              <div style="padding-top: 16px; border-top: 1px solid #EBEBEB;">
                <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Rental Duration</div>
                <div style="font-weight: 600; color: #222222; font-size: 16px;">${durationDays} day${durationDays !== 1 ? 's' : ''}</div>
              </div>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Search rides',
        cancelButtonText: 'Edit details',
        confirmButtonColor: '#0d3c46',
        cancelButtonColor: '#6b7280',
        customClass: {
          popup: 'car-confirm-popup',
          confirmButton: 'car-confirm-btn',
          cancelButton: 'car-cancel-btn'
        }
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    if (isMobile && isModalOpen) {
      setCurrentStep('search');
    }

    // Show car rental style loading
    Swal.fire({
      html: `
        <div style="text-align: center; padding: 40px 20px; font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
          <div style="width: 80px; height: 80px; margin: 0 auto 24px; position: relative;">
            <div style="width: 80px; height: 80px; border: 4px solid #f3f3f3; border-top: 4px solid #0d3c46; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px;">🚗</div>
          </div>
          <h3 style="font-size: 24px; font-weight: 600; color: #222222; margin: 0 0 12px 0;">Searching for cars</h3>
          <p style="font-size: 16px; color: #717171; margin: 0;">Finding the perfect vehicle in ${location}...</p>
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
        popup: 'car-loading-popup'
      }
    });

    if (isMobile) {
      setTimeout(() => {
        setIsModalOpen(false);
        setCurrentStep('location'); // Reset for next time
        setAutoProgress(false);
      }, 2000);
    }

    try {
      router.get('/search-cars', {
        location,
        checkIn,
        checkOut,
        searchMode: 'cars',
      });

      setTimeout(() => {
        Swal.close();
      }, 1500);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong',
        text: 'We couldn\'t search for cars right now. Please try again.',
        confirmButtonColor: '#0d3c46',
        confirmButtonText: 'Try again',
        customClass: {
          popup: 'car-error-popup'
        }
      });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep('location');
    setAutoProgress(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep('location'); // Reset for next time
    setAutoProgress(false);
  };

  return (
    <>
      <style jsx global>{`
        .car-location-popup .swal2-popup,
        .car-calendar-popup .swal2-popup,
        .car-confirm-popup .swal2-popup,
        .car-loading-popup .swal2-popup,
        .car-error-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }

        .car-confirm-btn {
          background-color: #0d3c46 !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          padding: 14px 24px !important;
          font-size: 16px !important;
        }

        .car-cancel-btn {
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
          background-color: #0d3c46;
        }

        .rdrDayHovered {
          border-color: #0d3c46;
        }

        .rdrDayActive {
          background-color: #0d3c46;
        }

        .rdrInRange {
          background-color: rgba(13, 60, 70, 0.1);
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

        /* Mobile modal specific styles */
        .mobile-search-modal .modal-content {
          background: white;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .mobile-search-modal .step.active-step .step-indicator {
          background-color: #0d3c46;
        }

        .mobile-search-modal .step.active-step .step-label {
          color: #0d3c46;
          font-weight: 600;
        }
      `}</style>

      {!isMobile ? (
        <DesktopSearchBar
          formData={formData}
          handleLocationClick={handleLocationClick}
          handleDateClick={handleDateClick}
          handleSubmit={handleSubmit}
        />
      ) : (
        <>
          <MobileSearchTrigger
            formData={formData}
            openModal={openModal}
            handleLocationClick={handleLocationClick}
            handleDateClick={handleDateClick}
            handleSubmit={handleSubmit}
          />

          <MobileSearchModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            modalRef={modalRef}
            formData={formData}
            handleLocationClick={handleLocationClick}
            handleDateClick={handleDateClick}
            handleSubmit={handleSubmit}
            currentStep={currentStep}
          />
        </>
      )}
    </>
  );
}
