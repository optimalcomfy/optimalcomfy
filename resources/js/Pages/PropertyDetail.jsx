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
            <div className="py-8 mx-auto">
              {/* Main Section */}
              <section className="main">
                <div className="container f-reverse">
                  <h2 className="hero__heading">
                    {property?.property_name} - {property?.type}
                  </h2>
                  {/* meta datas */}
                  <div className="meta-data__container">
                    <div className="meta-data">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property?.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location min-w-[240px]"
                      >
                        {property?.location}
                      </a>
                    </div>
                  </div>
                  {/* images */}

                  {property?.initial_gallery?.length > 1 ?
                  <>
                  {property?.initial_gallery[0]?.image &&
                  <div className="hero-images">
                    <a href="#" className="image__link">
                      <div className="img__container">
                        <img src="/images/icons/menu1.png" alt="9 dots" />
                      </div>
                      <span className="image__link-text">Show all photos</span>
                    </a>
                    <div className="img__container--hero">
                      <img src={`/storage/${property?.initial_gallery[0]?.image}`} alt="room" />
                    </div>
                    {property?.initial_gallery[1]?.image &&
                    <div className="img__collage">
                      <div className="img__container">
                        <img src={`/storage/${property?.initial_gallery[1]?.image}`} alt="room" />
                      </div>
                      
                      <div className="img__container">
                        {property?.initial_gallery[2]?.image &&
                        <img src={`/storage/${property?.initial_gallery[2]?.image}`}alt="room" />}
                      </div>
                     
                      <div className="img__container">
                         {property?.initial_gallery[3]?.image &&
                        <img src={`/storage/${property?.initial_gallery[3]?.image}`} alt="room" />}
                      </div>
                      
                      <div className="img__container">
                        {property?.initial_gallery[4]?.image &&
                        <img src={`/storage/${property?.initial_gallery[4]?.image}`} alt="room" />}
                      </div>
                    </div>}
                  </div>}
                  </>
                  :
                  <>
                  {property?.initial_gallery[0]?.image &&
                  <div className="rounded-lg overflow-hidden mt-4">
                    <img src={`/storage/${property?.initial_gallery[0]?.image}`} className="w-full h-[50vh] object-cover object-center" alt="room" />
                  </div>}
                  </>}
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
                  </div>

                  <PropertyBookingForm property={property} />
                </div>
              </section>
            </div>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
