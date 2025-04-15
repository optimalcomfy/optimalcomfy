import React from 'react'
import '../../css/style.css'
import '../../css/plugins.min.css'

function Offer() {
  return (
<div className="relative">
  <div className="absolute bottom-0 left-0 hidden lg:block">
    <img src="assets/images/about/section__shape.svg" alt="" />
  </div>
  <div className="container">
    <div className="text-center mb-[40px]">
      <span className="subtitle font-glida heading-6 heading text-primary before:bg-[url('images/shape/section__style__three-1.html')] after:bg-[url('images/shape/section__style__two.html')]">
        Special Offer
      </span>
      <h2 className="text-heading mt-[15px]">Special Offer</h2>
    </div>
    <div className="xl:flex gap-[30px] grid">
      {/* single offer */}
      <div className="rounded-[10px] overflow-hidden xl:max-w-[532px] bg-heading lg:flex xl:flex-col">
        <a href="#" className="lg:flex-1 xl:flex-[unset]">
          <img src="assets/images/offer/5.webp" alt="" />
        </a>
        <div className="p-[30px_30px_30px_40px]">
          <a href="#" className="heading heading-4 text-white mb-[20px] block">
            Family Fun Package
          </a>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] leading-none text-white">
            <li className="flex items-center gap-2">
              <i className="flaticon-check-circle" /> 15% off on family suites
            </li>
            <li className="flex items-center gap-2">
              <i className="flaticon-check-circle" /> Free meals for kids under
              12
            </li>
            <li className="flex items-center gap-2">
              <i className="flaticon-check-circle" /> Complimentary tickets
            </li>
            <li className="flex items-center gap-2">
              <i className="flaticon-check-circle" /> The local amusement park
            </li>
          </ul>
          <span className="heading heading-3 block mt-[25px] text-primary">
            $39.00
          </span>
        </div>
      </div>
      {/* single offer end */}
      <div className="w-full grid grid-cols-1 gap-[30px]">
        {/* single offer */}
        <div className="rounded-[10px] overflow-hidden md:flex items-center bg-heading grid">
          <a href="#">
            <img
              src="assets/images/offer/7.webp"
              className="w-full md:w-[265px]"
              height={310}
              width={265}
              alt=""
            />
          </a>
          <div className=" p-[30px_30px_30px_30px]">
            <a
              href="#"
              className="heading heading-5 text-white mb-[20px] block"
            >
              Spa Retreat
            </a>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] leading-none text-white">
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> A two-night a room
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Daily spa treatments
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Healthy breakfast
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Access to all spa{" "}
              </li>
            </ul>
            <span className="heading heading-4 block mt-[25px] text-primary">
              $39.00
            </span>
          </div>
        </div>
        {/* single offer end */}
        {/* single offer */}
        <div className="rounded-[10px] overflow-hidden md:flex items-center bg-heading grid">
          <a href="#">
            <img
              src="assets/images/offer/6.webp"
              className="w-full md:w-[265px]"
              height={310}
              width={265}
              alt=""
            />
          </a>
          <div className=" p-[30px_30px_30px_30px]">
            <a
              href="#"
              className="heading heading-5 text-white mb-[20px] block"
            >
              Romantic Getaway
            </a>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-[20px] leading-none text-white">
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> A two-night a room
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Daily spa treatments
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Healthy breakfast
              </li>
              <li className="flex items-center gap-2">
                <i className="flaticon-check-circle" /> Access to all spa{" "}
              </li>
            </ul>
            <span className="heading heading-4 block mt-[25px] text-primary">
              $39.00
            </span>
          </div>
        </div>
        {/* single offer end */}
      </div>
    </div>
  </div>
</div>

  )
}

export default Offer
