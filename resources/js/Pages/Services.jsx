import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import Testimonial from "@/Components/Testimonial";
import "../../css/main";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { flash, pagination, amenities, services } = usePage().props;

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Services" />
          <HomeLayout>
            <>
              <div
                className="relative bg-[url('/image/gallery/19.jpg')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
              >
                <div className="container text-center text-white relative">
                  <h1 className="heading text-white mb-[25px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
                    Our Service
                  </h1>
                  <p className="text-sm">
                    At Ristay we pride ourselves on delivering an exceptional
                    experience.
                  </p>
                </div>
              </div>
              {/* breadcrumb area end */}
              {/* service section */}
              <div className="relative p-[80px_0] lg:p-[100px_0]">
                <div className="container">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px] justify-center items-center">
                    {amenities && amenities.map((data,index)=>{
                      return(
                        <div className="text-center max-w-[350px] mx-auto" key={index}>
                          <img
                            className="mb-[25px] mx-auto"
                            src={`/storage/${data?.icon}`}
                            alt=""
                            width={40}
                            height={40}
                          />
                          <a
                            href="#"
                            className="h6 heading text-heading mb-[15px] block"
                          >
                            {data.name}
                          </a>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* service section end */}
              {/* our service */}
              <div className="relative bg-gray p-[80px_0]">
                <div className="container">
                  <div className="text-center mb-[40px]">
                    <span className="subtitle font-glida heading-6 heading text-primary before:bg-[url('images/shape/section__style__three-1.html')] after:bg-[url('images/shape/section__style__two.html')]">
                      Our Service
                    </span>
                    <h2 className="text-heading mt-[10px]">Our Service</h2>
                  </div>
                  <div className="grid">
                    {services && services.map((data, index)=>{
                      return(
                        <div className="flex lg:gap-[40px] xl:gap-[100px] items-center flex-wrap lg:flex-nowrap gap-[30px] flex-row-reverse mt-[30px] lg:mt-[-20px]" key={index}>
                          <div className="xl:min-w-[605px] lg:min-w-[535px] lg:min-h-[535px] h-[auto] max-h-[100%]">
                            <img
                              className="w-full"
                              src={`/storage/${data?.image}`}
                              height={605}
                              width={535}
                              alt=""
                            />
                          </div>
                          <div>
                            <span
                              className="heading heading-6 relative mb-[10px] left-[45px] text-primary inline-block
                      before:absolute before:left-[-45px] before:bottom-[50%] before:w-[50px] before:h-[12px] before:bg-no-repeat before:bg-[url('images/shape/section__three-1.html')] before:transform before:translate-y-2/4"
                            >
                              {data.name}
                            </span>
                            <h2 className="text-heading heading mb-[10px]">
                              {data.name}
                            </h2>
                            <p className="text-[18px]">
                              {data.description}
                            </p>
                            <Link
                              href={route('property-detail', { id: data.id })}
                              className="text-primary underline text-[18px] font-medium mt-[20px] block"
                            >
                              Read More
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              {/* our service end */}
              {/* testimonial section */}
              <Testimonial />
            </>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
