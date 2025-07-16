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
import './Property.css'
import { PopupGallery } from "@/Components/PopupGallery";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { property, similarProperties, flash, pagination } = usePage().props;

  // Default fallback image
  const [galleryVisible, setGalleryVisible] = useState(false);

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
            <div className="py-8 max-w-6xl mx-auto">
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

                  {property?.initial_gallery?.length > 1 ? (
                    // Multiple images layout
                    property?.initial_gallery[0]?.image && (
                      <div className="hero-images">
                        <div className="img__container--hero">
                          <img 
                            src={`/storage/${property?.initial_gallery[0]?.image}`} 
                            alt="room" 
                          />
                          <button type="button" onClick={() => setGalleryVisible(true)} className="view-all-images">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span>View all {property.initial_gallery.length} images</span>
                          </button>
                        </div>
                        {property?.initial_gallery[1]?.image && (
                          <div className={`img__collage img__collage--${Math.min(property.initial_gallery.length - 1, 4)}`}>
                            {property?.initial_gallery.slice(1, 5).map((item, index) => (
                              item?.image && (
                                <div key={index} className="img__container">
                                  <img 
                                    src={`/storage/${item.image}`} 
                                    alt="room" 
                                  />
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    // Single image layout
                    property?.initial_gallery?.[0]?.image ? (
                      <div className="single-image-container">
                        <img 
                          src={`/storage/${property?.initial_gallery[0]?.image}`} 
                          className="single-image" 
                          alt="room" 
                        />
                        <button type="button" onClick={() => setGalleryVisible(true)} className="view-all-images">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span>View image</span>
                        </button>
                      </div>
                    )
                    :
                    <div className="single-image-container">
                        <img 
                          src='/images/no-pic.avif'
                          className="w-full h-[50vh] object-contain object-cente" 
                          alt="room" 
                        />
                      </div>
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
                          <p>
                            <img src="/images/icons/parking.svg" style={{height: 'auto !important'}} alt="parking" />
                          </p>
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
                      {property?.user?.bio}
                    </p>
                      {property?.initial_gallery[0]?.image &&
                        <div className="image-group-m">
                          {/* First image container with view all button */}
                          <div className="img__container main-image">
                            <img src={`/storage/${property?.initial_gallery[0]?.image}`} alt="room" />
                            {property?.initial_gallery?.length > 1 && (
                              <button type="button" onClick={() => setGalleryVisible(true)} className="view-all-images">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                  <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span>View all {property.initial_gallery.length} images</span>
                              </button>
                            )}
                          </div>
                          
                          {/* Other images */}
                          {property?.initial_gallery[1]?.image &&
                            <div className="img__container">
                              <img src={`/storage/${property?.initial_gallery[1]?.image}`} alt="room" />
                            </div>
                          }
                          {property?.initial_gallery[2]?.image &&
                            <div className="img__container">
                              <img src={`/storage/${property?.initial_gallery[2]?.image}`} alt="room" />
                            </div>
                          }
                          {property?.initial_gallery[3]?.image &&
                            <div className="img__container">
                              <img src={`/storage/${property?.initial_gallery[3]?.image}`} alt="room" />
                            </div>
                          }
                          {property?.initial_gallery[4]?.image &&
                            <div className="img__container">
                              <img src={`/storage/${property?.initial_gallery[4]?.image}`} alt="room" />
                            </div>
                          }
                          {property?.initial_gallery[5]?.image &&
                            <div className="img__container">
                              <img src={`/storage/${property?.initial_gallery[5]?.image}`} alt="room" />
                            </div>
                          }
                        </div>
                      }
                    <hr />
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

               <PopupGallery 
                images={property?.initial_gallery || []} 
                visible={galleryVisible} 
                onHide={() => setGalleryVisible(false)} 
              />
            </div>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
