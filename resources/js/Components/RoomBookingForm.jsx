import React, { useState, useEffect } from 'react';

const RoomBookingForm = ({ room }) => {
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    adult: 1,
    child: 0,
    room: 1,
    ebed: 0,
    selectedServices: [],
  });

  const [totalPrice, setTotalPrice] = useState(room?.price_per_night || 0);
  const [nights, setNights] = useState(0);

  // Calculate the difference in days between checkIn and checkOut
  const calculateDays = (checkIn, checkOut) => {
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const timeDifference = checkOutDate - checkInDate;
      return Math.max(1, Math.ceil(timeDifference / (1000 * 3600 * 24))); // Convert milliseconds to days, minimum 1 night
    }
    return 0;
  };

  // Update form data state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle date changes with validation
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure checkout is after checkin
    if (name === "checkOut" && formData.checkIn && new Date(value) <= new Date(formData.checkIn)) {
      alert("Check-out date must be after check-in date");
      return;
    }
    
    // Ensure checkin is before checkout if checkout is already set
    if (name === "checkIn" && formData.checkOut && new Date(value) >= new Date(formData.checkOut)) {
      alert("Check-in date must be before check-out date");
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Update selected services
  const handleServiceChange = (service, servicePrice) => {
    setFormData(prevData => {
      let updatedServices = [...prevData.selectedServices];
      
      if (updatedServices.includes(service)) {
        updatedServices = updatedServices.filter(item => item !== service);
      } else {
        updatedServices.push(service);
      }
      
      return {
        ...prevData,
        selectedServices: updatedServices,
      };
    });
  };

  // Calculate total price whenever relevant form data changes
  useEffect(() => {
    if (formData.checkIn && formData.checkOut) {
      const daysCount = calculateDays(formData.checkIn, formData.checkOut);
      setNights(daysCount);
      
      // Base room price calculation
      const basePrice = (room?.price_per_night || 0) * formData.room * daysCount;
      
      // Calculate service prices
      const servicePrices = formData.selectedServices.reduce((total, service) => {
        // Find the service in room services to get its price
        const serviceData = room?.room_services?.find(s => s.name === service);
        return total + (serviceData?.price || 500); // Default to 500 if price not found
      }, 0);
      
      // Extra bed price
      const extraBedPrice = formData.ebed * 500;
      
      setTotalPrice(basePrice + servicePrices + extraBedPrice);
    } else {
      setTotalPrice(0);
      setNights(0);
    }
  }, [formData, room?.price_per_night, room?.room_services]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.checkIn || !formData.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    if (nights <= 0) {
      alert('Please select valid check-in and check-out dates');
      return;
    }
    
    // Process the form data (e.g., send to a server)
    console.log({...formData, totalPrice, nights});
    alert('Room booked successfully!');
  };

  return (
    <div className="bg-gray dark:bg-[#1B1B1B] dark:text-white py-6 px-2 rounded-lg relative z-10 dark:shadow-none">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Check In Input */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="checkIn" className="block text-xl font-medium text-heading dark:text-white">
              Check In
            </label>
            <div className="relative min-w-[160px] max-w-[160px]">
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                className="relative z-10 w-full bg-white dark:bg-[#1B1B1B] appearance-none outline-none"
                value={formData.checkIn}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                required
              />
            </div>
          </div>

          {/* Check Out Input */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="checkOut" className="block text-xl font-medium text-heading dark:text-white">
              Check Out
            </label>
            <div className="relative min-w-[160px] max-w-[160px]">
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                className="relative z-10 w-full bg-white dark:bg-[#1B1B1B] appearance-none outline-none"
                value={formData.checkOut}
                onChange={handleDateChange}
                min={formData.checkIn || new Date().toISOString().split('T')[0]} // Prevent dates before check-in
                required
              />
            </div>
          </div>

          {/* Stay Duration Display */}
          {nights > 0 && (
            <div className="text-center font-medium">
              Your stay: <span className="font-bold">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Adult Count */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="adult" className="block text-xl font-medium text-heading dark:text-white">
              Adults
            </label>
            <input
              type="number"
              id="adult"
              name="adult"
              className="w-20 text-center bg-white dark:bg-[#1B1B1B] border border-gray-300 rounded"
              min="1"
              max="10"
              value={formData.adult}
              onChange={handleChange}
            />
          </div>

          {/* Child Count */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="child" className="block text-xl font-medium text-heading dark:text-white">
              Children
            </label>
            <input
              type="number"
              id="child"
              name="child"
              className="w-20 text-center bg-white dark:bg-[#1B1B1B] border border-gray-300 rounded"
              min="0"
              max="10"
              value={formData.child}
              onChange={handleChange}
            />
          </div>

          {/* Room Count */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="room" className="block text-xl font-medium text-heading dark:text-white">
              Rooms
            </label>
            <input
              type="number"
              id="room"
              name="room"
              className="w-20 text-center bg-white dark:bg-[#1B1B1B] border border-gray-300 rounded"
              min="1"
              max="5"
              value={formData.room}
              onChange={handleChange}
            />
          </div>

          {/* Extra Bed */}
          <div className="flex justify-between relative w-full p-4 bg-white rounded-md">
            <label htmlFor="ebed" className="block text-xl font-medium text-heading dark:text-white">
              Extra Beds
            </label>
            <input
              type="number"
              id="ebed"
              name="ebed"
              className="w-20 text-center bg-white dark:bg-[#1B1B1B] border border-gray-300 rounded"
              min="0"
              max="5"
              value={formData.ebed}
              onChange={handleChange}
            />
          </div>

          {/* Extra Services */}
          {room?.room_services && room.room_services.length > 0 && (
            <>
              <h5 className="text-heading text-center text-xl font-medium my-2">Extra Services</h5>
              <div className="space-y-3">
                {room.room_services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`service-${index}`}
                        checked={formData.selectedServices.includes(service.name)}
                        onChange={() => handleServiceChange(service.name, service.price)}
                      />
                      <label htmlFor={`service-${index}`} className="text-lg cursor-pointer">
                        {service.name}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.icon && (
                        <img
                          src={`/storage/${service.icon}`}
                          alt={service.name}
                          className="h-6"
                        />
                      )}
                      <span className="font-medium">KES {service.price} / Night</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Price Breakdown */}
          {nights > 0 && (
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span>Room ({nights} night{nights !== 1 ? 's' : ''})</span>
                <span>KES {(room?.price_per_night || 0) * formData.room * nights}</span>
              </div>
              {formData.ebed > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Extra Beds ({formData.ebed})</span>
                  <span>KES {formData.ebed * 500}</span>
                </div>
              )}
              {formData.selectedServices.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Extra Services</span>
                  <span>KES {formData.selectedServices.reduce((total, service) => {
                    const serviceData = room?.room_services?.find(s => s.name === service);
                    return total + (serviceData?.price || 500);
                  }, 0)}</span>
                </div>
              )}
            </div>
          )}

          {/* Total Price */}
          <div className="flex justify-between border-t border-gray-200 pt-4">
            <span className="text-xl font-bold text-heading">Total Price</span>
            <span className="text-xl font-bold text-heading">KES {totalPrice}</span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Book Your Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomBookingForm;