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
import Testimonial from "@/Components/Testimonial";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { flash, pagination, foods } = usePage().props;

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Restaurant" />
          <HomeLayout>
            <>
              <div
                className="relative bg-[url('/image/gallery/15.jpg')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
              >
                <div className="container text-center text-white relative">
                  <h1 className="heading text-white mb-[25px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
                    The Restaurant
                  </h1>
                  <p className="text-sm">
                    Whether you're in the mood for a leisurely breakfast, a
                    business lunch, or a romantic dinner{" "}
                  </p>
                </div>
              </div>
              {/* breadcrumb area end */}
              {/* hotel experience */}
              <div className="relative p-[100px_0] lg:p-[120px_0]">
                <div className="container">
                  <div className="flex items-center flex-wrap xl:flex-nowrap gap-[30px] xl:gap-[80px]">
                    <div className="image flex gap-[40px] flex-wrap lg:flex-nowrap xl:ml-[-30%] ml-[0]">
                      <img
                        className="rounded-[10px]"
                        height={648}
                        width={428}
                        src="/image/gallery/12.jpg"
                        alt=""
                      />
                      <img
                        className="rounded-[10px]"
                        width={428}
                        height={648}
                        src="/image/gallery/11.jpg"
                        alt=""
                      />
                    </div>
                    <div className="content  bg-slate-50/90 shadow-md rounded-md p-4 max-w-[700px]">
                      <span
                        className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
              before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] 
              before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
                      >
                        Hotel Experience
                      </span>
                      <h2 className="text-heading block mb-[20px]">
                        From Farm to Fork: Enjoy Fresh, Seasonal Dishes at
                        Optimalcomfy
                      </h2>
                      <p className="text-sm max-w-[645px]">
                        Welcome to Optimalcomfy, where luxury meets comfort in the
                        heart of canada. Since 1999, we have been dedicated to
                        providing an exceptional stay for our guests, blending
                        modern amenities with timeless elegance.Our beautifully
                        designed rooms and suites offer stunning views and plush
                        accommodations, ensuring a restful retreat whether
                        you're here for business or leisure.
                      </p>
                      <div className="flex gap-[20px] flex-wrap mt-[30px]">
                        <div className="item border-[1px] border-[#65676B] border-opacity-[.3] p-[20px]">
                          <span className="block text-sm mb-[4px]">
                            Reservation By Phone
                          </span>
                          <a
                            href="tel:+12505550199"
                            className="flex items-center gap-[10px] text-[18px] font-jost text-heading"
                          >
                            <img src="assets/images/icon/phone.svg" alt="" />{" "}
                            +12505550199
                          </a>
                        </div>
                        <div className="item border-[1px] border-[#65676B] border-opacity-[.3] p-[20px]">
                          <span className="block text-sm mb-[4px]">
                            Opening Hours
                          </span>
                          <span className="flex items-center gap-[10px] text-[18px] font-jost text-heading">
                            <img src="assets/images/icon/clock.svg" alt="" />
                            10 Am - 12Pm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* hotel experience end */}
              {/* gallery */}
              <div className="relative pb-[100px] lg:pb-[120px]">
                <div className="container">
                  <div className="text-center mb-[45px]">
                    <span className="subtitle font-glida heading-6 heading text-primary before:bg-[url('images/shape/section__style__three-1.html')] after:bg-[url('images/shape/section__style__two.html')]">
                      Resturant
                    </span>
                    <h2 className="text-heading mt-[15px] mb-[15px]">
                      Our Restaurant Gallery
                    </h2>
                    <p className="max-w-[645px] mx-auto">
                      Our rooms offer a harmonious blend of comfort and
                      elegance, designed to provide an exceptional stay for
                      every guest Each room features plush bedding.
                    </p>
                  </div>
                  <div>
                    <div className="gallery">
                      <div className="gallery__image flex flex-col gap-[30px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                          {foods && foods.map((data, index)=>{
                            return(
                            <div className="gallery__item" key={index}>
                              <a
                                href={`/storage/${data?.image}`}
                                className="gallery__link"
                              >
                                <img
                                  className="rounded-[6px] img-fluid"
                                  src={`/storage/${data?.image}`}
                                  alt="gallery"
                                />
                              </a>
                            </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* gallery end */}
              {/* resturant menu section */}
              <div className="relative bg-gray pt-[80px] pb-[60px]">
                <div className="container">
                  <div className="flex justify-between items-center flex-wrap gap-[30px] lg:gap-0 mb-[60px]">
                    <div>
                      <span
                        className="heading heading-6 relative mb-[10px] left-[65px] text-primary inline-block
              before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] 
              before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
                      >
                        Resturant Menu
                      </span>
                      <h2 className="text-heading capitalize">
                        Restaurant Menu
                      </h2>
                    </div>
                    <div>
                      <p className="text-sm max-w-[645px]">
                        Experience the ultimate in luxury and relaxation with
                        our exclusive special offer! Book your stay now and
                        enjoy 20% off our best available rates.
                      </p>
                    </div>
                  </div>
                  {/* menu list */}
                  <div className="mb-[50px]">
                    <ul className="flex lg:justify-between flex-wrap gap-[15px] justify-start">
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary active active:bg-primary active:text-white">
                          Small Plates
                        </button>
                      </li>
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary">
                          Cold Appetizers
                        </button>
                      </li>
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary">
                          Vegetarian &amp; Vegan
                        </button>
                      </li>
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary">
                          Burgers &amp; Sandwiches
                        </button>
                      </li>
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary">
                          Dips &amp; Spreads
                        </button>
                      </li>
                      <li>
                        <button className="border-[#65676B] border-opacity-[.5] border-[1px] rounded-[6px] p-[15px_22px] block leading-none transition-all hover:bg-primary hover:text-white hover:border-primary">
                          Seafood Specialties
                        </button>
                      </li>
                    </ul>
                  </div>
                  {/* menu list end */}
                  <div className="tab-content">
                    <div className="all__menu__list max-w-6xl mx-auto p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {foods && foods.map((data, index) => (
                          <div 
                            className="single__menu__item bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md" 
                            key={index}
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
                              {/* Food Image */}
                              <div className="menu__thumb flex-shrink-0">
                                <img
                                  className="rounded-lg object-cover"
                                  height={90}
                                  width={90}
                                  src={`/storage/${data?.image}`}
                                  alt={data?.name || "Menu item"}
                                />
                              </div>
                              
                              {/* Food Details */}
                              <div className="flex flex-col flex-grow">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mb-2">
                                  <h3 className="text-lg font-semibold text-gray-800">
                                    {data?.name}
                                  </h3>
                                  <span className="text-lg font-medium text-gray-900 mt-1 sm:mt-0">
                                    KES {data.price}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-sm">{data.description || "Spalla Cotta, Mortadella, Culacciona."}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* resturant menu section end */}
              <Testimonial />
            </>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
