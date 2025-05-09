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

  const { flash, pagination } = usePage().props;
  
  
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
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/jeep-renegade.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Jeep Renegade</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>25</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    SUV
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES265</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/bmw-m5.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Mini Cooper</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>79</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Sedan
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES244</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/ferrari-enzo.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Ferarri Enzo</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>55</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Exotic Car
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES167</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/ford-raptor.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Ford Raptor</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>89</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Truck
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES147</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/mini-cooper.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Mini Cooper</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>87</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Hatchback
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES238</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/vw-polo.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>VW Polo</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>37</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Hatchback
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES106</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/chevrolet-camaro.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Chevrolet Camaro</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>39</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Exotic Car
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES245</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/hyundai-staria.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Hyundai Staria</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>23</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Minivan
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES191</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/toyota-rav.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Toyota Rav 4</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>63</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    SUV
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES114</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/bentley.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Bentley</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>45</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    SUV
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES299</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/lexus.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Lexus</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>61</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Sedan
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES131</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                        <div className="de-item mb30">
                            <div className="d-img">
                            <img
                                src="/cars/images/cars/range-rover.jpg"
                                className="img-fluid"
                                alt=""
                            />
                            </div>
                            <div className="d-info">
                            <div className="d-text">
                                <h4>Range Rover</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>69</span>
                                </div>
                                <div className="d-atr-group">
                                <span className="d-atr">
                                    <img src="/cars/images/icons/1-green.svg" alt="" />5
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/2-green.svg" alt="" />2
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/3-green.svg" alt="" />4
                                </span>
                                <span className="d-atr">
                                    <img src="/cars/images/icons/4-green.svg" alt="" />
                                    Exotic Car
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>KES228</span>
                                <Link className="btn-main" href={route('rent-now')}>
                                    Rent Now
                                </Link>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
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
