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
import SearchForm from "@/Components/SearchForm";
import Video from "@/Components/Video";


export default function Properties({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, properties } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Event" />
          <HomeLayout>
          <>
            <div
                className="relative flex items-center"
            >
                <div className="container text-center text-white relative min-h-[50vh] mt-8">
                <div className="relative">
                    <SearchForm />
                </div>
                {/* advance form end */}
                </div>
            </div>
            {/* breadcrumb area end */}
            {/* property  */}
            <div className="relative pb-[100px] lg:pb-[120px]">
                <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-[30px]">
                    {/* item */}

                        {properties && properties.map((data, index)=>{
                            return(
                            <div className="overflow-hidden rounded-[10px] max-w-full border-[1px] border-solid border-[#F1F1F1]" key={index}>
                                <div className="relative ">
                                    <Link
                                    href={route('property-detail', { id: data.id })}>
                                    <h6 className="absolute top-[30px] left-[30px] rounded-[6px] text-primary text-[20px] p-[10px_15px] bg-white leading-none">
                                        KES {data.price_per_night}
                                    </h6>
                                    <img
                                      className="lg:h-[415px] h-[320px] object-cover w-full"
                                      src={
                                        data?.initial_gallery?.length > 0 && data?.initial_gallery?.[0]?.image
                                          ? `/storage/${data.initial_gallery[0].image}`
                                          : "../images/pages/header__bg.webp"
                                      }
                                      width={420}
                                      height={310}
                                      alt="property card"
                                    />
                                    </Link>
                                </div>
                                <div className="relative p-[30px] pt-[20px]">
                                     <Link
                                    href={route('property-detail', { id: data.id })} className="heading h5 text-heading">
                                    {data?.property_name} - {data.type}
                                    </Link>
                                    <div className="flex gap-[20px] items-center mt-2 mb-3 text-[18px] font-jost">
                                    <span className="flex gap-2">
                                        <i className="flaticon-user" />{data?.max_guests} Person
                                    </span>
                                    </div>
                                    <p className="mb-[15px] text-sm">
                                    Our properties offer a harmonious blend of comfort and elegance,
                                    designed to provide an exceptional stay for every guest.
                                    </p>
                                    <Link
                                    href={route('property-detail', { id: data.id })}
                                    className="text-[18px] text-primary border-b-[#ab8a62] border-solid border-b-[1px] font-jost font-medium"
                                    >
                                    Discover More
                                    </Link>
                                </div>
                            </div>
                            )
                        })}
                   </div>
                   
                </div>
            </div>
            </>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
