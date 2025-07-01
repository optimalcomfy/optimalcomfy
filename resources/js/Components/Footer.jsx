import React from 'react'
import { useForm, Link } from '@inertiajs/react';
import '../../css/style.css'
import '../../css/plugins.min.css'

function Footer() {
    
  return (
    <>
    <div className="relative  bg-[#0E3C46] text-white pt-[90px]">
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
        <div className="flex flex-col lg:flex-row gap-[30px] justify-between mb-[60px] relative z-[1] ">
          <div className="rts__widget">
            <Link href={route('home')}>
              <img
                className="footer__logo max-w-[160px]"
                src="/image/logo/logo2.png"
                alt="footer logo"
              />
            </Link>
          </div>
          <div className="rts__widget">
            <span className="block text-[20px] heading text-[#F26722] capitalize mb-[20px]">
              quick links
            </span>
            <div className='flex flex-col lg:flex-row w-full'>
              <ul className="flex flex-1 flex-col gap-[10px]">
                <li className="">
                  <Link className="hover:text-primary" href={route('home')}>
                    Home
                  </Link>
                </li>
                <li className="">
                  <Link className="hover:text-primary" href={route('home')}>
                    Stays
                  </Link>
                </li>
                <li className="">
                  <Link className="hover:text-primary" href={route('all-cars')}>
                    Rides
                  </Link>
                </li>
              </ul>

              <ul className="flex flex-1 flex-col gap-[10px]">
                <li className="">
                  <Link className="hover:text-primary" href={route('host-calendar-policy')}>
                    Ristay Host Calendar & Booking Policy
                  </Link>
                </li>
                <li className="">
                  <Link className="hover:text-primary" href={route('privacy-policy')}>
                    Ristay privacy policy
                  </Link>
                </li>
                <li className="">
                  <Link className="hover:text-primary" href={route('terms-and-conditions')}>
                    Ristay terms and conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="rts__widget">
            <span className="block text-[20px] heading text-[#F26722] capitalize mb-[20px]">
              Contact Us
            </span>
            <ul className="flex flex-col gap-[10px]">
              <li>
                <a
                  className="flex gap-2 items-center"
                  aria-label="footer__contact"
                  href="tel:+254769880088"
                >
                  <i className="flaticon-phone-flip" /> +254 769 88 00 88
                </a>
              </li>
              <li>
                <a
                  className="flex gap-2 items-center"
                  aria-label="footer__contact"
                  href="mailto:support@ristay.co.ke"
                >
                  <i className="flaticon-envelope" />
                  support@ristay.co.ke
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
      <div className="border-t-[1px] border-b-[1px] border-[#ffffff20] p-[40px_0] relative z-10">
        <div className="container">
          <div className="flex flex-col-reverse md:flex-row flex-wrap md:justify-between md:items-center gap-[30px]">
            <p className="mb-0">Copyright © 2025 Ristay. All rights reserved.</p>
            <div className="flex flex-col md:flex-row md:items-center gap-[30px]">
              <a target='_blank'
                className="pr-[25px] md:border-r-[1px] md:border-[#65676b] leading-4"
                href="https://facebook.com/ristay.ke"
              >
                Facebook
              </a>
              <a target='_blank'
                className="pr-[25px] md:border-r-[1px] md:border-[#65676b] leading-4"
                href="https://instagram.com/ristay.ke"
              >
                Instagram
              </a>
              <a target='_blank'
                className="pr-[25px] md:border-r-[1px] md:border-[#65676b] leading-4"
                href="https://www.linkedin.com/company/ristay"
              >
                Linkedin
              </a>
              <a className="leading-4" target='_blank' href="https://twitter.com/RistayApp">
                Twitter
              </a>
              <a className="leading-4" target='_blank' href="https://tiktok.com/@ristay.ke">
                Tiktok
              </a>
            </div>
          </div>
        </div>
      </div>
       <div className="pb-4">
        <div className="container">
            <div className="text-center text-xs md:text-sm text-[#a8d8e0] pt-4 mx-auto max-w-3xl">
              <p className="mb-1">Ristay Connect Limited | Company No. PVT-GYU536G5 | Registered in Kenya</p>
              <p className="mb-1">62157-00200, City Square</p>
            </div>
        </div>
      </div>
    </div>
    </>

  )
}

export default Footer
