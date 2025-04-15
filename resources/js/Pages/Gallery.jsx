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
import Video from "@/Components/Video";


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { flash, pagination } = usePage().props;
  
  const imageCount = 19;
  const images = Array.from({ length: imageCount }, (_, i) => `/image/gallery/${i + 1}.jpg`);
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
          <>
            <div
              className="relative bg-[url('/image/gallery/1.jpg')] 
              h-[400px] lg:h-[700px] bg-cover bg-center bg-no-repeat flex items-center 
              before:absolute before:top-0 before:bottom-0 before:left-0 before:right-0 before:bg-heading before:opacity-60"
            >
              <div className="container text-center text-white relative">
                <h1 className="heading text-white mb-[25px] text-[40px] lg:text-[70px] md:text-[60px] sm:text-[50px] leading-none">
                  Our Gallery
                </h1>
                <p className="text-sm">
                  where every image tells a story of luxury, comfort, and unparalleled
                  hospitality
                </p>
              </div>
            </div>
            {/* breadcrumb area end */}
            {/* gallery section */}
            <div className="relative p-[100px_0] lg:p-[110px_0]">
              <div className="container">
                <div>
                  <div className="gallery">
                    <div className="gallery__image flex flex-col gap-[30px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px]">
                        {images.slice(1).map((src, index) => (
                          <div className="gallery__item" key={index}>
                            <a href={src} className="gallery__link">
                              <img className="rounded-[6px] img-fluid" src={src} alt={`gallery-${index + 1}`} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Video />
          </>

          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
