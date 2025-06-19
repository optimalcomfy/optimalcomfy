import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import Select from 'react-select';
import { 
  Plus, 
  Logs, 
  MapPin, 
  Star as StarIcon, 
  Car, 
  Fuel, 
  Settings, 
  DollarSign, 
  Info, 
  Check, 
  X,
  Calendar,
  Gauge
} from 'lucide-react';
import Layout from "@/Layouts/layout/layout.jsx";
import './Edit.css'; // Import custom CSS

const EditCar = ({ car, categories, company }) => {
  const { data, setData, post, errors, processing } = useForm({
    _method: 'PUT',
    car_category_id: car.car_category_id || '',
    name: car.name || '',
    brand: car.brand || '',
    model: car.model || '',
    year: car.year || '',
    mileage: car.mileage || '',
    body_type: car.body_type || '',
    seats: car.seats || '',
    doors: car.doors || '',
    luggage_capacity: car.luggage_capacity || '',
    fuel_type: car.fuel_type || '',
    engine_capacity: car.engine_capacity || '',
    transmission: car.transmission || '',
    drive_type: car.drive_type || '',
    fuel_economy: car.fuel_economy || '',
    exterior_color: car.exterior_color || '',
    interior_color: car.interior_color || '',
    host_earnings: car.host_earnings || '',
    price_per_day: car.price_per_day || '',
    description: car.description || '',
    is_available: car.is_available || false,
    location_address: car.location_address || '',
    latitude: car.latitude || '',
    longitude: car.longitude || '',
  });

  const [locationAddressSuggestions, setlocationAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Calculate prices whenever host_earnings changes
  useEffect(() => {
    if (data.host_earnings && company?.percentage) {
      const earnings = parseFloat(data.host_earnings);
      const platformFee = earnings * (company.percentage / 100);
      const customerPrice = earnings + platformFee;
      setData('price_per_day', customerPrice.toFixed(2));
    } else if (!data.host_earnings) {
      setData('price_per_day', "");
    }
  }, [data.host_earnings, company?.percentage]);

  // Calculate host earnings from existing price_per_day when component mounts
  useEffect(() => {
    if (car.price_per_day && company?.percentage && !car.host_earnings) {
      const customerPrice = parseFloat(car.price_per_day);
      const hostEarnings = customerPrice / (1 + (company.percentage / 100));
      setData('host_earnings', hostEarnings.toFixed(2));
    }
  }, [car.price_per_day, company?.percentage, car.host_earnings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('main-cars.update', car.id));
  };

  const carCategoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  useEffect(() => {
    const fetchlocationAddressSuggestions = async () => {
      if (data.location_address.length < 3) {
        setlocationAddressSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/locations?query=${encodeURIComponent(data.location_address)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const result = await response.json();
        setlocationAddressSuggestions(result);
      } catch (error) {
        console.error('Error fetching location_address suggestions:', error);
        setlocationAddressSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (data.location_address) {
        fetchlocationAddressSuggestions();
      } else {
        setlocationAddressSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data.location_address]);

  const handleLocation_addressSelect = (suggestion) => {
    setData('location_address', suggestion);
    setlocationAddressSuggestions([]);
  };

  // Custom styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#3373dc',
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3373dc' : state.isFocused ? '#ebf2ff' : null,
      color: state.isSelected ? 'white' : '#363636',
    }),
  };

  const InputField = ({ label, name, type = "text", icon: Icon, ...props }) => (
    <div className="form-field">
      <label className="form-label">
        {Icon && <Icon className="form-field-icon" />}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={data[name]}
        onChange={(e) => setData(name, e.target.value)}
        className="form-input"
        {...props}
      />
      {errors[name] && <div className="form-error">{errors[name]}</div>}
    </div>
  );

  return (
    <Layout>
      <div className="edit-car-container">
        <div className="edit-car-header">
          <h1 className="page-title">
            <Car className="title-icon" />
            Edit Car Details
          </h1>
          <div className="availability-badge-container">
            <span className={`availability-badge ${data.is_available ? 'available' : 'unavailable'}`}>
              {data.is_available ? (
                <>
                  <Check className="badge-icon" />
                  Available
                </>
              ) : (
                <>
                  <X className="badge-icon" />
                  Unavailable
                </>
              )}
            </span>
          </div>
        </div>
        
        <div className="edit-car-card">
          <div className="edit-car-card-header">
            <h2 className="car-title">
              {data.brand} {data.model} {data.year}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="edit-car-form">
            <div className="form-grid">
              {/* Section 1: Basic Information */}
              <div className="form-section">
                <h3 className="section-title">
                  <Car className="section-icon" />
                  Basic Information
                </h3>
                <div className="form-grid-3">
                  <div className="form-field">
                    <label className="form-label">Car Category</label>
                    <Select
                      options={carCategoryOptions}
                      value={carCategoryOptions.find(option => option.value === data.car_category_id)}
                      onChange={(selected) => setData('car_category_id', selected.value)}
                      styles={selectStyles}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.car_category_id && <div className="form-error">{errors.car_category_id}</div>}
                  </div>
                  <InputField label="Name" name="name" />
                  <InputField label="Brand" name="brand" />
                  <InputField label="Model" name="model" />
                  <InputField label="Year" name="year" icon={Calendar} />
                  <InputField label="Mileage" name="mileage" icon={Gauge} />
                </div>
              </div>
  
              {/* Section 2: Physical Characteristics */}
              <div className="form-section">
                <h3 className="section-title">
                  <Car className="section-icon" />
                  Physical Characteristics
                </h3>
                <div className="form-grid-3">
                  <InputField label="Body Type" name="body_type" />
                  <InputField label="Seats" name="seats" type="number" min="1" max="20" />
                  <InputField label="Doors" name="doors" type="number" min="1" max="10" />
                  <InputField label="Luggage Capacity" name="luggage_capacity" />
                  <InputField label="Exterior Color" name="exterior_color" />
                  <InputField label="Interior Color" name="interior_color" />
                </div>
              </div>
  
              {/* Section 3: Technical Specifications */}
              <div className="form-section">
                <h3 className="section-title">
                  <Settings className="section-icon" />
                  Technical Specifications
                </h3>
                <div className="form-grid-3">
                  <InputField label="Fuel Type" name="fuel_type" icon={Fuel} />
                  <InputField label="Engine Capacity" name="engine_capacity" />
                  <InputField label="Transmission" name="transmission" />
                  <InputField label="Drive Type" name="drive_type" />
                  <InputField label="Fuel Economy" name="fuel_economy" />
                </div>
              </div>
  
              {/* Section 4: Pricing and Availability */}
              <div className="form-section">
                <h3 className="section-title">
                  <DollarSign className="section-icon" />
                  Pricing and Availability
                </h3>
                
                {/* Pricing Details Section */}
                <div className="pricing-section">
                  <div className="form-field">
                    <label className="form-label">
                      <DollarSign className="form-field-icon" />
                      Your Desired Earnings (KES)
                    </label>
                    <input
                      type="number"
                      value={data.host_earnings}
                      onChange={(e) => setData("host_earnings", e.target.value)}
                      className="form-input"
                      placeholder="Enter your desired earnings per day"
                    />
                    {errors.host_earnings && <div className="form-error">{errors.host_earnings}</div>}
                  </div>

                  {company?.percentage && (
                    <div className="pricing-breakdown">
                      <div className="pricing-item">
                        <span className="pricing-label">Platform fee ({company.percentage}%)</span>
                        <span className="pricing-value">
                          {data.host_earnings ? `KES ${(data.host_earnings * (company.percentage / 100)).toFixed(2)}` : 'KES 0.00'}
                        </span>
                      </div>
                      <div className="pricing-item earnings">
                        <span className="pricing-label">You'll receive:</span>
                        <span className="pricing-value earnings-value">KES {data.host_earnings || '0.00'}</span>
                      </div>
                    </div>
                  )}

                  <div className="form-field">
                    <label className="form-label">
                      <DollarSign className="form-field-icon" />
                      Customer Price (KES)
                    </label>
                    <input
                      type="number"
                      value={data.price_per_day}
                      readOnly
                      className="form-input readonly-input"
                      placeholder="0.00"
                    />
                    <div className="field-help-text">
                      This is the price customers will pay per day after platform fees
                    </div>
                    {errors.price_per_day && <div className="form-error">{errors.price_per_day}</div>}
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="form-label">
                    <Info className="form-field-icon" />
                    Availability Status
                  </label>
                  <div className="checkbox-wrapper">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={data.is_available}
                        onChange={(e) => setData('is_available', e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">
                        {data.is_available ? 'Available for Rent' : 'Not Available'}
                      </span>
                    </label>
                    {errors.is_available && <div className="form-error">{errors.is_available}</div>}
                  </div>
                </div>
              </div>
              
              {/* Section 5: Location */}
              <div className="form-section">
                <h3 className="section-title">
                  <MapPin className="section-icon" />
                  Location
                </h3>
                <div className="form-field location-field">
                  <label className="form-label">
                    <MapPin className="form-field-icon" />
                    Location Address
                  </label>
                  <div className="location-input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search for a location..."
                      value={data.location_address}
                      onChange={(e) => setData("location_address", e.target.value)}
                    />
                    {isLoadingSuggestions && (
                      <div className="loader"></div>
                    )}
                  </div>
                  {locationAddressSuggestions.length > 0 && (
                    <div className="location-suggestions">
                      <ul className="suggestions-list">
                        {locationAddressSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleLocation_addressSelect(suggestion)}
                          >
                            <MapPin className="suggestion-icon" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {errors.location_address && <p className="form-error">{errors.location_address}</p>}
                </div>
              </div>
              
              {/* Section 6: Description */}
              <div className="form-section">
                <h3 className="section-title">
                  <Info className="section-icon" />
                  Description
                </h3>
                <div className="form-field">
                  <label className="form-label">
                    Car Description
                  </label>
                  <textarea 
                    value={data.description} 
                    onChange={(e) => setData('description', e.target.value)}
                    rows="5"
                    className="form-textarea"
                    placeholder="Provide a detailed description of the car..."
                  />
                  {errors.description && <div className="form-error">{errors.description}</div>}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={processing} 
                className="submit-button"
              >
                {processing ? (
                  <span className="button-content">
                    <span className="spinner"></span>
                    Updating...
                  </span>
                ) : (
                  <span className="button-content">
                    <Check className="button-icon" />
                    Update Car
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditCar;