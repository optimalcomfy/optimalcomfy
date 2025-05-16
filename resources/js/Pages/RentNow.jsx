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

    const url = usePage().url;

    const carId = (() => {
        const queryString = url.split('?')[1]; // get part after ?
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('car_id'); // returns string | null
    })();

    
  
  
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
                    <div className="col-lg-3 flex flex-col gap-4">
                        <div className="de-price text-center mt-4">
                        Daily rate
                        <h3>KES 265</h3>
                        </div>
                            <Link
                            href={route('car-booking',{ car_id: carId })}
                            type="submit"
                            id="send_message"
                            defaultValue="Book Now"
                            className="btn-main btn-fullwidth"
                            >Book now</Link>
                            <div className="clearfix" />
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
