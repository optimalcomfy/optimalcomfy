import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'


export default function SearchCars({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, cars } = usePage().props;
  
  // Function to get proper icon for the car type
  const getCarTypeIcon = (body_type) => {
    // Default to SUV icon if body_type doesn't match known types
    return "/cars/images/icons/4-green.svg";
  };
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>

          <div className="no-bottom no-top zebra" id="content">
            <div id="top" />
            {/* section begin */}
            <section id="subheader" className="jarallax text-light">
                <img src="/cars/images/background/2.jpg" className="jarallax-img" alt="" />
                <div className="center-y relative text-center">
                <div className="container">
                    <div className="row">
                    <div className="col-md-12 text-center">
                        <h1>Cars</h1>
                    </div>
                    <div className="clearfix" />
                    </div>
                </div>
                </div>
            </section>
            {/* section close */}
            <section id="section-cars">
                <div className="container">
                <div className="row">
                    <div className="col-lg-3">
                    <div className="item_filter_group">
                        <h4>Vehicle Type</h4>
                        <div className="de_form">
                        <div className="de_checkbox">
                            <input
                            id="vehicle_type_1"
                            name="vehicle_type_1"
                            type="checkbox"
                            defaultValue="vehicle_type_1"
                            />
                            <label htmlFor="vehicle_type_1">Car</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="vehicle_type_2"
                            name="vehicle_type_2"
                            type="checkbox"
                            defaultValue="vehicle_type_2"
                            />
                            <label htmlFor="vehicle_type_2">Van</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="vehicle_type_3"
                            name="vehicle_type_3"
                            type="checkbox"
                            defaultValue="vehicle_type_3"
                            />
                            <label htmlFor="vehicle_type_3">Minibus</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="vehicle_type_4"
                            name="vehicle_type_4"
                            type="checkbox"
                            defaultValue="vehicle_type_4"
                            />
                            <label htmlFor="vehicle_type_4">Prestige</label>
                        </div>
                        </div>
                    </div>
                    <div className="item_filter_group">
                        <h4>Car Body Type</h4>
                        <div className="de_form">
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_1"
                            name="car_body_type_1"
                            type="checkbox"
                            defaultValue="car_body_type_1"
                            />
                            <label htmlFor="car_body_type_1">Convertible</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_2"
                            name="car_body_type_2"
                            type="checkbox"
                            defaultValue="car_body_type_2"
                            />
                            <label htmlFor="car_body_type_2">Coupe</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_3"
                            name="car_body_type_3"
                            type="checkbox"
                            defaultValue="car_body_type_3"
                            />
                            <label htmlFor="car_body_type_3">Exotic Cars</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_4"
                            name="car_body_type_4"
                            type="checkbox"
                            defaultValue="car_body_type_4"
                            />
                            <label htmlFor="car_body_type_4">Hatchback</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_5"
                            name="car_body_type_5"
                            type="checkbox"
                            defaultValue="car_body_type_5"
                            />
                            <label htmlFor="car_body_type_5">Minivan</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_6"
                            name="car_body_type_6"
                            type="checkbox"
                            defaultValue="car_body_type_6"
                            />
                            <label htmlFor="car_body_type_6">Truck</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_7"
                            name="car_body_type_7"
                            type="checkbox"
                            defaultValue="car_body_type_7"
                            />
                            <label htmlFor="car_body_type_7">Sedan</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_8"
                            name="car_body_type_8"
                            type="checkbox"
                            defaultValue="car_body_type_8"
                            />
                            <label htmlFor="car_body_type_8">Sports Car</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_9"
                            name="car_body_type_9"
                            type="checkbox"
                            defaultValue="car_body_type_9"
                            />
                            <label htmlFor="car_body_type_9">Station Wagon</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_body_type_10"
                            name="car_body_type_10"
                            type="checkbox"
                            defaultValue="car_body_type_10"
                            />
                            <label htmlFor="car_body_type_10">SUV</label>
                        </div>
                        </div>
                    </div>
                    <div className="item_filter_group">
                        <h4>Car Seats</h4>
                        <div className="de_form">
                        <div className="de_checkbox">
                            <input
                            id="car_seat_1"
                            name="car_seat_1"
                            type="checkbox"
                            defaultValue="car_seat_1"
                            />
                            <label htmlFor="car_seat_1">2 seats</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_seat_2"
                            name="car_seat_2"
                            type="checkbox"
                            defaultValue="car_seat_2"
                            />
                            <label htmlFor="car_seat_2">4 seats</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_seat_3"
                            name="car_seat_3"
                            type="checkbox"
                            defaultValue="car_seat_3"
                            />
                            <label htmlFor="car_seat_3">6 seats</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_seat_4"
                            name="car_seat_4"
                            type="checkbox"
                            defaultValue="car_seat_4"
                            />
                            <label htmlFor="car_seat_4">6+ seats</label>
                        </div>
                        </div>
                    </div>
                    <div className="item_filter_group">
                        <h4>Car Engine Capacity (cc)</h4>
                        <div className="de_form">
                        <div className="de_checkbox">
                            <input
                            id="car_engine_1"
                            name="car_engine_1"
                            type="checkbox"
                            defaultValue="car_engine_1"
                            />
                            <label htmlFor="car_engine_1">1000 - 2000</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_engine_2"
                            name="car_engine_2"
                            type="checkbox"
                            defaultValue="car_engine_2"
                            />
                            <label htmlFor="car_engine_2">2000 - 4000</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_engine_3"
                            name="car_engine_3"
                            type="checkbox"
                            defaultValue="car_engine_3"
                            />
                            <label htmlFor="car_engine_3">4000 - 6000</label>
                        </div>
                        <div className="de_checkbox">
                            <input
                            id="car_engine_4"
                            name="car_engine_4"
                            type="checkbox"
                            defaultValue="car_engine_4"
                            />
                            <label htmlFor="car_engine_4">6000+</label>
                        </div>
                        </div>
                    </div>
                    <div className="item_filter_group">
                        <h4>Price (KES)</h4>
                        <div className="price-input">
                        <div className="field">
                            <span>Min</span>
                            <input type="number" className="input-min" defaultValue={0} />
                        </div>
                        <div className="field">
                            <span>Max</span>
                            <input
                            type="number"
                            className="input-max"
                            defaultValue={2000}
                            />
                        </div>
                        </div>
                        <div className="slider">
                        <div className="progress" />
                        </div>
                        <div className="range-input">
                        <input
                            type="range"
                            className="range-min"
                            min={0}
                            max={2000}
                            defaultValue={0}
                            step={1}
                        />
                        <input
                            type="range"
                            className="range-max"
                            min={0}
                            max={2000}
                            defaultValue={2000}
                            step={1}
                        />
                        </div>
                    </div>
                    </div>
                    <div className="col-lg-9">
                    <div className="row">
                        {/* Dynamic car listing based on cars data */}
                        {cars && cars.length > 0 ? (
                          cars.map((car) => (
                            <div className="col-xl-4 col-lg-6" key={car.id}>
                              <div className="de-item mb30">
                                <div className="d-img">
                                  {/* Use the first image from initial_gallery if available, otherwise use a placeholder */}
                                  <img
                                    src={car.initial_gallery && car.initial_gallery.length > 0 
                                      ? `/storage/${car.initial_gallery[0].image}` 
                                      : `/cars/images/cars/placeholder.jpg`}
                                    className="img-fluid"
                                    alt={`${car.brand} ${car.model}`}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/cars/images/cars/placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div className="d-info">
                                  <div className="d-text">
                                    <h4>{car.brand} {car.model}</h4>
                                    <div className="d-item_like">
                                      <i className="fa fa-heart" />
                                      <span>{Math.floor(Math.random() * 100)}</span>
                                    </div>
                                    <div className="d-atr-group">
                                      <span className="d-atr">
                                        <img src="/cars/images/icons/1-green.svg" alt="" />
                                        {car.seats || 5}
                                      </span>
                                      <span className="d-atr">
                                        <img src="/cars/images/icons/2-green.svg" alt="" />
                                        {car.doors || 4}
                                      </span>
                                      <span className="d-atr">
                                        <img src="/cars/images/icons/3-green.svg" alt="" />
                                        {car.luggage_capacity ? Math.floor(car.luggage_capacity / 1000) : 4}
                                      </span>
                                      <span className="d-atr">
                                        <img src={getCarTypeIcon(car.body_type)} alt="" />
                                        {car.body_type || 'Sedan'}
                                      </span>
                                    </div>
                                    <div className="d-price">
                                      Daily rate from <span>KES{car.price_per_day}</span>
                                    </div>
                                    <div className="mt-2">
                                      <Link className="btn-main" href={route('rent-now', { car_id: car.id })}>
                                        Rent Now
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12">
                            <div className="alert alert-info">
                              No cars available at the moment. Please check back later.
                            </div>
                          </div>
                        )}
                    </div>
                    </div>
                </div>
                </div>
            </section>
            </div>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}