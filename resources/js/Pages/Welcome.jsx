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
import './Welcome.css'


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination, properties } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
            <SearchForm />
            <div class="product-grid padding-container">
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
