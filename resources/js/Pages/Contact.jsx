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

  // 
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
          <>
  <div
    className="relative bg-[url('../image/contact.webp')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
  >
    <div className="container text-center text-white relative">
      <h1 className="heading text-white mb-[20px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
        Contact Us
      </h1>
      <p className="text-sm">
        Whether you have questions, need assistance, or simply want to share.
      </p>
    </div>
  </div>
  {/* breadcrumb area end */}
  {/* contact form */}
  <div className="relative p-[80px_0] lg:[120px_0]">
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-[50px] gap-[30px] items-center">
        <div className="contact-form">
          <h4 className="heading text-heading mb-[15px] max-w-[395px] text-center mx-auto">
            Love to hear from you Get in touch!
          </h4>
          <form action="#" className="grid grid-cols-1 gap-[15px]">
            <div>
              <label htmlFor="name" className="text-heading block mb-[10px]">
                {" "}
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  className="border-[1px] border-[#65676B] border-opacity-30 w-full rounded-[4px] outline-none p-[13px_20px_13px_45px]"
                />
                <i className="flaticon-user absolute top-[30%] left-[15px]" />
              </div>
            </div>
            <div>
              <label htmlFor="name" className="text-heading block mb-[10px]">
                Your Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="name"
                  placeholder="Your Name"
                  className="border-[1px] border-[#65676B] border-opacity-30 w-full rounded-[4px] outline-none p-[13px_20px_13px_45px]"
                />
                <i className="flaticon-envelope absolute top-[32%] left-[15px]" />
              </div>
            </div>
            <div>
              <label htmlFor="msg" className="text-heading block mb-[10px]">
                Your Message
              </label>
              <div className="relative">
                <textarea
                  name="msg"
                  id="msg"
                  className="border-[1px] border-[#65676B] border-opacity-30 w-full rounded-[4px] outline-none p-[14px_20px_14px_45px] resize-none h-[100px]"
                  placeholder="Enter Your Message"
                  defaultValue={""}
                />
                <img
                  src="assets/images/icon/message.svg"
                  className="absolute top-[20%] left-[15px]"
                  width={20}
                  height={20}
                  alt=""
                />
              </div>
            </div>
            <button
              type="submit"
              className="theme-btn btn-style sm-btn rounded-[6px] !text-sm !p-[12px_35px] fill w-full"
            >
              Send Message
            </button>
          </form>
        </div>
        <div className="contact-img">
          <img
            className="rounded-[10px] w-full"
            src="assets/images/pages/contact.webp"
            width={645}
            height={560}
            alt="contact__image"
          />
        </div>
      </div>
    </div>
  </div>
  {/* contact form end */}
  {/* contact section */}
  <div className="relative pb-[80px] lg:pb-[120px]">
    <div className="container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[30px] items-center">
        <div className="map max-w-[600px] rounded-[6px] overflow-hidden h-[350px] lg:h-[500px]">
          <iframe
            width="100%"
            height="100%"
            frameBorder={0}
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=1%20Grafton%20Street,%20Dublin,%20Ireland+(My%20Business%20Name)&t=&z=14&ie=UTF8&iwloc=B&output=embed"
          />
        </div>
        <div className="contact flex flex-col gap-[30px] lg:gap-[40px]">
          <div>
            <h4 className="heading text-heading mb-[15px]">
              Hotel Info Center
            </h4>
            <p className="font-glida text-[20px] leading-relaxed">
              Open Hours: Monday – Sunday <br />
              Telephone:&nbsp;+12505550199 <br />
              Fax: +12505550199 <br />
              Email:&nbsp;info@Optimalcomfy.com
            </p>
          </div>
          <div>
            <h4 className="heading text-heading mb-[15px]">Hotel location</h4>
            <p className="font-glida text-[20px] leading-relaxed">
              Address: Nairobi, Kenya <br />
              Telephone:&nbsp;+12505550199 <br />
              Fax: +12505550199 <br />
              Email:&nbsp;info@Optimalcomfy.com
            </p>
          </div>
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
