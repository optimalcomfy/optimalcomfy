import React from 'react'
import { useForm, Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'

function Footer() {
    
  return (
    <>
    <div className="relative  bg-[#f1f1f1] pt-[90px]">
      <div className="shape">
        <img
          className="absolute hidden md:block left-0 top-0"
          src="assets/images/footer/shape-1.svg"
          alt=""
        />
        <img
          className="absolute bottom-[20%] left-[15%] hidden lg:block    "
          src="assets/images/footer/shape-2.svg"
          alt=""
        />
        <img
          className="absolute hidden md:block right-[5%] top-[35%]"
          src="assets/images/footer/shape-3.svg"
          alt=""
        />
      </div>
      <div className="container">
        <div className="grid sm:grid-cols-2 gap-[30px] lg:flex justify-between mb-[60px] relative z-[1] ">
          <div className="rts__widget">
            <a href="index.html">
              <img
                className="footer__logo max-w-[160px]"
                src="/image/logo/logo.png"
                alt="footer logo"
              />
            </a>
            <p className="max-w-[290px] mt-[20px]">
              Each property features plush bedding, high-quality linens, and a selection
              of ensure a restful night's sleep.
            </p>
          </div>
          <div className="rts__widget">
            <span className="block text-[20px] heading text-heading capitalize mb-[20px]">
              quick links
            </span>
            <ul className="flex flex-col gap-[10px]">
              <li>
                <a className="hover:text-primary" href="#">
                  Home
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Property
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Cars
                </a>
              </li>
            </ul>
          </div>
          <div className="rts__widget">
            <span className="block text-[20px] heading text-heading capitalize mb-[20px]">
              Contact Us
            </span>
            <ul className="flex flex-col gap-[10px]">
              <li>
                <a
                  className="flex gap-2 items-center"
                  aria-label="footer__contact"
                  href="tel:+12505550199"
                >
                  <i className="flaticon-phone-flip" /> +12505550199
                </a>
              </li>
              <li>
                <a
                  className="flex gap-2 items-center"
                  aria-label="footer__contact"
                  href="mailto:UjJw6@example.com"
                >
                  <i className="flaticon-envelope" />
                  Ristay@gmail.com
                </a>
              </li>
              <li>
                <a
                  className="flex gap-2 items-center"
                  aria-label="footer__contact"
                  href="#"
                >
                  <i className="flaticon-marker" />
                  Nairobi, Kenya
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t-[1px] border-[#e5e5e5] p-[40px_0] relative z-10">
        <div className="container">
          <div className="flex flex-wrap md:justify-between justify-center items-center gap-[30px]">
            <p className="mb-0">Copyright © 2024 Ristay. All rights reserved.</p>
            <div className="flex items-center gap-[30px]">
              <a
                className="pr-[25px] border-r-[1px] border-[#65676b] leading-4"
                href="#"
              >
                Facebook
              </a>
              <a
                className="pr-[25px] border-r-[1px] border-[#65676b] leading-4"
                href="#"
              >
                Linkedin
              </a>
              <a className="leading-4" href="#">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>

  )
}

export default Footer
