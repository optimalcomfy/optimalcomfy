import { useEffect } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
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
  const { car } = usePage().props;
  const url = usePage().url;

  const carId = (() => {
    const queryString = url.split('?')[1];
    if (!queryString) return null;
    const params = new URLSearchParams(queryString);
    return params.get('car_id');
  })();

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>
            <div className="no-bottom no-top zebra py-8" id="content">

              <section id="section-car-details">
                <div className="container">
                  <div className="row g-5">
                    <div className="col-lg-6">
                      <CarSlider images={car?.media || []} />
                    </div>
                    <div className="col-lg-3">
                      <h3>{`${car?.brand} ${car?.model} ${car?.year}`}</h3>
                      <p>{car?.description}</p>
                      <div className="spacer-10" />
                      <h4>Specifications</h4>
                      <div className="de-spec">
                        <div className="d-row"><span className="d-title">Body</span><span className="d-value">{car?.category?.name}</span></div>
                        <div className="d-row"><span className="d-title">Seat</span><span className="d-value">{car?.seats} seats</span></div>
                        <div className="d-row"><span className="d-title">Door</span><span className="d-value">{car?.doors} doors</span></div>
                        <div className="d-row"><span className="d-title">Luggage</span><span className="d-value">{car?.luggage_capacity}</span></div>
                        <div className="d-row"><span className="d-title">Fuel Type</span><span className="d-value">{car?.fuel_type}</span></div>
                        <div className="d-row"><span className="d-title">Engine</span><span className="d-value">{car?.engine_capacity}</span></div>
                        <div className="d-row"><span className="d-title">Year</span><span className="d-value">{car?.year}</span></div>
                        <div className="d-row"><span className="d-title">Mileage</span><span className="d-value">{car?.mileage}</span></div>
                        <div className="d-row"><span className="d-title">Transmission</span><span className="d-value">{car?.transmission}</span></div>
                        <div className="d-row"><span className="d-title">Drive</span><span className="d-value">{car?.drive_type}</span></div>
                        <div className="d-row"><span className="d-title">Fuel Economy</span><span className="d-value">{car?.fuel_economy}</span></div>
                        <div className="d-row"><span className="d-title">Exterior Color</span><span className="d-value">{car?.exterior_color}</span></div>
                        <div className="d-row"><span className="d-title">Interior Color</span><span className="d-value">{car?.interior_color}</span></div>
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
                        <h3>KES {car?.price_per_day}</h3>
                      </div>
                      <Link
                        href={route('car-booking', { car_id: carId })}
                        type="submit"
                        id="send_message"
                        className="btn-main btn-fullwidth"
                      >
                        Book now
                      </Link>
                      <div className="clearfix" />
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
