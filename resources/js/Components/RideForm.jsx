import React, { useState, useEffect, useRef } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { Search, Loader2, X, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './SearchForms.css';
import 'react-toastify/dist/ReactToastify.css';

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
          value={formData.checkIn ? new Date(formData.checkIn).toLocaleDateString() : ''}
          onClick={() => handleDateClick('checkIn')}
          placeholder="Select date"
          className="inputType formForm cursor-pointer"
          readOnly
        />
      </div>

      <div className="check-out relative">
        <p className="field-label absolute text-xs">Drop-off Date</p>
        <input
          type="text"
          name="checkOut"
          value={formData.checkOut ? new Date(formData.checkOut).toLocaleDateString() : ''}
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
            className={`modal-title px-4 py-2 text-lg font-medium ${route().current('home') ? 'text-peachDark border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'} transition duration-150 ease-in-out`}
          >
            Search stays
          </Link>
          <Link 
            href={route('all-cars')} 
            className={`modal-title px-4 py-2 text-lg font-medium ${(isWhich === '/all-cars' || isWhich === '/search-cars' || isWhich === '/rent-now' || isWhich === '/car-booking') ? 'text-peachDark border-b-2 border-indigo-500' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'} transition duration-150 ease-in-out`}
          >
            Search Rides
          </Link>
        </div>

        <div className="modal-body">
          <div className="mobile-search-fields flex flex-col gap-4">
            <div className="mobile-field-group">
              <label className="mobile-field-label flex items-center gap-2">
                <MapPin size={20} className="text-gray-600" />
                <span className="font-medium">Pick-up Location</span>
              </label>
              <div className="mobile-field-input relative">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onClick={handleLocationClick}
                  placeholder="Enter city or airport"
                  className="rounded-md w-full border border-gray-300 p-2 cursor-pointer"
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
              <label className="mobile-field-label flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <span className="font-medium">Pick-up Date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="checkIn"
                  value={formData.checkIn ? new Date(formData.checkIn).toLocaleDateString() : ''}
                  onClick={() => handleDateClick('checkIn')}
                  placeholder="Select date"
                  className="rounded-md w-full border border-gray-300 p-2 cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            <div className="mobile-field-group">
              <label className="mobile-field-label flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <span className="font-medium">Drop-off Date</span>
              </label>
              <div className="mobile-field-input">
                <input
                  type="text"
                  name="checkOut"
                  value={formData.checkOut ? new Date(formData.checkOut).toLocaleDateString() : ''}
                  onClick={() => handleDateClick('checkOut')}
                  placeholder="Select date"
                  className="rounded-md w-full border border-gray-300 p-2 cursor-pointer"
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="modal-footer mt-6">
            <button 
              className="submit-search-btn w-full flex justify-center items-center gap-2 bg-[#0d3c46] hover:bg-[#0a2f38] text-white px-4 py-3 rounded-md font-medium transition-colors" 
              onClick={handleSubmit}
            >
              <Search size={18} className="mr-1" />
              Search Rides
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
        <div id="airbnb-location-search" style="text-align: left;">
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
              <div class="suggestion-item" data-location="Westlands, Nairobi" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 18px;">🏪</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Westlands</div>
                  <div style="color: #717171; font-size: 14px;">Shopping & Business District</div>
                </div>
              </div>
              <div class="suggestion-item" data-location="Karen, Nairobi" style="display: flex; align-items: center; padding: 12px 16px; border-radius: 12px; cursor: pointer; transition: background-color 0.2s ease;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                  <span style="color: white; font-size: 18px;">🌳</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #222222; font-size: 16px;">Karen</div>
                  <div style="color: #717171; font-size: 14px;">Upscale Residential Area</div>
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

        // Handle suggestion item clicks
        document.addEventListener('click', (e) => {
          if (e.target.closest('.suggestion-item')) {
            const location = e.target.closest('.suggestion-item').getAttribute('data-location');
            Swal.close();
            setTimeout(() => {
              setFormData(prev => ({ ...prev, location }));
              Swal.fire({
                icon: 'success',
                title: 'Pickup Location Selected',
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
                      <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                        <span style="color: white; font-size: 18px;">🚗</span>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #222222; font-size: 16px;">${location}</div>
                        <div style="color: #717171; font-size: 14px;">Pickup Location</div>
                      </div>
                    </div>
                  `).join('');
                  searchResults.style.display = 'block';
                } else {
                  resultsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #717171;">No locations found</div>';
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

  const generateCalendarDays = (year, month, selectedPickup, selectedDropoff, minDate) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    let html = '';
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div style="width: 14.28%; height: 44px;"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isSelected = dateStr === selectedPickup || dateStr === selectedDropoff;
      const isInRange = selectedPickup && selectedDropoff && dateStr > selectedPickup && dateStr < selectedDropoff;
      const isDisabled = currentDate < minDate;
      
      let dayClass = 'calendar-day';
      let dayStyle = `
        width: 14.28%; 
        height: 44px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        cursor: pointer; 
        border-radius: 50%; 
        font-size: 14px; 
        font-weight: 400;
        transition: all 0.2s ease;
        position: relative;
      `;
      
      if (isDisabled) {
        dayStyle += 'color: #DDDDDD; cursor: not-allowed;';
      } else if (isSelected) {
        dayStyle += 'background-color: #0d3c46; color: white; font-weight: 600;';
      } else if (isInRange) {
        dayStyle += 'background-color: rgba(13, 60, 70, 0.1); color: #0d3c46;';
      } else if (isToday) {
        dayStyle += 'border: 2px solid #0d3c46; color: #0d3c46; font-weight: 600;';
      } else {
        dayStyle += 'color: #222222;';
      }
      
      html += `
        <div 
          class="${dayClass}" 
          data-date="${dateStr}" 
          style="${dayStyle}"
          ${isDisabled ? '' : `onmouseover="this.style.backgroundColor='rgba(13, 60, 70, 0.1)'" onmouseout="this.style.backgroundColor='${isSelected ? '#0d3c46' : (isInRange ? 'rgba(13, 60, 70, 0.1)' : 'transparent')}'; this.style.color='${isSelected ? 'white' : (isInRange ? '#0d3c46' : '#222222')}'""`}
        >
          ${day}
        </div>
      `;
    }
    
    return html;
  };

  const handleDateClick = async (dateType) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let displayMonth = currentMonth;
    let displayYear = currentYear;
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const generateCalendarHTML = (month, year) => {
      const minDate = dateType === 'checkOut' && formData.checkIn ? new Date(formData.checkIn) : today;
      
      return `
        <div id="airbnb-calendar" style="font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding: 0 8px;">
            <button id="prev-month" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: background-color 0.2s;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#222222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <h3 style="font-size: 18px; font-weight: 600; color: #222222; margin: 0;">${monthNames[month]} ${year}</h3>
            <button id="next-month" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; transition: background-color 0.2s;">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="#222222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div style="display: flex; margin-bottom: 8px;">
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Su</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Mo</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Tu</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">We</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Th</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Fr</div>
            <div style="width: 14.28%; text-align: center; font-size: 12px; font-weight: 600; color: #717171; padding: 8px 0;">Sa</div>
          </div>
          
          <div id="calendar-grid" style="display: flex; flex-wrap: wrap;">
            ${generateCalendarDays(year, month, formData.checkIn, formData.checkOut, minDate)}
          </div>
        </div>
      `;
    };

    const { value: selectedDate } = await Swal.fire({
      title: dateType === 'checkIn' ? 'When do you need the car?' : 'When will you return it?',
      html: generateCalendarHTML(displayMonth, displayYear),
      showCancelButton: true,
      showConfirmButton: false,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#6b7280',
      width: '420px',
      customClass: {
        popup: 'airbnb-calendar-popup'
      },
      didOpen: () => {
        const updateCalendar = () => {
          document.getElementById('calendar-grid').innerHTML = 
            generateCalendarDays(displayYear, displayMonth, formData.checkIn, formData.checkOut, 
              dateType === 'checkOut' && formData.checkIn ? new Date(formData.checkIn) : today);
        };

        document.getElementById('prev-month').addEventListener('click', () => {
          if (displayMonth === 0) {
            displayMonth = 11;
            displayYear--;
          } else {
            displayMonth--;
          }
          
          // Don't allow going to months before current month
          if (displayYear < currentYear || (displayYear === currentYear && displayMonth < currentMonth)) {
            displayMonth = currentMonth;
            displayYear = currentYear;
            return;
          }
          
          document.querySelector('#airbnb-calendar h3').textContent = `${monthNames[displayMonth]} ${displayYear}`;
          updateCalendar();
        });

        document.getElementById('next-month').addEventListener('click', () => {
          if (displayMonth === 11) {
            displayMonth = 0;
            displayYear++;
          } else {
            displayMonth++;
          }
          document.querySelector('#airbnb-calendar h3').textContent = `${monthNames[displayMonth]} ${displayYear}`;
          updateCalendar();
        });

        document.addEventListener('click', (e) => {
          if (e.target.classList.contains('calendar-day') && e.target.dataset.date) {
            const selectedDateStr = e.target.dataset.date;
            const selectedDateObj = new Date(selectedDateStr);
            
            // Validate date
            if (selectedDateObj < today) return;
            if (dateType === 'checkOut' && formData.checkIn && selectedDateObj <= new Date(formData.checkIn)) return;
            
            Swal.close();
            setTimeout(() => {
              setFormData(prev => ({ ...prev, [dateType]: selectedDateStr }));
              
              const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              const dateLabel = dateType === 'checkIn' ? 'Pick-up' : 'Drop-off';
              
              Swal.fire({
                icon: 'success',
                title: `${dateLabel} Date Selected`,
                text: formattedDate,
                timer: 2000,
                showConfirmButton: false,
                confirmButtonColor: '#0d3c46'
              });
            }, 100);
          }
        });
      }
    });
  };

  const handleSubmit = async () => {
    const { location, checkIn, checkOut, guests } = formData;

    if (!location) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Pickup Location',
        text: 'Please select where you want to pick up your ride.',
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
        text: 'Please select both pickup and drop-off dates.',
        confirmButtonColor: '#0d3c46',
        confirmButtonText: 'Select Dates'
      });
      return;
    }

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
            
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1; margin-right: 12px;">
                <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Pick-up</div>
                <div style="font-weight: 600; color: #222222; font-size: 16px;">${new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
              
              <div style="flex: 1; margin-left: 12px;">
                <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Drop-off</div>
                <div style="font-weight: 600; color: #222222; font-size: 16px;">${new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </div>
            </div>
            
            <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #EBEBEB;">
              <div style="font-size: 12px; color: #717171; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px;">Rental Duration</div>
              <div style="font-weight: 600; color: #222222; font-size: 16px;">${Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} days</div>
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
        popup: 'airbnb-confirm-popup',
        confirmButton: 'airbnb-confirm-btn',
        cancelButton: 'airbnb-cancel-btn'
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
            <h3 style="font-size: 24px; font-weight: 600; color: #222222; margin: 0 0 12px 0;">Searching for rides</h3>
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
          popup: 'airbnb-loading-popup'
        }
      });

      if (isMobile) setIsModalOpen(false);

      try {
        router.get('/search-cars', {
          location,
          checkIn,
          checkOut,
          guests,
          searchMode: 'rides',
        });
        
        setTimeout(() => {
          Swal.close();
        }, 1500);
        
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: 'We couldn\'t search for rides right now. Please try again.',
          confirmButtonColor: '#0d3c46',
          confirmButtonText: 'Try again',
          customClass: {
            popup: 'airbnb-error-popup'
          }
        });
      }
    }
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <style jsx global>{`
        .airbnb-location-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .airbnb-calendar-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .airbnb-confirm-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .airbnb-loading-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .airbnb-error-popup .swal2-popup {
          border-radius: 16px !important;
          font-family: 'Circular', -apple-system, BlinkMacSystemFont, Roboto, sans-serif !important;
        }
        
        .airbnb-confirm-btn {
          background-color: #0d3c46 !important;
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
        
        #prev-month:hover, #next-month:hover {
          background-color: #F7F7F7 !important;
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
          <MobileSearchModal
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            modalRef={modalRef}
            formData={formData}
            handleLocationClick={handleLocationClick}
            handleDateClick={handleDateClick}
            handleSubmit={handleSubmit}
          />
        </>
      )}
    </>
  );
}