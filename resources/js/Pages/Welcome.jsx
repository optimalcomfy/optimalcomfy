import { useState, useEffect } from "react";
import { Link, Head, router, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import Banner from "@/Components/Banner";
import SearchForm from "@/Components/SearchForm";
import About from "@/Components/About";
import Facility from "@/Components/Facility";
import Slider from "@/Components/Slider";
import Offer from "@/Components/Offer";
import Testimonial from "@/Components/Testimonial";
import Video from "@/Components/Video";
import Gallery from "@/Components/Gallery";
import '../../css/main'
import Product from "@/Components/Product";


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, properties } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
            <SearchForm />
            <div className="padding-container px-8 my-6 xl:mt-6 xl:mb-10 gap-x-6 gap-y-10 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 grid-flow-row-dense container mx-auto">
              {properties.map((data, index) => (
                <Product key={index} {...data} />
              ))}
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
