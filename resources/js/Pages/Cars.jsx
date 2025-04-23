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


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>

          <>
            {/* content begin */}
            <div className="no-bottom no-top" id="content">
                <div id="top" />
                <section
                id="section-hero"
                aria-label="section"
                className="jarallax no-top no-bottom bg-[url('/cars/images/background/1.jpg')]"
                >
                <div className="overlay-bg no-top no-bottom">
                    <div className="v-center">
                    <div className="container position-relative z1000">
                        <div className="spacer-double d-lg-none d-sm-block" />
                        <div className="spacer-double d-lg-none d-sm-block" />
                        <div className="spacer-double d-lg-none d-sm-block" />
                        <div className="row align-items-center">
                        <div className="col-lg-6 text-light">
                            <h4>
                            <span className="id-color">
                                Fast and Easy Way to Rent a Car
                            </span>
                            </h4>
                            <div className="spacer-10" />
                            <h1 className="mb-2">Explore the world with comfortable car</h1>
                            <div className="spacer-10" />
                            <p className="lead">
                            Embark on unforgettable adventures and discover the world in
                            unparalleled comfort and style with our fleet of exceptionally
                            comfortable cars.
                            </p>
                        </div>
                        <div className="col-lg-6 bg-black/50">
                            <div className="spacer-single sm-hide" />
                            <div
                            className="p-4 rounded-3 shadow-soft text-light"
                            data-bgcolor="rgba(0, 0, 0, .6)"
                            >
                            <form name="contactForm" id="contact_form" method="post">
                                <h5>What is your vehicle type?</h5>
                                <div className="de_form de_radio row g-3">
                                <div className="radio-img col-lg-3 col-sm-3 col-6">
                                    <input
                                    id="radio-1a"
                                    name="Car_Type"
                                    type="radio"
                                    defaultValue="Residential"
                                    defaultChecked="checked"
                                    />
                                    <label htmlFor="radio-1a">
                                    <img src="/cars/images/select-form/car.png" alt="" />
                                    Car
                                    </label>
                                </div>
                                <div className="radio-img col-lg-3 col-sm-3 col-6">
                                    <input
                                    id="radio-1b"
                                    name="Car_Type"
                                    type="radio"
                                    defaultValue="Office"
                                    />
                                    <label htmlFor="radio-1b">
                                    <img src="/cars/images/select-form/van.png" alt="" />
                                    Van
                                    </label>
                                </div>
                                <div className="radio-img col-lg-3 col-sm-3 col-6">
                                    <input
                                    id="radio-1c"
                                    name="Car_Type"
                                    type="radio"
                                    defaultValue="Commercial"
                                    />
                                    <label htmlFor="radio-1c">
                                    <img src="/cars/images/select-form/minibus.png" alt="" />
                                    Minibus
                                    </label>
                                </div>
                                <div className="radio-img col-lg-3 col-sm-3 col-6">
                                    <input
                                    id="radio-1d"
                                    name="Car_Type"
                                    type="radio"
                                    defaultValue="Retail"
                                    />
                                    <label htmlFor="radio-1d">
                                    <img src="/cars/images/select-form/sportscar.png" alt="" />
                                    Prestige
                                    </label>
                                </div>
                                </div>
                                <div className="spacer-20" />
                                <div className="row">
                                <div className="col-lg-6 mb20">
                                    <h5 className="text-xl">Pick Up Location</h5>
                                    <input
                                    type="text"
                                    name="PickupLocation"
                                    onfocus="geolocate()"
                                    placeholder="Enter your pickup location"
                                    id="autocomplete"
                                    autoComplete="off"
                                    className="form-control"
                                    />
                                    <div className="jls-address-preview jls-address-preview--hidden">
                                    <div className="jls-address-preview__header"></div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb20">
                                    <h5 className="text-xl">Drop Off Location</h5>
                                    <input
                                    type="text"
                                    name="DropoffLocation"
                                    onfocus="geolocate()"
                                    placeholder="Enter your dropoff location"
                                    id="autocomplete2"
                                    autoComplete="off"
                                    className="form-control"
                                    />
                                    <div className="jls-address-preview jls-address-preview--hidden">
                                    <div className="jls-address-preview__header"></div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb20">
                                    <h5 className="text-xl">Pick Up Date &amp; Time</h5>
                                    <div className="date-time-field">
                                    <input
                                        type="text"
                                        id="date-picker"
                                        name="Pick Up Date"
                                        defaultValue=""
                                    />
                                    <select name="Pick Up Time" id="pickup-time">
                                        <option selected="" disabled="" value="Select time">
                                        Time
                                        </option>
                                        <option value="00:00">00:00</option>
                                        <option value="00:30">00:30</option>
                                        <option value="01:00">01:00</option>
                                        <option value="01:30">01:30</option>
                                        <option value="02:00">02:00</option>
                                        <option value="02:30">02:30</option>
                                        <option value="03:00">03:00</option>
                                        <option value="03:30">03:30</option>
                                        <option value="04:00">04:00</option>
                                        <option value="04:30">04:30</option>
                                        <option value="05:00">05:00</option>
                                        <option value="05:30">05:30</option>
                                        <option value="06:00">06:00</option>
                                        <option value="06:30">06:30</option>
                                        <option value="07:00">07:00</option>
                                        <option value="07:30">07:30</option>
                                        <option value="08:00">08:00</option>
                                        <option value="08:30">08:30</option>
                                        <option value="09:00">09:00</option>
                                        <option value="09:30">09:30</option>
                                        <option value="10:00">10:00</option>
                                        <option value="10:30">10:30</option>
                                        <option value="11:00">11:00</option>
                                        <option value="11:30">11:30</option>
                                        <option value="12:00">12:00</option>
                                        <option value="12:30">12:30</option>
                                        <option value="13:00">13:00</option>
                                        <option value="13:30">13:30</option>
                                        <option value="14:00">14:00</option>
                                        <option value="14:30">14:30</option>
                                        <option value="15:00">15:00</option>
                                        <option value="15:30">15:30</option>
                                        <option value="16:00">16:00</option>
                                        <option value="16:30">16:30</option>
                                        <option value="17:00">17:00</option>
                                        <option value="17:30">17:30</option>
                                        <option value="18:00">18:00</option>
                                        <option value="18:30">18:30</option>
                                        <option value="19:00">19:00</option>
                                        <option value="19:30">19:30</option>
                                        <option value="20:00">20:00</option>
                                        <option value="20:30">20:30</option>
                                        <option value="21:00">21:00</option>
                                        <option value="21:30">21:30</option>
                                        <option value="22:00">22:00</option>
                                        <option value="22:30">22:30</option>
                                        <option value="23:00">23:00</option>
                                        <option value="23:30">23:30</option>
                                    </select>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb20">
                                    <h5 className="text-xl">Return Date &amp; Time</h5>
                                    <div className="date-time-field">
                                    <input
                                        type="text"
                                        id="date-picker-2"
                                        name="Collection Date"
                                        defaultValue=""
                                    />
                                    <select name="Collection Time" id="collection-time">
                                        <option selected="" disabled="" value="Select time">
                                        Time
                                        </option>
                                        <option value="00:00">00:00</option>
                                        <option value="00:30">00:30</option>
                                        <option value="01:00">01:00</option>
                                        <option value="01:30">01:30</option>
                                        <option value="02:00">02:00</option>
                                        <option value="02:30">02:30</option>
                                        <option value="03:00">03:00</option>
                                        <option value="03:30">03:30</option>
                                        <option value="04:00">04:00</option>
                                        <option value="04:30">04:30</option>
                                        <option value="05:00">05:00</option>
                                        <option value="05:30">05:30</option>
                                        <option value="06:00">06:00</option>
                                        <option value="06:30">06:30</option>
                                        <option value="07:00">07:00</option>
                                        <option value="07:30">07:30</option>
                                        <option value="08:00">08:00</option>
                                        <option value="08:30">08:30</option>
                                        <option value="09:00">09:00</option>
                                        <option value="09:30">09:30</option>
                                        <option value="10:00">10:00</option>
                                        <option value="10:30">10:30</option>
                                        <option value="11:00">11:00</option>
                                        <option value="11:30">11:30</option>
                                        <option value="12:00">12:00</option>
                                        <option value="12:30">12:30</option>
                                        <option value="13:00">13:00</option>
                                        <option value="13:30">13:30</option>
                                        <option value="14:00">14:00</option>
                                        <option value="14:30">14:30</option>
                                        <option value="15:00">15:00</option>
                                        <option value="15:30">15:30</option>
                                        <option value="16:00">16:00</option>
                                        <option value="16:30">16:30</option>
                                        <option value="17:00">17:00</option>
                                        <option value="17:30">17:30</option>
                                        <option value="18:00">18:00</option>
                                        <option value="18:30">18:30</option>
                                        <option value="19:00">19:00</option>
                                        <option value="19:30">19:30</option>
                                        <option value="20:00">20:00</option>
                                        <option value="20:30">20:30</option>
                                        <option value="21:00">21:00</option>
                                        <option value="21:30">21:30</option>
                                        <option value="22:00">22:00</option>
                                        <option value="22:30">22:30</option>
                                        <option value="23:00">23:00</option>
                                        <option value="23:30">23:30</option>
                                    </select>
                                    </div>
                                </div>
                                </div>
                                <Link
                                href={route('search-cars')}
                                type="submit"
                                id="send_message"
                                defaultValue="Find a Vehicle"
                                className="btn-main pull-right"
                                >Search cars</Link>
                                <div className="clearfix" />
                            </form>
                            </div>
                        </div>
                        </div>
                        <div className="spacer-double d-lg-none d-sm-block" />
                        <div className="spacer-double d-lg-none d-sm-block" />
                    </div>
                    <div className="position-absolute d-flex bottom-20">
                        <div className="de-marquee-list d-marquee-small">
                        <div className="d-item">
                            <span className="d-item-txt">SUV</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Hatchback</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Crossover</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Convertible</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Sedan</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Sports Car</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Coupe</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Minivan</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Station Wagon</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Truck</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Minivans</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Exotic Cars</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                        </div>
                        </div>
                        <div className="de-marquee-list d-marquee-small">
                        <div className="d-item">
                            <span className="d-item-txt">SUV</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Hatchback</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Crossover</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Convertible</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Sedan</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Sports Car</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Coupe</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Minivan</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Station Wagon</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Truck</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Minivans</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                            <span className="d-item-txt">Exotic Cars</span>
                            <span className="d-item-display">
                            <i className="d-item-dot" />
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section id="section-cars">
                <div className="container">
                    <div className="row align-items-center">
                    <div className="col-lg-6 offset-lg-3 text-center">
                        <h2>Our Vehicle Fleet</h2>
                        <p>
                        Driving your dreams to reality with an exquisite fleet of
                        versatile vehicles for unforgettable journeys.
                        </p>
                        <div className="spacer-20" />
                    </div>
                    <div className="clearfix" />
                    <div id="items-carousel" className="owl-carousel wow fadeIn">
                        <div className="col-lg-12">
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
                                <span>74</span>
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
                                Daily rate from <span>$265</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-lg-12">
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
                                <h4>BMW M2</h4>
                                <div className="d-item_like">
                                <i className="fa fa-heart" />
                                <span>36</span>
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
                                Daily rate from <span>$244</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-lg-12">
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
                                <span>85</span>
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
                                Daily rate from <span>$167</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-lg-12">
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
                                <span>59</span>
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
                                Daily rate from <span>$147</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-lg-12">
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
                                <span>19</span>
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
                                Daily rate from <span>$238</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                        <div className="col-lg-12">
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
                                    Hatchback
                                </span>
                                </div>
                                <div className="d-price">
                                Daily rate from <span>$106</span>
                                <a className="btn-main" href="car-single.html">
                                    Rent Now
                                </a>
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section className="text-light jarallax">
                <img src="/cars/images/background/2.jpg" className="jarallax-img" alt="" />
                <div className="container">
                    <div className="row g-5">
                    <div className="col-lg-6 wow fadeInRight">
                        <h2>
                        We offer customers a wide range of{" "}
                        <span className="id-color">commercial cars</span> and{" "}
                        <span className="id-color">luxury cars</span> for any occasion.
                        </h2>
                    </div>
                    <div className="col-lg-6 wow fadeInLeft">
                        At our car rental agency, we believe that everyone deserves to
                        experience the pleasure of driving a reliable and comfortable
                        vehicle, regardless of their budget. We have curated a diverse fleet
                        of well-maintained cars, ranging from sleek sedans to spacious SUVs,
                        all at competitive prices. With our streamlined rental process, you
                        can quickly and conveniently reserve your desired vehicle. Whether
                        you need transportation for a business trip, family vacation, or
                        simply want to enjoy a weekend getaway, we have flexible rental
                        options to accommodate your schedule.
                    </div>
                    </div>
                    <div className="spacer-double" />
                    <div className="row text-center">
                    <div className="col-md-3 col-sm-6 mb-sm-30">
                        <div className="de_count transparent text-light wow fadeInUp">
                        <h3 className="timer" data-to={15425} data-speed={3000}>
                            0
                        </h3>
                        Completed Orders
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-sm-30">
                        <div className="de_count transparent text-light wow fadeInUp">
                        <h3 className="timer" data-to={8745} data-speed={3000}>
                            0
                        </h3>
                        Happy Customers
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-sm-30">
                        <div className="de_count transparent text-light wow fadeInUp">
                        <h3 className="timer" data-to={235} data-speed={3000}>
                            0
                        </h3>
                        Vehicles Fleet
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 mb-sm-30">
                        <div className="de_count transparent text-light wow fadeInUp">
                        <h3 className="timer" data-to={15} data-speed={3000}>
                            0
                        </h3>
                        Years Experience
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section aria-label="section">
                <div className="container">
                    <div className="row align-items-center">
                    <div className="col-lg-6 offset-lg-3 text-center">
                        <h2>Our Features</h2>
                        <p>
                        Discover a world of convenience, safety, and customization, paving
                        the way for unforgettable adventures and seamless mobility
                        solutions.
                        </p>
                        <div className="spacer-20" />
                    </div>
                    <div className="clearfix" />
                    <div className="col-lg-3">
                        <div
                        className="box-icon s2 p-small mb20 wow fadeInRight"
                        data-wow-delay=".5s"
                        >
                        <i className="fa bg-color fa-trophy" />
                        <div className="d-inner">
                            <h4>First class services</h4>
                            Where luxury meets exceptional care, creating unforgettable
                            moments and exceeding your every expectation.
                        </div>
                        </div>
                        <div
                        className="box-icon s2 p-small mb20 wow fadeInL fadeInRight"
                        data-wow-delay=".75s"
                        >
                        <i className="fa bg-color fa-road" />
                        <div className="d-inner">
                            <h4>24/7 road assistance</h4>
                            Reliable support when you need it most, keeping you on the move
                            with confidence and peace of mind.
                        </div>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <img
                        src="/cars/images/misc/car-2.png"
                        alt=""
                        className="img-fluid wow fadeInUp"
                        />
                    </div>
                    <div className="col-lg-3">
                        <div
                        className="box-icon s2 d-invert p-small mb20 wow fadeInL fadeInLeft"
                        data-wow-delay="1s"
                        >
                        <i className="fa bg-color fa-tag" />
                        <div className="d-inner">
                            <h4>Quality at Minimum Expense</h4>
                            Unlocking affordable brilliance with elevating quality while
                            minimizing costs for maximum value.
                        </div>
                        </div>
                        <div
                        className="box-icon s2 d-invert p-small mb20 wow fadeInL fadeInLeft"
                        data-wow-delay="1.25s"
                        >
                        <i className="fa bg-color fa-map-pin" />
                        <div className="d-inner">
                            <h4>Free Pick-Up &amp; Drop-Off</h4>
                            Enjoy free pickup and drop-off services, adding an extra layer
                            of ease to your car rental experience.
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section id="section-img-with-tab" className="bg-dark text-light">
                <div className="container">
                    <div className="row align-items-center">
                    <div className="col-lg-5 offset-lg-7">
                        <h2>Only Quality For Clients</h2>
                        <div className="spacer-20" />
                        <ul className="nav nav-pills mb-3" id="pills-tab" role="tablist">
                        <li className="nav-item" role="presentation">
                            <button
                            className="nav-link active"
                            id="pills-home-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-home"
                            type="button"
                            role="tab"
                            aria-controls="pills-home"
                            aria-selected="true"
                            >
                            Luxury
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                            className="nav-link"
                            id="pills-profile-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-profile"
                            type="button"
                            role="tab"
                            aria-controls="pills-profile"
                            aria-selected="false"
                            >
                            Comfort
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                            className="nav-link"
                            id="pills-contact-tab"
                            data-bs-toggle="pill"
                            data-bs-target="#pills-contact"
                            type="button"
                            role="tab"
                            aria-controls="pills-contact"
                            aria-selected="false"
                            >
                            Prestige
                            </button>
                        </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                        <div
                            className="tab-pane fade show active"
                            id="pills-home"
                            role="tabpanel"
                            aria-labelledby="pills-home-tab"
                        >
                            <p>
                            We offer a meticulously curated collection of the most
                            sought-after luxury vehicles on the market. Whether you prefer
                            the sporty allure of a high-performance sports car, the
                            sophistication of a sleek and luxurious sedan, or the
                            versatility of a premium SUV, we have the perfect car to match
                            your discerning taste.
                            </p>
                        </div>
                        <div
                            className="tab-pane fade"
                            id="pills-profile"
                            role="tabpanel"
                            aria-labelledby="pills-profile-tab"
                        >
                            <p>
                            We prioritize your comfort and convenience throughout your
                            journey. We understand that a comfortable ride can make a
                            world of difference, whether you're embarking on a business
                            trip or enjoying a leisurely vacation. That's why we offer a
                            wide range of well-maintained, comfortable cars that cater to
                            your specific needs.
                            </p>
                        </div>
                        <div
                            className="tab-pane fade"
                            id="pills-contact"
                            role="tabpanel"
                            aria-labelledby="pills-contact-tab"
                        >
                            <p>
                            We understand that prestige goes beyond luxury. It's about
                            making a statement, embracing sophistication, and indulging in
                            the finer things in life. That's why we offer an exclusive
                            selection of prestigious cars that exude elegance, style, and
                            status.
                            </p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                <div
                    className="image-container col-md-6 pull-right bg-[url('/cars/images/misc/e2.jpg')] text-center"
                />
                </section>
                <section id="section-news">
                <div className="container">
                    <div className="row align-items-center">
                    <div className="col-lg-6 offset-lg-3 text-center">
                        <h2>Latest News</h2>
                        <p>
                        Breaking news, fresh perspectives, and in-depth coverage - stay
                        ahead with our latest news, insights, and analysis.
                        </p>
                        <div className="spacer-20" />
                    </div>
                    <div className="col-lg-4 mb10">
                        <div className="bloglist s2 item">
                        <div className="post-content">
                            <div className="post-image">
                            <div className="date-box">
                                <div className="m">10</div>
                                <div className="d">MAR</div>
                            </div>
                            <img
                                alt=""
                                src="/cars/images/news/pic-blog-1.jpg"
                                className="lazy"
                            />
                            </div>
                            <div className="post-text">
                            <h4>
                                <a href="news-single.html">
                                Enjoy Best Travel Experience
                                <span />
                                </a>
                            </h4>
                            <p>
                                Dolore officia sint incididunt non excepteur ea mollit
                                commodo ut enim reprehenderit cupidatat labore ad laborum
                                consectetur.
                            </p>
                            <a className="btn-main" href="#">
                                Read More
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="col-lg-4 mb10">
                        <div className="bloglist s2 item">
                        <div className="post-content">
                            <div className="post-image">
                            <div className="date-box">
                                <div className="m">12</div>
                                <div className="d">MAR</div>
                            </div>
                            <img
                                alt=""
                                src="/cars/images/news/pic-blog-2.jpg"
                                className="lazy"
                            />
                            </div>
                            <div className="post-text">
                            <h4>
                                <a href="news-single.html">
                                The Future of Car Rent
                                <span />
                                </a>
                            </h4>
                            <p>
                                Dolore officia sint incididunt non excepteur ea mollit
                                commodo ut enim reprehenderit cupidatat labore ad laborum
                                consectetur.
                            </p>
                            <a className="btn-main" href="#">
                                Read More
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="col-lg-4 mb10">
                        <div className="bloglist s2 item">
                        <div className="post-content">
                            <div className="post-image">
                            <div className="date-box">
                                <div className="m">14</div>
                                <div className="d">MAR</div>
                            </div>
                            <img
                                alt=""
                                src="/cars/images/news/pic-blog-3.jpg"
                                className="lazy"
                            />
                            </div>
                            <div className="post-text">
                            <h4>
                                <a href="news-single.html">
                                Holiday Tips For Backpacker
                                <span />
                                </a>
                            </h4>
                            <p>
                                Dolore officia sint incididunt non excepteur ea mollit
                                commodo ut enim reprehenderit cupidatat labore ad laborum
                                consectetur.
                            </p>
                            <a className="btn-main" href="#">
                                Read More
                            </a>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section id="section-testimonials" className="no-top no-bottom">
                <div className="container-fluid">
                    <div className="row g-2 p-2 align-items-center">
                    <div className="col-md-4">
                        <div className="de-image-text">
                        <div className="d-text">
                            <div className="d-quote id-color">
                            <i className="fa fa-quote-right" />
                            </div>
                            <h4>Excellent Service! Car Rent Service!</h4>
                            <blockquote>
                            I have been using Rentaly for my Car Rental needs for over 5
                            years now. I have never had any problems with their service.
                            Their customer support is always responsive and helpful. I
                            would recommend Rentaly to anyone looking for a reliable Car
                            Rental provider.
                            <span className="by">Stepanie Hutchkiss</span>
                            </blockquote>
                        </div>
                        <img
                            src="/cars/images/testimonial/1.jpg"
                            className="img-fluid"
                            alt=""
                        />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="de-image-text">
                        <div className="d-text">
                            <div className="d-quote id-color">
                            <i className="fa fa-quote-right" />
                            </div>
                            <h4>Excellent Service! Car Rent Service!</h4>
                            <blockquote>
                            We have been using Rentaly for our trips needs for several
                            years now and have always been happy with their service. Their
                            customer support is Excellent Service! and they are always
                            available to help with any issues we have. Their prices are
                            also very competitive.
                            <span className="by">Jovan Reels</span>
                            </blockquote>
                        </div>
                        <img
                            src="/cars/images/testimonial/2.jpg"
                            className="img-fluid"
                            alt=""
                        />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="de-image-text">
                        <div className="d-text">
                            <div className="d-quote id-color">
                            <i className="fa fa-quote-right" />
                            </div>
                            <h4>Excellent Service! Car Rent Service!</h4>
                            <blockquote>
                            Endorsed by industry experts, Rentaly is the Car Rental
                            solution you can trust. With years of experience in the field,
                            we provide fast, reliable and secure Car Rental services.
                            <span className="by">Kanesha Keyton</span>
                            </blockquote>
                        </div>
                        <img
                            src="/cars/images/testimonial/3.jpg"
                            className="img-fluid"
                            alt=""
                        />
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section id="section-faq">
                <div className="container">
                    <div className="row">
                    <div className="col text-center">
                        <h2>Have Any Questions?</h2>
                        <div className="spacer-20" />
                    </div>
                    </div>
                    <div className="row g-custom-x">
                    <div className="col-md-6 wow fadeInUp">
                        <div className="accordion secondary">
                        <div className="accordion-section">
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-1"
                            >
                            How do I get started with Car Rental?
                            </div>
                            <div className="accordion-section-content" id="accordion-1">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-2"
                            >
                            Can I rent a car with a debit card??
                            </div>
                            <div className="accordion-section-content" id="accordion-2">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-3"
                            >
                            What kind of Car Rental do I need?
                            </div>
                            <div className="accordion-section-content" id="accordion-3">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div className="col-md-6 wow fadeInUp">
                        <div className="accordion secondary">
                        <div className="accordion-section">
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-b-4"
                            >
                            What is a rental car security deposit?
                            </div>
                            <div className="accordion-section-content" id="accordion-b-4">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-b-5"
                            >
                            Can I cancel or modify my reservation?
                            </div>
                            <div className="accordion-section-content" id="accordion-b-5">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                            <div
                            className="accordion-section-title"
                            data-tab="#accordion-b-6"
                            >
                            Is it possible to extend my rental period?
                            </div>
                            <div className="accordion-section-content" id="accordion-b-6">
                            <p>
                                At vero eos et accusamus et iusto odio dignissimos ducimus
                                qui blanditiis praesentium voluptatum deleniti atque
                                corrupti quos dolores et quas molestias excepturi sint
                                occaecati cupiditate non provident, similique sunt in culpa
                                qui officia deserunt mollitia animi, id est laborum et
                                dolorum fuga. Et harum quidem rerum facilis est et expedita
                                distinctio.
                            </p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
                <section
                id="section-call-to-action"
                className="bg-color-2 pt60 pb60 text-light"
                >
                <div className="container">
                    <div className="container">
                    <div className="row">
                        <div className="col-lg-4 offset-lg-2">
                        <span className="subtitle text-white">
                            Call us for further information
                        </span>
                        <h2 className="s2">
                            Rentaly customer care is here to help you anytime.
                        </h2>
                        </div>
                        <div className="col-lg-4 text-lg-center text-sm-center">
                        <div className="phone-num-big">
                            <i className="fa fa-phone" />
                            <span className="pnb-text">Call Us Now</span>
                            <span className="pnb-num">1 200 333 800</span>
                        </div>
                        <a href="#" className="btn-main">
                            Contact Us
                        </a>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
            </div>
            </>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
