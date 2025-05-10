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
            <>
              <div
                className="relative h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
            before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
                style={{
                  backgroundImage: property?.initial_gallery?.[0]?.image
                    ? `url('/storage/${property.initial_gallery[0].image}')`
                    : `url('${fallbackImage}')`,
                }}
              >
                <div className="container text-center text-white relative">
                  <h1 className="heading text-white mb-[25px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
                    {property?.property_name} - {property?.type} Detail
                  </h1>
                  <p className="text-sm">
                    Whether you're in the mood for a leisurely breakfast, a
                    business lunch, or a romantic dinner{" "}
                  </p>
                </div>
              </div>

              {/* Property details */}
              <div className="relative p-[100px_0] lg:p-[120px_0]">
                <div className="container">
                  <div className="flex justify-between gap-[30px] flex-wrap lg:flex-nowrap">
                    <div className="details__content max-w-[820px]">
                      <span className="block h4 heading text-primary leading-none">
                        KES {property?.price_per_night}
                      </span>
                      <h2 className="heading text-heading mt-[15px]">
                        {property?.type}
                      </h2>

                      <div className="flex gap-[20px] items-center mt-2 mb-3 text-[24px] font-glida">
                        <span className="flex gap-2">
                          <i className="flaticon-user" />
                          {property?.max_guests}{" "}
                          {property?.max_guests > 1 ? "People" : "Person"}
                          {property?.location}
                        </span>
                      </div>

                      <p className="text-sm">
                        Our elegantly appointed properties and suites are designed to
                        offer the utmost in comfort and style...
                      </p>

                      {/* Property Images */}
                      <div className="flex max-w-max gap-[30px] mt-[50px] mb-[50px] flex-wrap md:flex-nowrap">
                        {property?.initial_gallery?.map((data, index) => (
                          <div key={index}>
                            <img
                              className="rounded-[6px] max-h-[40vh]"
                              src={data?.image ? `/storage/${data.image}` : fallbackImage}
                              alt=""
                            />
                          </div>
                        ))}
                      </div>

                      {/* Amenities */}
                      <span className="h4 block mb-[25px] text-heading">
                        Property Amenities
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] mb-[20px] pb-[20px] border-b-[0.5px] border-[rgba(101,103,107,0.3)] text-[20px]">
                        {property?.property_amenities?.map((data, index) => (
                          <div
                            className="flex gap-[30px] items-center text-heading font-glida"
                            key={index}
                          >
                            <i className={`${data?.amenity?.icon} w-5 text-black`}></i>
                            <span>{data?.amenity?.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="sidebar__content lg:max-w-[420px] lg:min-w-[420px] w-full">
                      <div className="sidebar">
                        <div className="bg-gray dark:bg-[#1B1B1B] dark:text-white p-[30px] rounded-[10px] relative z-10 dark:shadow-none">
                          <h5 className="heading text-heading text-center mb-[30px] mt-[5px]">
                            Book Your Stay
                          </h5>
                          <PropertyBookingForm property={property} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Properties */}
              {similarProperties?.length > 0 && (
                <div className="relative pb-[100px] lg:pb-[120px]">
                  <div className="container">
                    <div className="text-center mb-[40px]">
                      <span className="subtitle font-glida heading-6 heading text-primary">
                        Similar Properties
                      </span>
                      <h2 className="text-heading mt-[10px]">Similar Properties</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                      {similarProperties.map((data, index) => (
                        <div
                          className="overflow-hidden rounded-[10px] max-w-full border-[1px] border-solid border-[#F1F1F1] xl:max-w-[420px]"
                          key={index}
                        >
                          <div className="relative">
                            <a href="#">
                              <img
                                className="h-[300px] w-full"
                                src={data?.initial_gallery?.[0]?.image ? `/storage/${data.initial_gallery[0].image}` : fallbackImage}
                                width={420}
                                height={310}
                                alt="property card"
                              />
                            </a>
                          </div>

                          <div className="relative p-[30px] pt-[20px]">
                            <a href="#" className="heading h5 text-heading">
                              {data?.type}
                            </a>
                            <div className="flex gap-[20px] items-center mt-2 mb-3 text-[18px] font-jost">
                              <span className="flex gap-2">
                                <i className="flaticon-user" />
                                {data?.max_guests} {data?.max_guests > 1 ? "People" : "Person"}
                              </span>
                            </div>
                            <span className="block h6 text-primary mb-[10px]">
                              KES {data?.price_per_night}
                            </span>
                            <Link
                              href={route('property-detail', { id: data?.id })}
                              className="text-[18px] text-primary border-b-[#ab8a62] border-solid border-b-[1px] font-jost"
                            >
                              Discover More
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
