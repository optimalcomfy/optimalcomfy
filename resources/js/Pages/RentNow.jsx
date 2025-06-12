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
                          <a href="#" className="image__link">
                            <div className="img__container">
                              <img src="/images/icons/menu1.png" alt="9 dots" />
                            </div>
                            <span className="image__link-text">Show all photos</span>
                          </a>
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
                      <div className="section__img">
                        <img
                          src='https://a0.muscache.com/im/pictures/user/bfe2dd3c-e72f-4e46-ba38-5c0bac2cc2e2.jpg?im_w=240'
                          alt="car owner"
                        />
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
                    <h4>Specifications</h4>
                    <div className="de-spec mb-4">
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

                    <hr />
                    
                    {/* Booking Calendar - simplified for car rental */}
                    <div className="calendar">
                      <h3 className="calendar-heading">Select your rental dates</h3>
                      <span className="selected-date">Pick your dates</span>
                      <div className="months-content-wrapper">
                        <div className="months-heading-container">
                          <div className="img__container img__container--rotate">
                            <img src="/images/icons/small-arrow.svg" alt="icon" />
                          </div>
                          <h4>June 2025</h4>
                          <h4 className="sep">July 2025</h4>
                          <div className="img__container">
                            <img src="/images/icons/small-arrow.svg" alt="icon" />
                          </div>
                        </div>
                        <div className="months-wrapper">
                          <table className="month">
                            <tbody>
                              <tr className="days">
                                <td>Su</td>
                                <td>Mo</td>
                                <td>Tu</td>
                                <td>We</td>
                                <td>Th</td>
                                <td>Fr</td>
                                <td>Sa</td>
                              </tr>
                              <tr>
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                                <td>6</td>
                                <td>7</td>
                              </tr>
                              <tr>
                                <td>8</td>
                                <td>9</td>
                                <td>10</td>
                                <td>11</td>
                                <td className="active">12</td>
                                <td className="active">13</td>
                                <td>14</td>
                              </tr>
                              <tr>
                                <td>15</td>
                                <td>16</td>
                                <td>17</td>
                                <td>18</td>
                                <td>19</td>
                                <td>20</td>
                                <td>21</td>
                              </tr>
                              <tr>
                                <td>22</td>
                                <td>23</td>
                                <td>24</td>
                                <td>25</td>
                                <td>26</td>
                                <td>27</td>
                                <td>28</td>
                              </tr>
                              <tr>
                                <td>29</td>
                                <td>30</td>
                                <td />
                                <td />
                                <td />
                                <td />
                                <td />
                              </tr>
                            </tbody>
                          </table>
                          <table className="month sep">
                            <tbody>
                              <tr className="days">
                                <td>Su</td>
                                <td>Mo</td>
                                <td>Tu</td>
                                <td>We</td>
                                <td>Th</td>
                                <td>Fr</td>
                                <td>Sa</td>
                              </tr>
                              <tr>
                                <td />
                                <td />
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                              </tr>
                              <tr>
                                <td>6</td>
                                <td>7</td>
                                <td>8</td>
                                <td>9</td>
                                <td>10</td>
                                <td>11</td>
                                <td>12</td>
                              </tr>
                              <tr>
                                <td>13</td>
                                <td>14</td>
                                <td>15</td>
                                <td>16</td>
                                <td>17</td>
                                <td>18</td>
                                <td>19</td>
                              </tr>
                              <tr>
                                <td>20</td>
                                <td>21</td>
                                <td>22</td>
                                <td>23</td>
                                <td>24</td>
                                <td>25</td>
                                <td>26</td>
                              </tr>
                              <tr>
                                <td>27</td>
                                <td>28</td>
                                <td>29</td>
                                <td>30</td>
                                <td>31</td>
                                <td />
                                <td />
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="calendar-extra">
                      <div className="img__container">
                        <img src="/images/icons/keyboard.svg" alt="keyboard" />
                      </div>
                      <a href="#" className="link">
                        Clear Dates
                      </a>
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