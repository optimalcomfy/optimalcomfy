import React from 'react'
import '../../css/style.css'
import '../../css/plugins.min.css'

function Facility() {
  return (
<div className="relative bg-[#f1f1f1] p-[80px_0] lg:p-[120px_0]">
  <div className="absolute top-0 right-0 hidden lg:block">
    <img src="assets/images/about/section__shape_2.svg" alt="" />
  </div>
  <div className="container">
    <div className="text-center mb-[40px]">
      <span className="subtitle font-glida heading-6 heading text-primary before:bg-[url('images/shape/section__style__three-1.html')] after:bg-[url('images/shape/section__style__two.html')]">
        Facilities
      </span>
      <h2 className="text-heading mt-[15px]">Hotel Facilities</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px]">
      <div className="py-[40px] px-[30px] text-center transition bg-white rounded-[10px]">
        <img
          src="assets/images/icon/bed.svg"
          alt="icon"
          className="mx-auto mb-[25px]"
        />
        <a href="#" className="heading-6 heading text-heading mb-[15px] block">
          Properties and Suites
        </a>
        <p>
          Varied types of properties, from standard to luxury suites, equipped with
          essentials like beds.
        </p>
      </div>
      <div className="py-[40px] px-[30px] text-center transition bg-white rounded-[10px]">
        <img
          src="assets/images/icon/security.svg"
          alt="icon"
          className="mx-auto mb-[25px]"
        />
        <a href="#" className="heading-6 heading text-heading mb-[15px] block">
          24-Hour Security
        </a>
        <p>
          On-site security personnel and best surveillance. from standard to
          luxury suites,Secure for valuables.
        </p>
      </div>
      <div className="py-[40px] px-[30px] text-center transition bg-white rounded-[10px]">
        <img
          src="assets/images/icon/gym.svg"
          alt="icon"
          className="mx-auto mb-[25px]"
        />
        <a href="#" className="heading-6 heading text-heading mb-[15px] block">
          Fitness Center
        </a>
        <p>
          Equipped with exercise machines and weights.Offering massages,
          facials, and other treatments.
        </p>
      </div>
      <div className="py-[40px] px-[30px] text-center transition bg-white rounded-[10px]">
        <img
          src="assets/images/icon/swimming-pool.svg"
          alt="icon"
          className="mx-auto mb-[25px]"
        />
        <a href="#" className="heading-6 heading text-heading mb-[15px] block">
          Swimming Pool
        </a>
        <p>
          Indoor or outdoor pools for leisure or exercise.Offering massages,
          facials, and other treatments
        </p>
      </div>
    </div>
  </div>
</div>

  )
}

export default Facility
