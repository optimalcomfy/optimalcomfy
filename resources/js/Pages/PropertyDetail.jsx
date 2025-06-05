import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import "../../css/main";
import PropertyBookingForm from "@/Components/PropertyBookingForm";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { property, similarProperties, flash, pagination } = usePage().props;

  // Default fallback image
  const fallbackImage = "../images/pages/header__bg.webp";

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
            <div className="py-8 container mx-auto">
              {/* Main Section */}
              <section className="main">
                <div className="container f-reverse">
                  <h2 className="hero__heading">
                    {property?.property_name} - {property?.type}
                  </h2>
                  {/* meta datas */}
                  <div className="meta-data__container">
                    <div className="meta-data">
                      <span className="rating">
                        <div className="rating-img__container">
                          <img src="/images/icons/rating.svg" alt="rating-star" />
                        </div>
                        <span>4.88</span>
                        <span className="dot">.</span>
                        <a href="#" className="reviews">
                          249 reviews
                        </a>
                      </span>
                      <span className="dot">.</span>
                      <a href="#" className="location">
                        {property?.location}
                      </a>
                    </div>
                    <div className="buttons">
                      <div className="share">
                        <div className="img__container">
                          <img src="/images/icons/share.png" alt="share" />
                        </div>
                        <a href="#">Share</a>
                      </div>
                      <div className="save">
                        <div className="img__container">
                          <img src="images/icons/heart.svg" alt="heart" />
                        </div>
                        <a href="#">Save</a>
                      </div>
                    </div>
                  </div>
                  {/* images */}
                  <div className="hero-images">
                    <a href="#" className="image__link">
                      <div className="img__container">
                        <img src="/images/icons/menu1.png" alt="9 dots" />
                      </div>
                      <span className="image__link-text">Show all photos</span>
                    </a>
                    <div className="img__container--hero">
                      <img src="/images/room1.webp" alt="room" />
                    </div>
                    <div className="img__collage">
                      <div className="img__container">
                        <img src="/images/room2.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room3.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room4.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/romm5.webp" alt="room" />
                      </div>
                    </div>
                  </div>
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
                          Hosted by {property?.user?.name}
                        </h3>
                      </div>
                      <div className="section__img">
                        <img
                          src="https://a0.muscache.com/im/pictures/user/bfe2dd3c-e72f-4e46-ba38-5c0bac2cc2e2.jpg?im_w=240"
                          alt="woman sitting"
                        />
                      </div>
                    </div>
                    <hr />
                    {/* details */}
                    {property.property_amenities.some(amenity => amenity.amenity_id === 8) && (
                      <div className="small-detail">
                        <div className="img__container">
                          <img src="/images/icons/parking.svg" alt="parking" />
                        </div>
                        <div className="small-detail__detail">
                          <h4 className="small-detail__heading">Park for free</h4>
                          <p className="small-detail__paragraph">
                            This is one of the few places in the area with free parking.
                          </p>
                        </div>
                      </div>
                    )}

                    <hr />
                    {/* paragraphs */}
                    <p className="section__content-paragraph">
                      Stay at safe and clean place during your stay in {property.property_name}!
                    </p>
                    <p className="section__content-paragraph">
                      Lazimpat is popular residential area for both foreign and wealthy
                      local people because of its very clean, convenient and safe
                      environment. The city center, Durbar Marg and Thamel, is all located
                      in walking distance. Convenient location, safe area, super clean house
                      with beautiful garden and good foods, any reason to hesitate?;)
                    </p>
                    <button className="show-more">
                      Show More
                      <div className="img__container">
                        <img src="/images/icons/small-arrow.svg" alt="arrow" />
                      </div>
                    </button>
                    <div className="image-group-m">
                      <div className="img__container">
                        <img src="/images/room1-1.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room1-3.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room1-2.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room1-4.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/room4.webp" alt="room" />
                      </div>
                      <div className="img__container">
                        <img src="/images/romm5.webp" alt="room" />
                      </div>
                    </div>
                    <hr />
                    <div className="card">
                      <div className="card-images">
                        <div className="img__container">
                          <img src="/images/icons/bed.svg" alt="bed" />
                        </div>
                        <div className="img__container">
                          <img src="/images/icons/bed.svg" alt="bed" />
                        </div>
                      </div>
                      <h5>Bedroom</h5>
                      <p>2 single beds</p>
                    </div>
                    <hr />
                    {/* amenities list */}
                    <h3 className="heading--amenities">Amenities</h3>
                    <div className="list">
                      <ul className="amenities-list flex flex-wrap gap-4 items-center">
                        {property?.property_amenities?.map((data, index) => (
                          <li key={index} className="flex justify-start items-center gap-4">
                            <i className={`${data?.amenity?.icon} w-5 text-black`}></i>
                            <span className="flex items-center min-w-[200px]">{data?.amenity?.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <hr />
                    <div className="calendar">
                      <h3 className="calendar-heading">1 night in {property.property_name}</h3>
                      <span className="selected-date">Aug 4, 2023 - Aug 5, 2023</span>
                      <div className="months-content-wrapper">
                        <div className="months-heading-container">
                          <div className="img__container img__container--rotate">
                            <img src="/images/icons/small-arrow.svg" alt="icon" />
                          </div>
                          <h4>August 2023</h4>
                          <h4 className="sep">September 2023</h4>
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
                                <td />
                                <td />
                                <td>1</td>
                                <td>2</td>
                                <td>3</td>
                                <td className="active">4</td>
                                <td className="active">5</td>
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
                                <td />
                                <td />
                                <td />
                                <td>1</td>
                                <td>2</td>
                              </tr>
                              <tr>
                                <td>3</td>
                                <td>4</td>
                                <td>5</td>
                                <td>6</td>
                                <td>7</td>
                                <td>8</td>
                                <td>9</td>
                              </tr>
                              <tr>
                                <td>10</td>
                                <td>11</td>
                                <td>12</td>
                                <td>13</td>
                                <td>14</td>
                                <td>15</td>
                                <td>16</td>
                              </tr>
                              <tr>
                                <td>17</td>
                                <td>18</td>
                                <td>19</td>
                                <td>20</td>
                                <td>21</td>
                                <td>22</td>
                                <td>23</td>
                              </tr>
                              <tr>
                                <td>24</td>
                                <td>25</td>
                                <td>26</td>
                                <td>27</td>
                                <td>28</td>
                                <td>29</td>
                                <td>30</td>
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

                  <PropertyBookingForm property={property} />
                </div>
                <div className="container">
                  <hr />
                </div>
              </section>
              <section>
                <div className="container container-m">
                  <span className="rating rating--large">
                    <div className="rating-img__container">
                      <img src="/images/icons/rating.svg" alt="rating-star" />
                    </div>
                    <span>4.88 (249 reviews)</span>
                  </span>
                  <div className="detailed-rating">
                    <ul className="rating-list">
                      <li className="rating-list__item">
                        <p className="item-title">Cleanliness</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.9</span>
                      </li>
                      <li className="rating-list__item">
                        <p className="item-title">Communication</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.9</span>
                      </li>
                      <li className="rating-list__item">
                        <p className="item-title">Check-in</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.9</span>
                      </li>
                      <li className="rating-list__item">
                        <p className="item-title">Accuracy</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.9</span>
                      </li>
                      <li className="rating-list__item">
                        <p className="item-title">Location</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.8</span>
                      </li>
                      <li className="rating-list__item">
                        <p className="item-title">Value</p>
                        <span className="rating-bar" />
                        <span className="rating-list__rating">4.8</span>
                      </li>
                    </ul>
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
