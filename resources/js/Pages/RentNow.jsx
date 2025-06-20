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
import CarRideForm from "@/Components/CarRideForm";

export default function RentNow({ auth, laravelVersion, phpVersion }) {
  const { car } = usePage().props;
  const url = usePage().url;

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Cars" />
          <HomeLayout>
            <div className="py-8 container mx-auto">
              {/* Main Section */}
              <section className="main">
                <div className="container f-reverse">
                  <h2 className="hero__heading">
                    {car?.brand} {car?.model} {car?.year} - {car?.category?.name}
                  </h2>
                  {/* meta data */}
                  <div className="meta-data__container">
                    <div className="meta-data">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car?.location_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location min-w-[240px]"
                      >
                        {car?.location_address}
                      </a>
                    </div>
                  </div>
                  {/* images */}
                  {car?.initial_gallery?.length > 1 ? (
                    <>
                      {car?.initial_gallery[0]?.image && (
                        <div className="hero-images">
                          <div className="img__container--hero">
                            <img src={`/storage/${car?.initial_gallery[0]?.image}`} alt="car" />
                          </div>
                          {car?.initial_gallery[1]?.image && (
                            <div className="img__collage">
                              <div className="img__container">
                                <img src={`/storage/${car?.initial_gallery[1]?.image}`} alt="car" />
                              </div>
                              
                              <div className="img__container">
                                {car?.initial_gallery[2]?.image && (
                                  <img src={`/storage/${car?.initial_gallery[2]?.image}`} alt="car" />
                                )}
                              </div>
                             
                              <div className="img__container">
                                {car?.initial_gallery[3]?.image && (
                                  <img src={`/storage/${car?.initial_gallery[3]?.image}`} alt="car" />
                                )}
                              </div>
                              
                              <div className="img__container">
                                {car?.initial_gallery[4]?.image && (
                                  <img src={`/storage/${car?.initial_gallery[4]?.image}`} alt="car" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {car?.initial_gallery[0]?.image && (
                        <div className="rounded-lg overflow-hidden mt-4">
                          <img 
                            src={`/storage/${car?.initial_gallery[0]?.image}`} 
                            className="w-full h-[50vh] object-cover object-center" 
                            alt="car" 
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
              <div className="container-m">
                <hr />
              </div>
              {/* Details Section */}
              <section className="section">
                <div className="container container--details container-m">
                  <div className="section__content">
                    <div className="heading">
                      <div className="heading__title">
                        <h3 className="content-title">
                          Owned by {car?.user?.name}
                        </h3>
                      </div>
                    </div>
                    <hr />

                    <hr />
                    {/* description paragraphs */}
                    <p className="section__content-paragraph">
                      {car?.description}
                    </p>
                    <p className="section__content-paragraph">
                      This {car?.year} {car?.brand} {car?.model} is perfect for your transportation needs in {car?.location_address}. 
                      With {car?.seats} comfortable seats and {car?.doors} doors, it offers convenience and reliability for your journey.
                    </p>
                    <button className="show-more">
                      Show More
                      <div className="img__container">
                        <img src="/images/icons/small-arrow.svg" alt="arrow" />
                      </div>
                    </button>
                    
                    <hr />
                    {/* Car specifications card */}
                    <div className="card">
                      <div className="card-images">
                        <div className="img__container">
                          <img src="/images/icons/car.svg" alt="car" />
                        </div>
                      </div>
                      <h5 className="text-sm">Vehicle Specifications</h5>
                      <p>{car?.seats} seats • {car?.doors} doors • {car?.fuel_type} • {car?.transmission}</p>
                    </div>
                    <hr />

                    {/* Detailed Specifications */}
                    <h4 className="mt-4">Specifications</h4>
                    <div className="my-4">
                      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <tbody>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Body</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.category?.name}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Seat</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.seats} seats</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Door</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.doors} doors</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Luggage</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.luggage_capacity}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Fuel Type</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.fuel_type}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Engine</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.engine_capacity}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Year</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.year}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Mileage</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.mileage}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Transmission</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.transmission}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Drive</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.drive_type}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Fuel Economy</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.fuel_economy}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Exterior Color</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.exterior_color}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Interior Color</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.interior_color}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <hr />
                    {/* features list */}
                    <h3 className="heading--amenities">Features</h3>
                    <div className="list">
                      <ul className="amenities-list flex flex-wrap gap-4 items-center">
                        {car?.car_features?.map((data, index) => (
                          <li key={index} className="flex justify-start items-center gap-4">
                            <i className={`${data?.feature?.icon} w-5 text-black`}></i>
                            <span className="flex items-center min-w-[200px]">{data?.feature?.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                 
                  <CarRideForm car={car} />
                </div>
              </section>
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}