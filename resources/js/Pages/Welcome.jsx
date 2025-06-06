
import { Head, usePage } from "@inertiajs/react";
import {
  LayoutProvider,
} from "@/Layouts/layout/context/layoutcontext.jsx";
import { PrimeReactProvider } from "primereact/api";
import React from "react";
import HomeLayout from "@/Layouts/HomeLayout";
import '../../css/main'
import Product from "@/Components/Product";
import './Welcome.css'


export default function Welcome({ auth, laravelVersion, phpVersion }) {

  const { properties } = usePage().props;
  
  
  return (
    <>
      <PrimeReactProvider>
        <LayoutProvider>
          <Head title="Welcome" />
          <HomeLayout>
            <div class="product-grid padding-container">
              {properties.map((data, index) => (
                <Product key={index} {...data} />
              ))}
            </div>
          </HomeLayout>
        </LayoutProvider>
      </PrimeReactProvider>
    </>
  );
}
