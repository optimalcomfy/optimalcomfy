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


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Activity" />
          <HomeLayout>
          <>
  <div
    className="relative bg-[url('../images/pages/header__bg.webp')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
  >
    <div className="container text-center text-white relative">
      <h1 className="heading text-white mb-[20px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
        Activities
      </h1>
      <p className="text-sm">
        Our diverse range of activities is designed to offer something for
        everyone.
      </p>
    </div>
  </div>
  {/* breadcrumb area end */}
  {/* our service */}
  <div className="relative p-[80px_0]">
    <div className="container">
      <div className="grid">
        <div className="flex lg:gap-[40px] xl:gap-[60px] items-center flex-wrap lg:flex-nowrap gap-[30px]">
          <div className="xl:min-w-[605px] lg:min-w-[535px] lg:min-h-[535px] h-[auto] max-h-[100%]">
            <img
              className="rounded-[10px] w-full"
              src="assets/images/pages/activities/1.webp"
              height={650}
              width={605}
              alt=""
            />
          </div>
          <div>
            <span
              className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
                  before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
            >
              Winter Activities
            </span>
            <h2 className="text-heading heading mb-[10px]">
              Winter Activities
            </h2>
            <p className="text-[18px]">
              Enjoy access to nearby slopes, perfect for both beginners and
              experienced skiers. Explore serene winter landscapes on guided
              snowshoe tours through nearby trails.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mt-[20px]">
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/sketing.svg" alt="" />
                Skiing &amp; Snowboarding
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/wild.svg" alt="" />
                Winter Wildlife Tours
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/hot-coffe.svg" alt="" />
                Hot Cocoa by the Fire
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/snow.svg" alt="" />
                Snowshoeing
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/spa.svg" alt="" />
                Spa &amp; Wellness
              </li>
            </ul>
            <a
              href="#"
              className="text-primary underline text-[18px] mt-[20px] block"
            >
              Discover More
            </a>
          </div>
        </div>
        <div
          className="flex lg:gap-[40px] xl:gap-[60px] items-center flex-wrap lg:flex-nowrap gap-[30px] 
          flex-row-reverse lg:mt-[80px] mt-[30px]"
        >
          <div className="xl:min-w-[605px] lg:min-w-[535px] lg:min-h-[535px] h-[auto] max-h-[100%]">
            <img
              className="rounded-[10px] w-full"
              src="assets/images/pages/activities/2.webp"
              height={650}
              width={605}
              alt=""
            />
          </div>
          <div>
            <span
              className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
                  before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
            >
              Summer Activities
            </span>
            <h2 className="text-heading heading mb-[10px]">
              Summer Activities
            </h2>
            <p className="text-[18px]">
              Enjoy access to nearby slopes, perfect for both beginners and
              experienced skiers. Explore serene winter landscapes on guided
              snowshoe tours through nearby trails.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mt-[20px]">
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/sketing.svg" alt="" />
                Guided Hiking Tours
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/biking.svg" alt="" />
                Mountain Biking
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/swimming.svg" alt="" />
                Outdoor Swimming Pool
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/home-theater.svg" alt="" />
                Outdoor Movie Nights
              </li>
              <li className="flex gap-[10px] items-center">
                <img src="assets/images/icon/tenis.svg" alt="" />
                Tennis &amp; Sports Courts
              </li>
            </ul>
            <a
              href="#"
              className="text-primary underline text-[18px] mt-[20px] block"
            >
              Discover More
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* our service end */}
  {/* our activities */}
  <div className="relative lg:pb-[120px] pb-[80px]">
    <div className="container">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[30px]">
        {/* single item */}
        <div className="relative">
          <div className="thumb overflow-hidden relative max-w-max before:absolute before:left-0 before:top-0 before:w-full before:h-full before:bg-no-repeat before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] before:rounded-[10px]">
            <img
              src="assets/images/pages/activities/4.webp"
              width={420}
              height={585}
              alt=""
            />
          </div>
          <div className="meta absolute bottom-[30px] left-[30px]">
            <a href="#" className="h4 block text-white mb-[15px]">
              Cultural Tours
            </a>
            <a
              href="#"
              className="border-[#fff] text-white border-[1px] rounded-[6px] leading-none p-[13px_18px] block max-w-max hover:bg-primary hover:text-white transition-all duration-500 hover:border-primary"
            >
              View More
            </a>
          </div>
        </div>
        {/* single item end */}
        {/* single item */}
        <div className="relative">
          <div className="thumb overflow-hidden relative max-w-max before:absolute before:left-0 before:top-0 before:w-full before:h-full before:bg-no-repeat before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] before:rounded-[10px]">
            <img
              src="assets/images/pages/activities/5.webp"
              width={420}
              height={585}
              alt=""
            />
          </div>
          <div className="meta absolute bottom-[30px] left-[30px]">
            <a href="#" className="h4 block text-white mb-[15px]">
              Cooking Classes
            </a>
            <a
              href="#"
              className="border-[#fff] text-white border-[1px] rounded-[6px] leading-none p-[13px_18px] block max-w-max hover:bg-primary hover:text-white transition-all duration-500 hover:border-primary"
            >
              View More
            </a>
          </div>
        </div>
        {/* single item end */}
        {/* single item */}
        <div className="relative">
          <div className="thumb overflow-hidden relative max-w-max before:absolute before:left-0 before:top-0 before:w-full before:h-full before:bg-no-repeat before:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_100%)] before:rounded-[10px]">
            <img
              src="assets/images/pages/activities/3.webp"
              width={420}
              height={585}
              alt=""
            />
          </div>
          <div className="meta absolute bottom-[30px] left-[30px]">
            <a href="#" className="h4 block text-white mb-[15px]">
              Spa &amp; Wellness
            </a>
            <a
              href="#"
              className="border-[#fff] text-white border-[1px] rounded-[6px] leading-none p-[13px_18px] block max-w-max hover:bg-primary hover:text-white transition-all duration-500 hover:border-primary"
            >
              View More
            </a>
          </div>
        </div>
        {/* single item end */}
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
