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
            </div>
            </>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
