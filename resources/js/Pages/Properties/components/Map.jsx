import React, { useState, useEffect } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import PropertyMap from "@/Components/PropertyMap";

const Map = ({ property }) => {


  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Property map</h2>
      </div>

      <PropertyMap property={property} />
    </div>
  );
};

export default Map;