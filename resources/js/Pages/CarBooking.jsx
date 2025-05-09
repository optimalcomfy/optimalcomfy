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


export default function CarBooking({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, properties } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Event" />
          <HomeLayout>
          <div className="no-bottom no-top" id="content">
            <div id="top" />
            {/* section begin */}
            <section id="subheader" className="jarallax text-light">
                <img
                src="/cars/images/background/subheader.jpg"
                className="jarallax-img"
                alt=""
                />
                <div className="center-y relative text-center">
                <div className="container">
                    <div className="row">
                    <div className="col-md-12 text-center">
                        <h1>Quick Booking</h1>
                    </div>
                    <div className="clearfix" />
                    </div>
                </div>
                </div>
            </section>
            {/* section close */}
            <section
                id="section-hero"
                aria-label="section"
                className="no-top"
                style={{backgroundColor: '#121212'}}
            >
                <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-12 xs:-mt-4 lg:-mt-20 sm-mt-0">
                    <div className="spacer-single sm-hide" />
                    <div
                        id="booking_form_wrap"
                        className="padding40 rounded-5 shadow-soft"
                        style={{backgroundColor: '#ffffff'}}
                    >
                        <form
                        name="contactForm"
                        id="booking_form"
                        className="form-s2 row g-4 on-submit-hide"
                        method="post"
                        action="https://www.madebydesignesia.com/themes/rentaly/booking.php"
                        >
                        <div className="col-lg-6 d-light">
                            <h4>Booking a Car</h4>
                            <select
                            name="vehicle_type"
                            id="vehicle_type"
                            className="form-control"
                            >
                            <option
                                value="Jeep Renegade"
                                data-src="/cars/images/cars-alt/jeep-renegade.png"
                            >
                                Jeep Renegade - $265
                            </option>
                            <option value="BMW M5" data-src="/cars/images/cars-alt/bmw-m5.png">
                                BMW M5 - $544
                            </option>
                            <option
                                value="Ferrari Enzo"
                                data-src="/cars/images/cars-alt/ferrari-enzo.png"
                            >
                                Ferrari Enzo - $167
                            </option>
                            <option
                                value="Ford Raptor"
                                data-src="/cars/images/cars-alt/ford-raptor.png"
                            >
                                Ford Raptor - $147
                            </option>
                            <option
                                value="Mini Cooper"
                                data-src="/cars/images/cars-alt/mini-cooper.png"
                            >
                                Mini Cooper - $238
                            </option>
                            <option
                                value="Cheverolet Camaro"
                                data-src="/cars/images/cars-alt/vw-polo.png"
                            >
                                Cheverolet Camaro - $245
                            </option>
                            <option
                                value="Hyundai Staria"
                                data-src="/cars/images/cars-alt/hyundai-staria.png"
                            >
                                Hyundai Staria - $191
                            </option>
                            <option
                                value="Toyota Rav 4"
                                data-src="/cars/images/cars-alt/toyota-rav.png"
                            >
                                Toyota Rav 4 - $114
                            </option>
                            <option
                                value="Bentley"
                                data-src="/cars/images/cars-alt/bentley.png"
                            >
                                Bentley - $299
                            </option>
                            <option value="Lexus" data-src="/cars/images/cars-alt/lexus.png">
                                Lexus - $131
                            </option>
                            <option
                                value="Range Rover"
                                data-src="/cars/images/cars-alt/range-rover.png"
                            >
                                Range Rover - $228
                            </option>
                            </select>
                            <div className="row g-4">
                            <div className="col-lg-6">
                                <h5>Pick Up Location</h5>
                                <select
                                name="pickup_location"
                                id="pickup_location"
                                className="form-control"
                                >
                                <option value="New York">New York</option>
                                <option value="Pennsylvania">Pennsylvania</option>
                                <option value="New Jersey">New Jersey</option>
                                <option value="Connecticut">Connecticut</option>
                                <option value="Massachusetts">Massachusetts</option>
                                <option value="Vermont">Vermont</option>
                                <option value="Rhode Island">Rhode Island</option>
                                <option value="New Hampshire">New Hampshire</option>
                                </select>
                            </div>
                            <div className="col-lg-6">
                                <h5>Destination</h5>
                                <select
                                name="destination"
                                id="destination"
                                className="form-control"
                                >
                                <option value="New York">New York</option>
                                <option value="Pennsylvania">Pennsylvania</option>
                                <option value="New Jersey">New Jersey</option>
                                <option value="Connecticut">Connecticut</option>
                                <option value="Massachusetts">Massachusetts</option>
                                <option value="Vermont">Vermont</option>
                                <option value="Rhode Island">Rhode Island</option>
                                <option value="New Hampshire">New Hampshire</option>
                                </select>
                            </div>
                            <div className="col-lg-6">
                                <h5>Pick Up Date &amp; Time</h5>
                                <div className="date-time-field">
                                <input
                                    type="text"
                                    id="date-picker"
                                    name="pickup_date"
                                    defaultValue=""
                                />
                                <select name="pickup_time" id="pickup_time">
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
                            <div className="col-lg-6">
                                <h5>Return Date &amp; Time</h5>
                                <div className="date-time-field">
                                <input
                                    type="text"
                                    id="date-picker-2"
                                    name="return_date"
                                    defaultValue=""
                                />
                                <select name="return_time" id="return_time">
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
                        </div>
                        {/* customer details */}
                        <div className="col-lg-6">
                            <h4>Enter Your Details</h4>
                            <div className="row g-4">
                            <div className="col-lg-12">
                                <div className="field-set">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="form-control"
                                    placeholder="Your Name"
                                    required=""
                                />
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="field-set">
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="form-control"
                                    placeholder="Your Email"
                                    required=""
                                />
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="field-set">
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    className="form-control"
                                    placeholder="Your Phone"
                                    required=""
                                />
                                </div>
                            </div>
                            <div className="col-lg-12">
                                <div className="field-set">
                                <textarea
                                    name="message"
                                    id="message"
                                    className="form-control"
                                    placeholder="Do you have any request?"
                                    defaultValue={""}
                                />
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <p id="submit">
                            <input
                                type="submit"
                                id="send_message"
                                defaultValue="Submit"
                                className="btn-main btn-fullwidth"
                            />
                            </p>
                            <div id="mail_success" className="success">
                            Your message has been sent successfully.
                            </div>
                            <div id="mail_fail" className="error">
                            Sorry, error occured this time sending your message.
                            </div>
                        </div>
                        </form>
                        <div id="success_message" className="success s2">
                        <div className="row">
                            <div className="col-lg-8 offset-lg-2 text-light text-center">
                            <h3 className="mb-2">
                                Congratulations! Your booking has been sent successfully. We
                                will contact you shortly.
                            </h3>
                            Refresh this page if you want to booking again.
                            <div className="spacer-20" />
                            <a className="btn-main btn-black" href="quick-booking.html">
                                Reload this page
                            </a>
                            </div>
                        </div>
                        </div>
                        <div id="error_message" className="error">
                        Sorry there was an error sending your form.
                        </div>
                    </div>
                    <div id="success_message" className="bg-color text-light rounded-5">
                        <div className="p-5 text-center">
                        <h3 className="mb-2">
                            Congratulations! Your booking has been sent successfully. We
                            will contact you shortly.
                        </h3>
                        <p>Refresh this page if you want to booking again.</p>
                        <a className="btn-main bg-dark" href="#">
                            Reload this page
                        </a>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="spacer-double" />
                <div className="row text-light">
                    <div className="col-lg-12">
                    <div className="container-timeline">
                        <ul>
                        <li>
                            <h4>Choose a vehicle</h4>
                            <p>
                            Unlock unparalleled adventures and memorable journeys with our
                            vast fleet of vehicles tailored to suit every need, taste, and
                            destination.
                            </p>
                        </li>
                        <li>
                            <h4>Pick location &amp; date</h4>
                            <p>
                            Pick your ideal location and date, and let us take you on a
                            journey filled with convenience, flexibility, and
                            unforgettable experiences.
                            </p>
                        </li>
                        <li>
                            <h4>Make a booking</h4>
                            <p>
                            Secure your reservation with ease, unlocking a world of
                            possibilities and embarking on your next adventure with
                            confidence.
                            </p>
                        </li>
                        <li>
                            <h4>Sit back &amp; relax</h4>
                            <p>
                            Hassle-free convenience as we take care of every detail,
                            allowing you to unwind and embrace a journey filled comfort.
                            </p>
                        </li>
                        </ul>
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
