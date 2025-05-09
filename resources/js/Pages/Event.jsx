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
          <Head title="Event" />
          <HomeLayout>
          <>
  <div
    className="relative bg-[url('../images/pages/header__bg.webp')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
  >
    <div className="container text-center text-white relative">
      <h1 className="heading text-white mb-[20px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
        Events
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
              src="assets/images/pages/event/1.webp"
              width={605}
              height={535}
              alt=""
            />
          </div>
          <div>
            <h2 className="text-heading heading mb-[10px]">
              A Night of Hope: Our Charity Gala Property.
            </h2>
            <p className="text-[18px] max-w-[585px]">
              At our Fitness &amp; Yoga Services, we are dedicated to helping
              you achieve your health and wellness goals. Our comprehensive
              program offers a variety of classes designed to suit all levels,
              from beginners to advanced practitioners.
            </p>
            <div className="flex gap-[40px] mt-[20px] wow fadeInUp animated">
              <div className="block">
                <span className="h5 block heading text-primary">1000+</span>
                <p>Guest Dinner</p>
              </div>
              <div className="block">
                <span className="h5 block heading text-primary">100+</span>
                <p>Service Man</p>
              </div>
              <div className="block">
                <span className="h5 block heading text-primary">10+</span>
                <p>Special Property</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="flex lg:gap-[40px] xl:gap-[60px] items-center flex-wrap lg:flex-nowrap gap-[30px]
           flex-row-reverse mt-[30px] lg:mt-[80px]"
        >
          <div className="xl:min-w-[605px] lg:min-w-[535px] lg:min-h-[535px] h-[auto] max-h-[100%]">
            <img
              className="rounded-[10px] w-full"
              src="assets/images/pages/event/2.webp"
              width={605}
              height={535}
              alt=""
            />
          </div>
          <div>
            <h2 className="text-heading heading mb-[10px]">
              Taste of Luxury: Food &amp; Wine Festival Event
            </h2>
            <p className="text-[18px] max-w-[585px]">
              At our Fitness &amp; Yoga Services, we are dedicated to helping
              you achieve your health and wellness goals. Our comprehensive
              program offers a variety of classes designed to suit all levels,
              from beginners to advanced practitioners.
            </p>
            <div className="flex gap-[40px] mt-[20px] wow fadeInUp animated">
              <div className="block">
                <span className="h5 block heading text-primary">800+</span>
                <p>Guest Dinner</p>
              </div>
              <div className="block">
                <span className="h5 block heading text-primary">70+</span>
                <p>Service Man</p>
              </div>
              <div className="block">
                <span className="h5 block heading text-primary">16+</span>
                <p>Special Property</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* our service end */}
  {/* event newsletter */}
  <div className="relative p-[65px_0] bg-[url(../images/pages/event/cta__bg.webp)] bg-no-repeat before:absolute before:bg-heading before:bg-opacity-[.8] before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:z-10">
    <div className="container relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
        <div className="max-w-[610px]">
          <h2 className="heading text-white">
            We're Here to Help Reach Out to Us Today And Join Our Event
          </h2>
        </div>
        <div className="flex gap-[40px] flex-wrap">
          <div className="item border-[1px] text-white border-[#fff] border-opacity-50 rounded-[10px] p-[20px] max-w-max">
            <h6 className="heading text-[24px] block mb-[15px]">
              Reservation By Phone
            </h6>
            <a href="#" className="flex gap-[10px] items-center text-sm">
              <i className="flaticon-phone-flip" />
              +8801712345678
            </a>
          </div>
          <div className="item border-[1px] text-white border-[#fff] border-opacity-50 rounded-[10px] p-[20px] max-w-max">
            <h6 className="heading text-[24px] block mb-[15px]">
              Reservation By Email
            </h6>
            <a href="#" className="flex gap-[10px] items-center text-sm">
              <img src="assets/images/icon/mail.svg" alt="" /> Optimalcomfy@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* event newsletter end */}
  {/* why choose us */}
  <div className="relative lg:p-[100px_0_100px_0] p-[80px_0_80px_0]">
    <div className="container">
      <h2 className="heading text-heading mb-[40px] text-center">
        why choose our events
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px] justify-center items-center">
        <div className="text-center max-w-[350px] mx-auto">
          <img
            className="mb-[25px] mx-auto"
            src="assets/images/icon/security.svg"
            alt=""
            width={40}
            height={40}
          />
          <a href="#" className="h6 heading text-heading mb-[15px] block">
            24-Hour Security
          </a>
          <p>
            A 24-hour security service provides and surveillance, , properties,
            or sensitive information around the clock.
          </p>
        </div>
        <div className="text-center max-w-[350px] mx-auto">
          <img
            className="mb-[25px] mx-auto"
            src="assets/images/icon/wifi.svg"
            alt=""
            width={40}
            height={40}
          />
          <a href="#" className="h6 heading text-heading mb-[15px] block">
            Free Wifi
          </a>
          <p>
            Free Wi-Fi has become an essential service in our increasingly
            connected world. It by people to access the internet
          </p>
        </div>
        <div className="text-center max-w-[350px] mx-auto">
          <img
            className="mb-[25px] mx-auto"
            src="assets/images/icon/gym.svg"
            alt=""
            width={40}
            height={40}
          />
          <a href="#" className="h6 heading text-heading mb-[15px] block">
            Fitness Center
          </a>
          <p>
            A fitness center is a vibrant and dynamic environment designed to
            promote health and Fitnee Center well-being.
          </p>
        </div>
        <div className="text-center max-w-[350px] mx-auto">
          <img
            className="mb-[25px] mx-auto"
            src="assets/images/icon/aeroplane.svg"
            alt=""
            width={40}
            height={40}
          />
          <a href="#" className="h6 heading text-heading mb-[15px] block">
            Airport transport
          </a>
          <p>
            Airport transportation plays a crucial role in travel experiences
            for passengers. It various services, including taxis, ride-sharing
          </p>
        </div>
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
