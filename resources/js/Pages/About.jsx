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
          <Head title="Welcome" />
          <HomeLayout>
          <>
  <div
    className="relative bg-[url('../images/pages/header__bg.webp')] 
    h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
    before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
  >
    <div className="container text-center text-white relative">
      <h1 className="heading text-white mb-[25px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
        About Us
      </h1>
      <p className="text-sm">
        Welcome to Ristay, where luxury meets comfort in the heart of canada.
      </p>
    </div>
  </div>
  {/* breadcrumb area end */}
  {/* about us */}
  <div className="relative is__home__one p-[80px_0] lg:p-[120px_0]">
    <div className="absolute left-0 top-[50%] transform translate-y-[-50%] hidden xl:block">
      <img src="assets/images/offer/section__bg.svg" alt="" />
    </div>
    <div className="container relative">
      <div className="flex gap-[30px] 2xl:gap-[60px] flex-wrap lg:flex-nowrap">
        <div className="image xl:min-w-[500px]  lg:min-w-[500px] max-w-[500px] w-full relative">
          <div className="left">
            <img
              className="rounded-[10px]"
              src="assets/images/index-4/about/1.webp"
              height={474}
              width={450}
              alt=""
            />
          </div>
          <div className="right relative sm:absolute bottom-0 right-0 max-w-max border-[6px] border-[#fff] rounded-[10px]">
            <img
              className="rounded-[4px]"
              src="assets/images/index-4/about/2.webp"
              height={385}
              width={365}
              alt=""
            />
          </div>
        </div>
        <div className="content lg:p-[75px_0] md:p-[0]">
          <span
            className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
              before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] 
              before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
          >
            About Us
          </span>
          <h2 className="text-heading mb-[30px]">
            Welcome To Our Ristay Hotel &amp; Resort
          </h2>
          <p className="text-sm max-w-[645px] mb-[45px]">
            Welcome to Ristay, where luxury meets comfort in the heart of
            canada. Since 1999, we have been dedicated to providing an
            exceptional stay for our guests, blending modern amenities with
            timeless elegance.Our beautifully designed properties and suites offer
            stunning views and plush accommodations, ensuring a restful retreat
            whether you're here for business or leisure.
          </p>
          <img src="assets/images/index-4/about/sign.webp" alt="" />
        </div>
      </div>
    </div>
  </div>
  {/* about us end */}
  {/* facilities */}
  <div
    className="relative p-[64px_0] before:absolute before:bg-gray before:content-[''] before:top-0 
    before:left-[0] lg:before:left-[-44%] before:w-full before:h-full before:z-[-1] "
  >
    <div className="shape" />
    <div className="container">
      <div className="flex flex-wrap lg:flex-nowrap gap-[30px] xl:gap-[40px] 2xl:gap-[80px] items-center">
        <div className="content">
          <span
            className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
              before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] 
              before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
          >
            Facilities
          </span>
          <h3 className="heading-3 text-[28px] mb-[45px] text-heading">
            Hotel Facilities
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[30px] lg:gap-[50px]">
            <div className="item">
              <img
                className="mb-[25px]"
                src="assets/images/icon/bed.svg"
                alt=""
              />
              <a href="#" className="h6 heading text-heading mb-[15px] block">
                Properties and Suites
              </a>
              <p>
                Varied types of properties, from standard to luxury suites, equipped
                with essentials like beds.
              </p>
            </div>
            <div className="item">
              <img
                className="mb-[25px]"
                src="assets/images/icon/security.svg"
                alt=""
              />
              <a href="#" className="h6 heading text-heading mb-[15px] block">
                24-Hour Security
              </a>
              <p>
                On-site security personnel and best surveillance. from standard
                to luxury suites,Secure storage for valuables.
              </p>
            </div>
            <div className="item">
              <img
                className="mb-[25px]"
                src="assets/images/icon/gym.svg"
                alt=""
              />
              <a href="#" className="h6 heading text-heading mb-[15px] block">
                Fitness Center
              </a>
              <p>
                Equipped with exercise machines and weights.Offering massages,
                facials, and other treatments.
              </p>
            </div>
            <div className="item">
              <img
                className="mb-[25px]"
                src="assets/images/icon/swimming-pool.svg"
                alt=""
              />
              <a href="#" className="h6 heading text-heading mb-[15px] block">
                Swimming Pool
              </a>
              <p>
                Indoor or outdoor pools for leisure or exercise.Offering
                massages, facials, and other treatments
              </p>
            </div>
          </div>
        </div>
        <img
          className="lg:w-[50%] w-full max-h-[767px]"
          src="assets/images/index-3/facility.webp"
          height={767}
          width={600}
          alt=""
        />
      </div>
    </div>
  </div>
  {/* facilities end */}
  {/* team section */}
  <div className="relative pt-[100px] lg:pt-[120px]">
    <div className="container">
      <div className="text-center mb-[40px]">
        <span className="subtitle font-glida heading-6 heading text-primary before:bg-[url('images/shape/section__style__three-1.html')] after:bg-[url('images/shape/section__style__two.html')]">
          Our Team
        </span>
        <h2 className="text-heading mt-[10px]">Meet The Team</h2>
      </div>
      <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
        <div className="team max-w-max">
          <div className="thumb mb-[28px] overflow-hidden rounded-[10px]">
            <a href="#">
              <img
                className="rounded-[10px] transition-all hover:scale-[1.1] duration-300"
                width={310}
                height={340}
                src="assets/images/author/1.webp"
                alt=""
              />
            </a>
          </div>
          <div className="meta text-center">
            <h6 className="name heading text-heading mb-[5px]">
              Emma Elizabeth
            </h6>
            <span className="block">Managing Partner</span>
            <div className="flex items-center gap-[10px] justify-center mt-[10px] text-[20px]">
              <a href="#">
                <i className="flaticon-facebook" />
              </a>
              <a href="#">
                <i className="flaticon-linkedin" />
              </a>
              <a href="#">
                <i className="flaticon-whatsapp" />
              </a>
            </div>
          </div>
        </div>
        <div className="team max-w-max">
          <div className="thumb mb-[28px] overflow-hidden rounded-[10px]">
            <a href="#">
              <img
                className="rounded-[10px] transition-all hover:scale-[1.1] duration-300"
                width={310}
                height={340}
                src="assets/images/author/author-6.webp"
                alt=""
              />
            </a>
          </div>
          <div className="meta text-center">
            <h6 className="name heading text-heading mb-[5px]">
              Serina Elizabeth
            </h6>
            <span className="block">Assistant Manager</span>
            <div className="flex items-center gap-[10px] justify-center mt-[10px] text-[20px]">
              <a href="#">
                <i className="flaticon-facebook" />
              </a>
              <a href="#">
                <i className="flaticon-linkedin" />
              </a>
              <a href="#">
                <i className="flaticon-whatsapp" />
              </a>
            </div>
          </div>
        </div>
        <div className="team max-w-max">
          <div className="thumb mb-[28px] overflow-hidden rounded-[10px]">
            <a href="#">
              <img
                className="rounded-[10px] transition-all hover:scale-[1.1] duration-300"
                width={310}
                height={340}
                src="assets/images/author/author-5.webp"
                alt=""
              />
            </a>
          </div>
          <div className="meta text-center">
            <h6 className="name heading text-heading mb-[5px]">Ashik Mahmud</h6>
            <span className="block">Country Manager</span>
            <div className="flex items-center gap-[10px] justify-center mt-[10px] text-[20px]">
              <a href="#">
                <i className="flaticon-facebook" />
              </a>
              <a href="#">
                <i className="flaticon-linkedin" />
              </a>
              <a href="#">
                <i className="flaticon-whatsapp" />
              </a>
            </div>
          </div>
        </div>
        <div className="team max-w-max">
          <div className="thumb mb-[28px] overflow-hidden rounded-[10px]">
            <a href="#">
              <img
                className="rounded-[10px] transition-all hover:scale-[1.1] duration-300"
                width={310}
                height={340}
                src="assets/images/author/7.webp"
                alt=""
              />
            </a>
          </div>
          <div className="meta text-center">
            <h6 className="name heading text-heading mb-[5px]">Al Amin</h6>
            <span className="block">Customer Relationship</span>
            <div className="flex items-center gap-[10px] justify-center mt-[10px] text-[20px]">
              <a href="#">
                <i className="flaticon-facebook" />
              </a>
              <a href="#">
                <i className="flaticon-linkedin" />
              </a>
              <a href="#">
                <i className="flaticon-whatsapp" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* team section end */}
  {/* testimonial section */}
  <div className="relative lg:py-[120px] py-[80px]">
    <div className="container">
      <div className="mb-[40px] relative">
        <div>
          <span
            className="heading heading-6 relative mb-[15px] left-[65px] text-primary inline-block
              before:absolute before:left-[-65px] before:bottom-[50%] before:w-[52px] before:h-[12px] before:bg-no-repeat before:bg-[url('images/shape/section__style__two.html')] before:transform before:translate-y-2/4"
          >
            Testimonial
          </span>
          <h2 className="text-heading capitalize">What Our Client Say</h2>
        </div>
        <div className="slider__navigation">
          <div className="nav__btn button-next">
            <img src="assets/images/icon/arrow-left-short.svg" alt="" />
          </div>
          <div className="nav__btn button-prev">
            <img src="assets/images/icon/arrow-right-short.svg" alt="" />
          </div>
        </div>
      </div>
      <div className="testimonial__slider overflow-hidden lg:w-11/12 w-full">
        <div className="swiper-wrapper">
          <div className="swiper-slide">
            <div className="lg:flex items-center lg:gap-[60px] gap-[30px] grid">
              <div className="">
                <img
                  className="rounded-[50%] border-[6px] h-[310px] min-w-[310px] border-[#F1F1F1] object-cover"
                  src="assets/images/author/author-2x.webp"
                  height={310}
                  width={310}
                  alt=""
                />
              </div>
              <div className="testimonial__content">
                <div className="single__slider__item">
                  <div className="mb-[20px]  text-[25px] text-primary">
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star-sharp-half-stroke" />
                  </div>
                  <span className="block text-[18px] leading-[28px] xl:text-[28px] xl:leading-[42px] mb-5 lg:text-[24px] lg:leading-[38px]">
                    Choosing Ristay was one of the best decisions we've ever
                    made. They have proven to be a reliable and innovative
                    partner, always ready to tackle new challenges with and
                    expertise.Their commitment to and delivering tailored.
                  </span>
                  <div className="slider__author__info">
                    <div className="slider__author__info__content">
                      <h6 className="mb-0 heading text-heading">
                        Sarah Martinez
                      </h6>
                      <span>COO of Apex Solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="swiper-slide">
            <div className="lg:flex items-center lg:gap-[60px] gap-[30px] grid">
              <div className="max-h-[310px]">
                <img
                  className="rounded-[50%] border-[6px] border-[#F1F1F1] md:h-[310px] md:min-w-[310px] h-[280px] min-w-[280px] object-cover"
                  src="assets/images/author/author-6.webp"
                  height={310}
                  width={310}
                  alt=""
                />
              </div>
              <div className="testimonial__content">
                <div className="single__slider__item">
                  <div className="mb-[20px]  text-[25px] text-primary">
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star" />
                    <i className="flaticon-star-sharp-half-stroke" />
                  </div>
                  <span className="block text-[18px] leading-[28px] xl:text-[28px] xl:leading-[42px] mb-5 lg:text-[24px] lg:leading-[38px]">
                    Choosing Ristay was one of the best decisions we've ever
                    made. They have proven to be a reliable and innovative
                    partner, always ready to tackle new challenges with and
                    expertise.Their commitment to and delivering tailored.
                  </span>
                  <div className="slider__author__info">
                    <div className="slider__author__info__content">
                      <h6 className="mb-0 heading text-heading">
                        Sarah Martinez
                      </h6>
                      <span>COO of Apex Solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
