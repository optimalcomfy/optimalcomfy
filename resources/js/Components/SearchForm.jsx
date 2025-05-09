import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import DatePicker from 'react-datepicker'; // Import the DatePicker component
import '../../css/style.css';
import '../../css/plugins.min.css';
import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles

function SearchForm() {
  const [formData, setFormData] = useState({
    checkIn: null, // Changed to null to work with DatePicker
    checkOut: null, // Changed to null to work with DatePicker
    adult: '1',
    child: '0',
  });

  const handleDateChange = (date, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format dates for the backend
    const formattedData = {
      ...formData,
      checkIn: formData.checkIn ? formData.checkIn.toISOString().split('T')[0] : '',
      checkOut: formData.checkOut ? formData.checkOut.toISOString().split('T')[0] : '',
    };
    
    router.get('/all-properties', formattedData);
  };

  return (
    <div className="search-form-container" style={{zIndex: '900'}}>
      <div className="container">
        <form onSubmit={handleSubmit} className="advanced-search-form">
          <div className="form-fields">
            
            {/* Check In */}
            <div className="form-field border-right">
              <label htmlFor="checkIn" className="field-label">Check In</label>
              <div className="input-wrapper">
                <DatePicker
                  id="checkIn"
                  selected={formData.checkIn}
                  onChange={(date) => handleDateChange(date, 'checkIn')}
                  className="form-input"
                  placeholderText="15 Jun 2024"
                  dateFormat="dd MMM yyyy"
                  minDate={new Date()}
                />
                <div className="input-icon">
                  <i className="flaticon-calendar" />
                </div>
              </div>
            </div>
            
            {/* Check Out */}
            <div className="form-field border-right">
              <label htmlFor="checkOut" className="field-label">Check Out</label>
              <div className="input-wrapper">
                <DatePicker
                  id="checkOut"
                  selected={formData.checkOut}
                  onChange={(date) => handleDateChange(date, 'checkOut')}
                  className="form-input"
                  placeholderText="20 Jun 2024"
                  dateFormat="dd MMM yyyy"
                  minDate={formData.checkIn || new Date()}
                />
                <div className="input-icon">
                  <i className="flaticon-calendar" />
                </div>
              </div>
            </div>
            
            {/* Adult */}
            <div className="form-field border-right">
              <label htmlFor="adult" className="field-label">Adult</label>
              <div className="input-wrapper">
                <select
                  name="adult"
                  id="adult"
                  className="form-select"
                  value={formData.adult}
                  onChange={handleChange}
                >
                  {[...Array(9)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1} Person</option>
                  ))}
                </select>
                <div className="input-icon">
                  <i className="flaticon-user" />
                </div>
              </div>
            </div>
            
            {/* Child */}
            <div className="form-field border-right">
              <label htmlFor="child" className="field-label">Child</label>
              <div className="input-wrapper">
                <select
                  name="child"
                  id="child"
                  className="form-select"
                  value={formData.child}
                  onChange={handleChange}
                >
                  {[...Array(9)].map((_, i) => (
                    <option key={i} value={i}>{i === 0 ? "No Child" : `${i} Child`}</option>
                  ))}
                </select>
                <div className="input-icon">
                  <i className="flaticon-user" />
                </div>
              </div>
            </div>
            
            {/* Submit */}
            <button type="submit" className="submit-button">
              <span>Check Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SearchForm;