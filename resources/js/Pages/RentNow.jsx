import { useEffect,useState } from "react";
import { Link, Head, usePage } from "@inertiajs/react";
import {
  LayoutContext,
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React, { useContext } from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'
import CarRideForm from "@/Components/CarRideForm";
import './Property.css'
import { PopupGallery } from "@/Components/PopupGallery";
import CarShareModal from "@/Components/CarShareModal";
import { Share2 } from "lucide-react";

export default function RentNow({ auth, laravelVersion, phpVersion }) {
  const { car } = usePage().props;

  const [galleryVisible, setGalleryVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Get the car image for OG tags
  const carImage = car?.initial_gallery?.[0]?.image
    ? `/storage/${car.initial_gallery[0].image}`
    : '/images/no-pic.avif';

  const fullImageUrl = `${window.location.origin}${carImage}`;
  const carUrl = window.location.href;
  const carTitle = `${car?.brand} ${car?.model} ${car?.year} - ${car?.category?.name}`;
  const carDescription = `Rent this ${car?.brand} ${car?.model} in ${car?.location_address} for KSh ${car?.platform_price}/day`;
  const siteName = "Ristay - Car Rentals";

  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head>
            <title>{carTitle}</title>

            {/* Open Graph Meta Tags for Rich Link Previews */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={carUrl} />
            <meta property="og:title" content={carTitle} />
            <meta property="og:description" content={carDescription} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={carTitle} />
            <meta name="twitter:description" content={carDescription} />
            <meta name="twitter:image" content={fullImageUrl} />
            <meta name="twitter:site" content="@ristay" />

            {/* Additional Meta Tags */}
            <meta name="description" content={carDescription} />
            <meta name="keywords" content={`${car?.brand}, ${car?.model}, ${car?.year}, car rental, ${car?.location_address}, ${car?.category?.name}`} />

            {/* Structured Data for SEO */}
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Car",
                "name": carTitle,
                "description": carDescription,
                "image": fullImageUrl,
                "url": carUrl,
                "brand": {
                  "@type": "Brand",
                  "name": car?.brand
                },
                "model": car?.model,
                "vehicleModelDate": car?.year,
                "vehicleSeatingCapacity": car?.seats,
                "numberOfDoors": car?.doors,
                "fuelType": car?.fuel_type,
                "vehicleTransmission": car?.transmission,
                "color": car?.exterior_color,
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": car?.location_address
                },
                "offers": {
                  "@type": "Offer",
                  "price": car?.platform_price,
                  "priceCurrency": "KES",
                  "availability": "https://schema.org/InStock"
                }
              })}
            </script>
          </Head>

          <HomeLayout>
            <div className="py-8 max-w-6xl mx-auto px-4">
              {/* Car Header with Share Button */}
              <div className="property-header flex justify-between items-start mb-6 mx-auto">
                <div className="property-title-section">
                </div>

                <div className="header-actions">
                  <button
                    className="share-btn flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                    onClick={() => setShareModalVisible(true)}
                  >
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>

              {/* Main Section */}
              <section className="main">
                <div className="container f-reverse">
                  <h2 className="hero__heading">
                    {car?.brand} {car?.model} {car?.year} - {car?.category?.name}
                  </h2>
                  {/* meta data */}
                  <div className="meta-data__container">
                    <div className="meta-data">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car?.location_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="location min-w-[240px]"
                      >
                        {car?.location_address}
                      </a>
                    </div>
                  </div>
                  {/* images */}
                  {car?.initial_gallery?.length > 1 ? (
                    <>
                      {car?.initial_gallery[0]?.image && (
                        <div className="hero-images">
                          <div className="img__container--hero">
                            <img src={`/storage/${car?.initial_gallery[0]?.image}`} alt="car" />
                            <button type="button" onClick={() => setGalleryVisible(true)} className="view-all-images">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <span>View all {car.initial_gallery.length} photos</span>
                            </button>
                          </div>
                        {car?.initial_gallery[1]?.image && (
                          <div className={`img__collage img__collage--${Math.min(car.initial_gallery.length - 1, 4)}`}>
                            {car?.initial_gallery.slice(1, 5).map((item, index) => (
                              item?.image && (
                                <div key={index} className="img__container">
                                  <img
                                    src={`/storage/${item.image}`}
                                    alt="room"
                                  />
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {car?.initial_gallery[0]?.image ? (
                      <div className="rounded-lg overflow-hidden mt-4 relative">
                        <img
                          src={`/storage/${car?.initial_gallery[0]?.image}`}
                          className="w-full h-[50vh] object-cover object-center"
                          alt="car"
                        />
                        <button type="button" onClick={() => setGalleryVisible(true)} className="view-all-images">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                          </svg>
                          <span>View photo</span>
                        </button>
                      </div>
                    ):
                    <div className="rounded-lg overflow-hidden mt-4 relative">
                        <img
                          src='/images/no-pic.avif'
                          className="w-full h-[50vh] object-contain object-center"
                          alt="car"
                        />
                      </div>
                    }
                  </>
                )}
                </div>
              </section>
              <div className="container-m">
                <hr />
              </div>
              {/* Details Section */}
              <section className="section">
                <div className="container container--details container-m">
                  <div className="section__content">
                    <div className="heading">
                      <div className="heading__title flex flex-col items-start gap-2">
                        <h3 className="content-title">
                            Owned by {car?.user?.name}
                        </h3>
                        {car?.user?.ristay_verified === "1" && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Verified
                            </span>
                        )}
                        </div>
                    </div>
                    <hr />

                    <hr />
                    {/* description paragraphs */}
                    <p className="section__content-paragraph">
                      {car?.description}
                    </p>
                    <p className="section__content-paragraph">
                      This {car?.year} {car?.brand} {car?.model} is perfect for your transportation needs in {car?.location_address}.
                      With {car?.seats} comfortable seats and {car?.doors} doors, it offers convenience and reliability for your journey.
                    </p>
                    <button className="show-more">
                      Show More
                      <div className="img__container">
                        <img src="/images/icons/small-arrow.svg" alt="arrow" />
                      </div>
                    </button>

                    <hr />
                    {/* Car specifications card */}
                    <div className="card">
                      <div className="card-images">
                        <div className="img__container">
                          <img src="/images/icons/car.svg" alt="car" />
                        </div>
                      </div>
                      <h5 className="text-sm">Vehicle Specifications</h5>
                      <p>{car?.seats} seats • {car?.doors} doors • {car?.fuel_type} • {car?.transmission}</p>
                    </div>
                    <hr />

                    {/* Detailed Specifications */}
                    <h4 className="mt-4">Specifications</h4>
                    <div className="my-4">
                      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                        <tbody>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Body</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.category?.name}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Seat</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.seats} seats</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Door</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.doors} doors</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Luggage</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.luggage_capacity}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Fuel Type</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.fuel_type}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Engine</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.engine_capacity}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Year</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.year}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Mileage</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.mileage}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Transmission</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.transmission}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Drive</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.drive_type}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Fuel Economy</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.fuel_economy}</td>
                          </tr>
                          <tr className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Exterior Color</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.exterior_color}</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 bg-gray-50">Interior Color</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{car?.interior_color}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <hr />
                    {/* features list */}
                    <h3 className="heading--amenities">Features</h3>
                    <div className="list">
                      <ul className="amenities-list flex flex-wrap gap-4 items-center">
                        {car?.car_features?.map((data, index) => (
                          <li key={index} className="flex justify-start items-center gap-4">
                            <i className={`${data?.feature?.icon} w-5 text-black`}></i>
                            <span className="flex items-center min-w-[200px]">{data?.feature?.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>


                  <CarRideForm car={car} />
                </div>
              </section>

              {/* Share Modal */}
              <CarShareModal
                car={car}
                visible={shareModalVisible}
                onHide={() => setShareModalVisible(false)}
              />

              <PopupGallery
                images={car?.initial_gallery || []}
                visible={galleryVisible}
                onHide={() => setGalleryVisible(false)}
              />
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
