import React, { useState, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import CarMapDetails from "@/Components/CapMapDetails";

const CarMap = ({ car }) => {


  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Car map</h2>
      </div>

      <CarMapDetails car={car} />
    </div>
  );
};

export default CarMap;