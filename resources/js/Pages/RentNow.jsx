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
import CarSlider from "@/Components/CarSlider";


export default function RentNow({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>
          <>
            {/* content begin */}
            <div className="no-bottom no-top zebra" id="content">
                <div id="top" />
                {/* section begin */}
                <section id="subheader" className="jarallax text-light">
                <img src="/cars/images/background/2.jpg" className="jarallax-img" alt="" />
                <div className="center-y relative text-center">
                    <div className="container">
                    <div className="row">
                        <div className="col-md-12 text-center">
                        <h1>Vehicle Fleet</h1>
                        </div>
                        <div className="clearfix" />
                    </div>
                    </div>
                </div>
                </section>
                {/* section close */}
                <section id="section-car-details">
                <div className="container">
                    <div className="row g-5">
                    <div className="col-lg-6">
                       <CarSlider />
                    </div>
                    <div className="col-lg-3">
                        <h3>BMW M2 2020</h3>
                        <p>
                        The BMW M2 is the high-performance version of the 2 Series 2-door
                        coupé. The first generation of the M2 is the F87 coupé and is
                        powered by turbocharged.
                        </p>
                        <div className="spacer-10" />
                        <h4>Specifications</h4>
                        <div className="de-spec">
                        <div className="d-row">
                            <span className="d-title">Body</span>
                            <spam className="d-value">Sedan</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Seat</span>
                            <spam className="d-value">2 seats</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Door</span>
                            <spam className="d-value">2 doors</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Luggage</span>
                            <spam className="d-value">150</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Fuel Type</span>
                            <spam className="d-value">Hybird</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Engine</span>
                            <spam className="d-value">3000</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Year</span>
                            <spam className="d-value">2020</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Mileage</span>
                            <spam className="d-value">200</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Transmission</span>
                            <spam className="d-value">Automatic</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Drive</span>
                            <spam className="d-value">4WD</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Fuel Economy</span>
                            <spam className="d-value">18.5</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Exterior Color</span>
                            <spam className="d-value">Blue Metalic</spam>
                        </div>
                        <div className="d-row">
                            <span className="d-title">Interior Color</span>
                            <spam className="d-value">Black</spam>
                        </div>
                        </div>
                        <div className="spacer-single" />
                        <h4>Features</h4>
                        <ul className="ul-style-2">
                        <li>Bluetooth</li>
                        <li>Multimedia Player</li>
                        <li>Central Lock</li>
                        <li>Sunroof</li>
                        </ul>
                    </div>
                    <div className="col-lg-3">
                        <div className="de-price text-center">
                        Daily rate
                        <h3>$265</h3>
                        </div>
                        <div className="spacer-30" />
                        <div className="de-box mb25">
                        <form name="contactForm" id="contact_form" method="post">
                            <h4>Booking this car</h4>
                            <div className="spacer-20" />
                            <div className="row">
                            <div className="col-lg-12 mb20">
                                <h5>Pick Up Location</h5>
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
                            <div className="col-lg-12 mb20">
                                <h5>Drop Off Location</h5>
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
                            <div className="col-lg-12 mb20">
                                <h5>Pick Up Date &amp; Time</h5>
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
                            <div className="col-lg-12 mb20">
                                <h5>Return Date &amp; Time</h5>
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
                            href={route('car-booking')}
                            type="submit"
                            id="send_message"
                            defaultValue="Book Now"
                            className="btn-main btn-fullwidth"
                            >Book now</Link>
                            <div className="clearfix" />
                        </form>
                        </div>
                        <div className="de-box">
                        <h4>Share</h4>
                        <div className="de-color-icons">
                            <span>
                            <i className="fa fa-twitter fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-facebook fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-reddit fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-linkedin fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-pinterest fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-stumbleupon fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-delicious fa-lg" />
                            </span>
                            <span>
                            <i className="fa fa-envelope fa-lg" />
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
