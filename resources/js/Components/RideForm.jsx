import React, { useState, useEffect, useRef } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import ReactDOM from 'react-dom/client';
import Swal from 'sweetalert2';
import { DateRange } from 'react-date-range';
import { addDays, format, differenceInDays } from 'date-fns';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const DesktopSearchBar = ({ 
  formData, 
  handleLocationClick,
  handleDateClick,
  handleTimeClick,
  handleSubmit
}) => (
  <div className="search-container desktop-search">
    <div className="bar">
      <div className="location relative">
        <p className="field-label absolute text-xs">Pick-up Location</p>
        <input
          type="text"
          name="location"
          value={formData.location}
          onClick={handleLocationClick}
          placeholder="Enter city or airport"
          className="inputType formForm cursor-pointer"
          readOnly
        />
        
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

      <div className="check-in relative">
        <p className="field-label absolute text-xs">Pick-up Date</p>
        <input
          type="text"
          name="checkIn"
          value={formData.checkIn ? format(new Date(formData.checkIn), 'MMM d, yyyy') : ''}
          onClick={() => handleDateClick('checkIn')}
          placeholder="Select date"
          className="inputType formForm cursor-pointer"
          readOnly
        />
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Pick-up Time</p>
        <input
          type="text"
          name="pickupTime"
          value={formData.pickupTime || ''}
          onClick={() => handleTimeClick('pickupTime')}
          placeholder="Select time"
          className="inputType formForm cursor-pointer"
          readOnly
        />
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Drop-off Date</p>
        <input
          type="text"
          name="checkOut"
          value={formData.checkOut ? format(new Date(formData.checkOut), 'MMM d, yyyy') : ''}
          onClick={() => handleDateClick('checkOut')}
          placeholder="Select date"
          className="inputType formForm cursor-pointer"
          readOnly
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
  formData,
  handleLocationClick,
  handleDateClick,
  handleTimeClick,
  handleSubmit
}) => {
  const { url } = usePage();
  const [isWhich] = useState(url.split('?')[0]);

  return (
    <div className={`mobile-search-modal ${isModalOpen ? 'active' : ''}`}>
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
            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <MapPin size={20} />
                <span>Pick-up Location</span>
              </label>
              <div className="mobile-field-input relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onClick={handleLocationClick}
                  placeholder="Enter city or airport"
                  className="rounded-md w-full cursor-pointer"
                  readOnly
                />
                {formData.location && (
                  <X 
                    className="clear-icon absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    size={18}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationClick();
                    }} 
                  />
                )}
              </div>
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Pick-up Date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="checkIn"
                  value={formData.checkIn ? format(new Date(formData.checkIn), 'MMM d, yyyy') : ''}
                  onClick={() => handleDateClick('checkIn')}
                  placeholder="Select date"
                  className="rounded-md w-full cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Clock size={20} />
                <span>Pick-up Time</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="pickupTime"
                  value={formData.pickupTime || ''}
                  onClick={() => handleTimeClick('pickupTime')}
                  placeholder="Select time"
                  className="rounded-md w-full cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label">
                <Calendar size={20} />
                <span>Drop-off Date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="checkOut"
                  value={formData.checkOut ? format(new Date(formData.checkOut), 'MMM d, yyyy') : ''}
                  onClick={() => handleDateClick('checkOut')}
                  placeholder="Select date"
                  className="rounded-md w-full cursor-pointer"
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="modal-footer flex justify-end my-2 gap-8">
            <button 
              className="submit-search-btn w-full flex items-center justify-center gap-2 bg-[#0d3c46] text-white px-4 py-1 rounded-md" 
              onClick={handleSubmit}
            >
              Search Rides <Search className="" size={16} />
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
    pickupTime: '08:00 AM',
    dropoffTime: '08:00 PM',
    carType: '',
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const handleLocationClick = async () => {
    let suggestions = [];
    let searchQuery = formData.location || '';

    const { value: result } = await Swal.fire({
      title: 'Where do you need a ride?',
      html: `
        <div id="car-location-search" style="text-align: left;">
          <div style="position: relative; margin-bottom: 20px;">
            <input 
              id="location-search-input" 
              type="text" 
              placeholder="Enter city or airport" 
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
                  <span style="color: white; font-size: 18px;">🏢</span>
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
                  <span style="color: white; font-size: 18px;">🏝️</span>
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
              Swal.fire({
                icon: 'success',
                title: 'Location Selected',
                text: location,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#0d3c46'
              });
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
                        <span style="color: #666; font-size: 18px;">🚗</span>
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

    const { value: result } = await Swal.fire({
      title: dateType === 'checkIn' ? 'Select Pick-up Date' : 'Select Drop-off Date',
      html: container,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
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
                initialRange.startDate = item.selection.startDate;
                initialRange.endDate = item.selection.endDate;
              }}
              moveRangeOnFirstSelection={false}
              ranges={[initialRange]}
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
      const { startDate, endDate } = initialRange;
      
      if (dateType === 'checkIn') {
        setFormData(prev => ({
          ...prev,
          checkIn: format(startDate, 'yyyy-MM-dd'),
          checkOut: format(endDate, 'yyyy-MM-dd')
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          checkOut: format(endDate, 'yyyy-MM-dd')
        }));
      }

      Swal.fire({
        icon: 'success',
        title: 'Date Selected',
        text: `${format(startDate, 'MMM d, yyyy')}`,
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#0d3c46'
      });
    }
  };

  const handleTimeClick = async (timeType) => {
    const timeOptions = [
      '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
      '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
      '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
    ];

    const { value: selectedTime } = await Swal.fire({
      title: timeType === 'pickupTime' ? 'Select Pick-up Time' : 'Select Drop-off Time',
      html: `
        <div style="max-height: 300px; overflow-y: auto; margin-top: 16px;">
          ${timeOptions.map(time => `
            <div 
              class="time-option ${formData[timeType] === time ? 'selected' : ''}" 
              data-time="${time}"
              style="
                padding: 12px 16px;
                margin-bottom: 8px;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s;
                ${formData[timeType] === time ? 'background-color: #0d3c46; color: white;' : 'background-color: #F7F7F7; color: #222222;'}
              "
            >
              ${time}
            </div>
          `).join('')}
        </div>
      `,
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      width: '300px',
      customClass: {
        popup: 'car-time-popup'
      },
      didOpen: () => {
        document.querySelectorAll('.time-option').forEach(option => {
          option.addEventListener('click', function() {
            const selectedTime = this.getAttribute('data-time');
            Swal.close();
            setTimeout(() => {
              setFormData(prev => ({ ...prev, [timeType]: selectedTime }));
              Swal.fire({
                icon: 'success',
                title: 'Time Selected',
                text: selectedTime,
                timer: 1500,
                showConfirmButton: false,
                confirmButtonColor: '#0d3c46'
              });
            }, 100);
          });
        });
      }
    });
  };

  const handleSubmit = async () => {
    const { location, checkIn, checkOut, pickupTime } = formData;

    if (!location) {
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
      Swal.fire({
        icon: 'warning',
        title: 'Missing Dates',
        text: 'Please select both pick-up and drop-off dates.',
        confirmButtonColor: '#0d3c46',
        confirmButtonText: 'Select Dates'
      });
      return;
    }

    if (!pickupTime) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Time',
        text: 'Please select a pick-up time.',
        confirmButtonColor: '#0d3c46',
        confirmButtonText: 'Select Time'
      });
      return;
    }

    // Calculate rental duration
    const startDate = new Date(`${checkIn} ${pickupTime}`);
    const endDate = new Date(`${checkOut} ${formData.dropoffTime || '08:00 PM'}`);
    const durationHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
    const durationDays = Math.ceil(durationHours / 24);

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
                <div style="color: #717171; font-size: 14px;">${pickupTime}</div>
              </div>
              
              <div style="flex: 1; margin-left: 12px;">
                <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Drop-off</div>
                <div style="font-weight: 600; color: #222222; font-size: 16px;">${format(new Date(checkOut), 'MMM d, yyyy')}</div>
                <div style="color: #717171; font-size: 14px;">${formData.dropoffTime || '08:00 PM'}</div>
              </div>
            </div>
            
            <div style="padding-top: 16px; border-top: 1px solid #EBEBEB;">
              <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Rental Duration</div>
              <div style="font-weight: 600; color: #222222; font-size: 16px;">${durationDays} days (${durationHours} hours)</div>
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

    if (result.isConfirmed) {
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

      if (isMobile) setIsModalOpen(false);

      try {
        router.get('/search-cars', {
          location,
          checkIn,
          checkOut,
          pickupTime,
          dropoffTime: formData.dropoffTime || '08:00 PM',
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
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <style jsx global>{`
        .car-location-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .car-calendar-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .car-time-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .car-confirm-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .car-loading-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
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

      `}</style>
      
      {!isMobile ? (
        <DesktopSearchBar
          formData={formData}
          handleLocationClick={handleLocationClick}
          handleDateClick={handleDateClick}
          handleTimeClick={handleTimeClick}
          handleSubmit={handleSubmit}
        />
      ) : (
        <>
          <MobileSearchModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            modalRef={modalRef}
            formData={formData}
            handleLocationClick={handleLocationClick}
            handleDateClick={handleDateClick}
            handleTimeClick={handleTimeClick}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </>
  );
};