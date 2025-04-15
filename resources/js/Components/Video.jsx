import React, { useState } from 'react'

function Video() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const handlePlayClick = (e) => {
    e.preventDefault();
    setIsPlaying(true);
  };

  return (
    <div className="relative">
      <div className="w-full">
        <div className="relative rounded-none overflow-hidden">
          {!isPlaying ? (
            <>
              <div className="relative w-full h-96 md:h-[685px] backdrop:blur-[20px] rounded-none overflow-hidden jarallax before:absolute before:inset-0 before:content-[''] before:h-full before:w-full before:bg-black before:bg-opacity-30 before:rounded-none before:overflow-hidden z-0">
                <img
                  className="rounded-none overflow-hidden jarallax-img w-full h-full object-cover"
                  src="assets/images/video/video-main.webp"
                  alt="Video thumbnail"
                />
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="max-w-max rounded-full border border-solid border-white bg-opacity-75 bg-amber-700">
                  <svg
                    className="h-32 w-32 md:h-40 md:w-40 relative p-0.5 motion-safe:animate-spin"
                    style={{ animationDuration: '10s', animationTimingFunction: 'linear' }}
                    viewBox="0 0 100 100"
                  >
                    <defs>
                      <path
                        id="circle-2"
                        d="M50,50 m-37,0a37,37 0 1,1 74,0a37,37 0 1,1 -74,0"
                      />
                    </defs>
                    <text>
                      <textPath
                        className="text-xs fill-white font-sans"
                        xlinkHref="#circle-2"
                      >
                        Watch Now * Watch Now * Watch Full Video *
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl leading-none text-white">
                    <a
                      href="#"
                      className="video-play"
                      onClick={handlePlayClick}
                    >
                      <i className="block w-8 h-8">▶</i>
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-96 md:h-[685px]">
              <video
                className="w-full h-full object-cover"
                controls
                autoPlay
                src="/image/VID-20250228-WA0000 (1).mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Video