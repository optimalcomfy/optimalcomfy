import React, { useEffect, useRef, useState } from "react";
import ArrowIcon from "../assets/svgs/arrow-right.svg"; // Use as image source
import useWindowSize from "../hooks/useWindowSize";

const PropertySlider = ({ children, className }) => {
  const { width } = useWindowSize();
  const [page, setPage] = useState(0);

  const slider = useRef();
  const prevButton = useRef();
  const nextButton = useRef();

  const nextLimit =
    (slider.current?.scrollWidth / slider.current?.clientWidth).toFixed() - 1;

  let timeout = null;
  function handleWheel() {
    timeout !== null && clearTimeout(timeout);
    timeout = setTimeout(() => {
      const currentPage = parseInt(
        (slider.current.scrollLeft / slider.current.clientWidth).toFixed()
      );
      currentPage === 0 && (slider.current.scrollLeft = 0);
      currentPage === page ? slidePlacer() : setPage(currentPage);
    }, 400);
  }

  function slidePlacer() {
    slider.current.scrollLeft = slider.current.clientWidth * page;
  }

  useEffect(() => {
    slidePlacer();
  }, [page, width]);

  function toggleVisibiltyOfButtons() {
    nextButton.current.classList.toggle("hidden");
    prevButton.current.classList.toggle("hidden");
  }

  return (
    <div
      className="relative"
      onMouseEnter={toggleVisibiltyOfButtons}
      onMouseLeave={toggleVisibiltyOfButtons}
    >
      <button
        className="h-[30px] w-[30px] bg-[rgba(255,255,255,.9)] hidden disabled:hidden items-center justify-center rounded-full absolute left-3 top-1/2 -translate-y-1/2 hover:scale-[1.04] hover:bg-white border border-[rgba(0,0,0,.08)] shadow-[0_0_0_1px_transparent,0_0_0_4px_transparent,0_2px_4px_#0000002e]"
        onClick={() => setPage(page - 1)}
        disabled={page === 0}
        ref={prevButton}
      >
        <img src={ArrowIcon} alt="Left" className="rotate-180 w-6 h-6 m-auto" />
      </button>
      <div
        ref={slider}
        onScroll={handleWheel}
        className={`flex hide-scrollbar overflow-x-scroll scroll-hidden whitespace-wrap ${className}`}
      >
        {children}
      </div>
      <button
        className="h-[30px] w-[30px] bg-[rgba(255,255,255,.9)] hidden disabled:hidden items-center justify-center rounded-full absolute right-3 top-1/2 -translate-y-1/2 hover:scale-[1.04] hover:bg-white border border-[rgba(0,0,0,.08)] shadow-[0_0_0_1px_transparent,0_0_0_4px_transparent,0_2px_4px_#0000002e]"
        onClick={() => setPage(page + 1)}
        disabled={page === nextLimit}
        ref={nextButton}
      >
        <img src={ArrowIcon} alt="Right" className="w-6 h-6 m-auto" />
      </button>
    </div>
  );
};

export default PropertySlider;
