import { useState, useEffect } from "react";
import { Link, Head, router, usePage, useForm } from "@inertiajs/react"; // Import useForm
import {
    LayoutContext,
    LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'


export default function Welcome({ auth, laravelVersion, phpVersion }) { // Add any other props your page might receive

    const { flash } = usePage().props; // Removed pagination as it's not used in the provided snippet

    // Initialize form data and setData function using useForm
    // The keys correspond to the 'name' attributes of your form inputs
    // or a chosen convention if 'name' is not present/suitable.
    const { data, setData, errors } = useForm({
        Car_Type: "Residential", // Default value from 'defaultChecked' radio button
        PickupLocation: "",
        DropoffLocation: "",
        "Pick Up Date": "", // Key matches the 'name' attribute
        "Pick Up Time": "", // Key matches the 'name' attribute
        "Collection Date": "", // Key matches the 'name' attribute
        "Collection Time": "", // Key matches the 'name' attribute
    });

    // This function will be called when any form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    // Handle radio button changes specifically if needed, or use name attribute directly
    const handleRadioChange = (e) => {
        setData("Car_Type", e.target.value);
    };

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
                                                            {/* The form tag itself won't submit traditionally here */}
                                                            <form name="contactForm" id="contact_form" onSubmit={(e) => e.preventDefault()}>
                                                                <h5>What is your vehicle type?</h5>
                                                                <div className="de_form de_radio row g-3">
                                                                    {/* Car */}
                                                                    <div className="radio-img col-lg-3 col-sm-3 col-6">
                                                                        <input
                                                                            id="radio-1a"
                                                                            name="Car_Type"
                                                                            type="radio"
                                                                            value="Residential"
                                                                            checked={data.Car_Type === "Residential"}
                                                                            onChange={handleRadioChange}
                                                                        />
                                                                        <label htmlFor="radio-1a">
                                                                            <img src="/cars/images/select-form/car.png" alt="Car" />
                                                                            Car
                                                                        </label>
                                                                    </div>
                                                                    {/* Van */}
                                                                    <div className="radio-img col-lg-3 col-sm-3 col-6">
                                                                        <input
                                                                            id="radio-1b"
                                                                            name="Car_Type"
                                                                            type="radio"
                                                                            value="Office" // Assuming "Office" maps to Van, or use "Van"
                                                                            checked={data.Car_Type === "Office"}
                                                                            onChange={handleRadioChange}
                                                                        />
                                                                        <label htmlFor="radio-1b">
                                                                            <img src="/cars/images/select-form/van.png" alt="Van" />
                                                                            Van
                                                                        </label>
                                                                    </div>
                                                                    {/* Minibus */}
                                                                    <div className="radio-img col-lg-3 col-sm-3 col-6">
                                                                        <input
                                                                            id="radio-1c"
                                                                            name="Car_Type"
                                                                            type="radio"
                                                                            value="Commercial" // Assuming "Commercial" maps to Minibus, or use "Minibus"
                                                                            checked={data.Car_Type === "Commercial"}
                                                                            onChange={handleRadioChange}
                                                                        />
                                                                        <label htmlFor="radio-1c">
                                                                            <img src="/cars/images/select-form/minibus.png" alt="Minibus" />
                                                                            Minibus
                                                                        </label>
                                                                    </div>
                                                                    {/* Prestige */}
                                                                    <div className="radio-img col-lg-3 col-sm-3 col-6">
                                                                        <input
                                                                            id="radio-1d"
                                                                            name="Car_Type"
                                                                            type="radio"
                                                                            value="Retail" // Assuming "Retail" maps to Prestige, or use "Prestige"
                                                                            checked={data.Car_Type === "Retail"}
                                                                            onChange={handleRadioChange}
                                                                        />
                                                                        <label htmlFor="radio-1d">
                                                                            <img src="/cars/images/select-form/sportscar.png" alt="Prestige Car" />
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
                                                                            value={data.PickupLocation}
                                                                            onChange={handleChange}
                                                                            onFocus={(e) => typeof geolocate === 'function' && geolocate()} // Keep existing onfocus if geolocate is a global function
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
                                                                            value={data.DropoffLocation}
                                                                            onChange={handleChange}
                                                                            onFocus={(e) => typeof geolocate === 'function' && geolocate()}
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
                                                                                type="text" // Assuming a date picker library hydrates this
                                                                                id="date-picker"
                                                                                name="Pick Up Date"
                                                                                value={data["Pick Up Date"]}
                                                                                onChange={handleChange}
                                                                                placeholder="Select date" // Added placeholder
                                                                            />
                                                                            <select name="Pick Up Time" id="pickup-time" value={data["Pick Up Time"]} onChange={handleChange}>
                                                                                <option value="">Time</option>
                                                                                {/* Populate time options */}
                                                                                {Array.from({ length: 48 }, (_, i) => {
                                                                                    const hours = Math.floor(i / 2);
                                                                                    const minutes = (i % 2) * 30;
                                                                                    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                                                                    return <option key={time} value={time}>{time}</option>;
                                                                                })}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-lg-6 mb20">
                                                                        <h5 className="text-xl">Return Date &amp; Time</h5>
                                                                        <div className="date-time-field">
                                                                            <input
                                                                                type="text" // Assuming a date picker library hydrates this
                                                                                id="date-picker-2"
                                                                                name="Collection Date"
                                                                                value={data["Collection Date"]}
                                                                                onChange={handleChange}
                                                                                placeholder="Select date" // Added placeholder
                                                                            />
                                                                            <select name="Collection Time" id="collection-time" value={data["Collection Time"]} onChange={handleChange}>
                                                                                <option value="">Time</option>
                                                                                {/* Populate time options */}
                                                                                {Array.from({ length: 48 }, (_, i) => {
                                                                                    const hours = Math.floor(i / 2);
                                                                                    const minutes = (i % 2) * 30;
                                                                                    const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                                                                    return <option key={time} value={time}>{time}</option>;
                                                                                })}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {/* Update Link to pass form data */}
                                                                <Link
                                                                    href={route('search-cars')}
                                                                    data={data} // Inertia will append 'data' object as query parameters
                                                                    // `as="button"` can be used if you want it to be a <button> element for styling/semantic reasons
                                                                    // while still performing navigation.
                                                                    // type="button" if `as="button"` to prevent form submission if it were a submit button.
                                                                    className="btn-main pull-right"
                                                                >
                                                                    Search cars
                                                                </Link>
                                                                <div className="clearfix" />
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="spacer-double d-lg-none d-sm-block" />
                                                <div className="spacer-double d-lg-none d-sm-block" />
                                            </div>
                                            <div className="position-absolute d-flex bottom-20">
                                                {/* Marquee content remains unchanged */}
                                                <div className="de-marquee-list d-marquee-small">
                                                    <div className="d-item">
                                                        <span className="d-item-txt">SUV</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Hatchback</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Crossover</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Convertible</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Sedan</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Sports Car</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Coupe</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Minivan</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Station Wagon</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Truck</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Minivans</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Exotic Cars</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                    </div>
                                                </div>
                                                <div className="de-marquee-list d-marquee-small">
                                                    <div className="d-item">
                                                        <span className="d-item-txt">SUV</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Hatchback</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Crossover</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Convertible</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Sedan</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Sports Car</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Coupe</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Minivan</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Station Wagon</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Truck</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Minivans</span><span className="d-item-display"><i className="d-item-dot" /></span>
                                                        <span className="d-item-txt">Exotic Cars</span><span className="d-item-display"><i className="d-item-dot" /></span>
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