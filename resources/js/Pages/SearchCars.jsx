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
import CarFilter from "@/Components/CarFilter";


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
                <div className="row py-4">
                    <div className="col-lg-3">
                      <CarFilter />
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