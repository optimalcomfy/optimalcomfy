import React from 'react';
import './about.css';

function About() {
  return (
    <div className="about-section">
      <div className="background-image">
        <img src="assets/images/offer/section__bg.svg" alt="Background decoration" />
      </div>
      <div className="container">
        <div className="about-content-wrapper">
          <div className="about-image-section">
            <div className="main-image-wrapper">
              <div className="main-image">
                <img
                  src="/images/friends5.jpeg"
                  alt="about image"
                  className='max-w-4xl rounded-md'
                />
              </div>
              <div className="floating-image">
                <img
                  src="assets/images/about/about-main.webp"
                  width={312}
                  height={230}
                  alt="Experience at Ristay Hotel"
                />
              </div>
            </div>
          </div>
          <div className="about-text-content">
            <span className="sub-heading">About Us</span>
            <h2>Welcome To Friends corner hotel</h2>
            <p>
              Welcome to where luxury meets comfort.
              We have been dedicated to providing an exceptional stay
              for our guests, blending modern amenities with timeless elegance. Our
              beautifully designed properties and suites offer stunning views and plush
              accommodations, ensuring a restful retreat whether you're here for
              business or leisure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;