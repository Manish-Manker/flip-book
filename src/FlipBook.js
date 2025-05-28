import React, { useRef, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import './flip.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-flip';
// import { Navigation, Pagination, EffectFlip } from 'swiper/modules';
import 'swiper/css/effect-coverflow';
// import { EffectCoverflow } from 'swiper/modules';
import 'swiper/css/effect-cards';
// import { EffectCards } from 'swiper/modules';
// import { Autoplay } from 'swiper/modules';
import 'swiper/css/autoplay';

import { Navigation, Pagination, EffectFlip, EffectCoverflow, EffectCards, Autoplay } from 'swiper/modules';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FlipBook = ({ numPages01, pdfFile01, width, height, pageFlipTimer }) => {
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [flipSound, setFlipSound] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isControlVisible, setIsControlVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [theme, setTheme] = useState('book');

  const swiperRef = useRef(null);
  const flipBookRef = useRef(null);
  const autoplayInterval = useRef(null);
  const audioRef = useRef(new Audio(process.env.PUBLIC_URL + '/sound/page-flip1.mp3'));

  // Fit to screen logic
  const calculateFitDimensions = (originalWidth, originalHeight) => {
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.90;
    const aspectRatio = originalWidth / originalHeight;

    let finalWidth = originalWidth;
    let finalHeight = originalHeight;

    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = finalWidth / aspectRatio;
    }
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = finalHeight * aspectRatio;
    }
    if (finalWidth > maxWidth / 2) {
      finalWidth = maxWidth / 2;
      finalHeight = finalWidth / aspectRatio;
    }

    return {
      width: Math.floor(finalWidth),
      height: Math.floor(finalHeight)
    };
  };

  useEffect(() => {
    const { width: fitWidth, height: fitHeight } = calculateFitDimensions(width, height);
    setPageWidth(fitWidth);
    setPageHeight(fitHeight);
  }, [width, height]);

  useEffect(() => {
    return () => clearInterval(autoplayInterval.current); // cleanup
  }, []);


  const startAutoplay = () => {
    setIsPlaying(true);
    if (theme === 'slider' || theme === 'coverflow' || theme === 'cards' || theme === 'flip-slide') {
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.start();
      }
    } else if (theme === 'book' || theme === 'magazine' || theme === 'album' || theme === 'notebook') {
      autoplayInterval.current = setInterval(() => {
        const current = flipBookRef.current.pageFlip().getCurrentPageIndex();
        if (current < numPages01 - 1) {
          if (flipSound) audioRef.current.play();
          flipBookRef.current.pageFlip().flipNext();
        } else {
          stopAutoplay();
        }
      }, pageFlipTimer * 1000);
    }
  };

  const stopAutoplay = () => {
    setIsPlaying(false);
    if (theme === 'slider' || theme === 'coverflow' || theme === 'cards' || theme === 'flip-slide') {
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    } else if (theme === 'book' || theme === 'magazine' || theme === 'album' || theme === 'notebook') {
      clearInterval(autoplayInterval.current);
    }
  };

  const swiperConfig = {
    loop: true,
    speed: 800,
    autoplay: {
      delay: pageFlipTimer * 1000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      enabled: isPlaying,
      waitForTransition: true
    },
    onSwiper: (swiper) => {
      swiperRef.current = swiper;
    }
  };

  return (
    <div className={`flipbook-container ${theme}`}>
      {pdfFile01 && numPages01 && (
        <>
          <div className="controls">
            <button onClick={() => setIsControlVisible(!isControlVisible)} aria-label="Toggle controls">
              {isControlVisible ? 'Disable Controls' : 'Enable Controls'}
            </button>

            <button
              disabled={!isControlVisible}
              onClick={isPlaying ? stopAutoplay : startAutoplay}
              aria-label="Toggle autoplay"
            >
              {isPlaying ? 'Stop Autoplay' : 'Start Autoplay'}
            </button>

            <button
              disabled={!isControlVisible}
              onClick={() => window.open(pdfFile01, '_blank')}
              aria-label="Download PDF"
            >
              Download Flipbook
            </button>

            <button
              disabled={!isControlVisible}
              onClick={() => setFlipSound(!flipSound)}
              aria-label="Toggle flip sound"
            >
              Flip sound {flipSound ? 'ON' : 'OFF'}
            </button>

            <label style={{ fontWeight: 'bold' }}>
              Page Flip Effect:
              <select
                className="effect-select"
                disabled={!isControlVisible}
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Select page flip effect"
              >
                <option value="book">Book</option>
                <option value="magazine">Magazine</option>
                <option value="album">Album</option>
                <option value="notebook">Notebook</option>
                <option value="slider">Slider</option>
                <option value="coverflow">Coverflow</option>
                <option value="cards">Cards</option>
                <option value="flip-slide">One Page</option>
              </select>
            </label>
          </div>

          {theme === 'slider' ? (
            <Swiper
              {...swiperConfig}
              key={theme}
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView="auto"
              centeredSlides={true}
              spaceBetween={30}
              navigation={true}
              style={{ width: pageWidth * 2, height: pageHeight }}
              onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex)}
              className="faded-slider"
            >
              {Array.from(new Array(numPages01), (_, index) => (
                <SwiperSlide
                  key={index}
                  style={{
                    width: `${pageWidth}px`,
                    height: `${pageHeight}px`,
                  }}
                >
                  <Document file={pdfFile01}>
                    <Page
                      pageNumber={index + 1}
                      width={pageWidth}
                      height={pageHeight}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  </Document>
                </SwiperSlide>
              ))}
            </Swiper>


          ) :

            theme === 'coverflow' ? (
              <Swiper
                {...swiperConfig}
                key={theme}
                effect="coverflow"
                modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                coverflowEffect={{
                  rotate: 50,
                  stretch: 0,
                  depth: 100,
                  modifier: 1,
                  slideShadows: false,
                }}
                navigation={true}
                style={{ width: pageWidth * 2, height: pageHeight }}
                className="coverflow-swiper faded-slider"
              >
                {Array.from(new Array(numPages01), (_, index) => (
                  <SwiperSlide
                    key={index}
                    style={{
                      width: `${pageWidth}px`,
                      height: `${pageHeight}px`,
                    }}
                  >
                    <Document file={pdfFile01}>
                      <Page
                        pageNumber={index + 1}
                        width={pageWidth}
                        height={pageHeight}
                        renderTextLayer={false}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) :

              theme === 'cards' ? (
                <Swiper
                  {...swiperConfig}
                  key={theme}
                  effect="cards"
                  modules={[EffectCards, Navigation, Autoplay]}
                  grabCursor={true}
                  navigation={true}
                  style={{ width: pageWidth, height: pageHeight }}
                  className="cards-swiper"
                >
                  {Array.from(new Array(numPages01), (_, index) => (
                    <SwiperSlide key={index}>
                      <Document file={pdfFile01}>
                        <Page
                          pageNumber={index + 1}
                          width={pageWidth}
                          height={pageHeight}
                          renderTextLayer={false}
                          renderAnnotationLayer={true}
                        />
                      </Document>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) :


                theme === 'flip-slide' ? (
                  <Swiper
                    {...swiperConfig}
                    key={theme}
                    effect="flip"
                    modules={[EffectFlip, Navigation, Autoplay]}
                    grabCursor={true}
                    navigation={true}
                    style={{ width: pageWidth, height: pageHeight }}
                    className="flip-style-swiper"
                  >
                    {Array.from(new Array(numPages01), (_, index) => (
                      <SwiperSlide key={index}>
                        <Document file={pdfFile01}>
                          <Page
                            pageNumber={index + 1}
                            width={pageWidth}
                            height={pageHeight}
                            renderTextLayer={false}
                            renderAnnotationLayer={true}
                          />
                        </Document>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )
                  : (

                    <HTMLFlipBook
                      key={theme}
                      onFlip={() => {
                        if (flipSound) audioRef.current.play();
                      }}
                      ref={flipBookRef}
                      width={pageWidth}
                      height={pageHeight}
                      size="fixed"
                      minWidth={pageWidth}
                      maxWidth={pageWidth}
                      minHeight={pageHeight}
                      maxHeight={pageHeight}
                      drawShadow={true}
                      maxShadowOpacity={0.5}
                      usePortrait={false}
                      startPage={currentPage}
                      showCover={theme !== 'magazine'}
                      mobileScrollSupport={true}
                      autoSize={true}
                      className={`demo-book ${theme}`}
                      style={{ margin: '0 auto' }}
                    >
                      {Array.from(new Array(numPages01), (_, index) => (
                        <div
                          className="demoPage"
                          key={index}
                          data-density={
                            theme === 'album' ? 'hard' :
                              theme === 'magazine' ? 'soft' :
                                undefined
                          }
                        >
                          <Document file={pdfFile01}>
                            <Page
                              pageNumber={index + 1}
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                              width={pageWidth}
                              height={pageHeight}
                              devicePixelRatio={1}
                              scale={1}
                              loading="Loading page..."
                              quality={70}
                              renderMode="canvas"
                            />
                          </Document>
                        </div>
                      ))}
                    </HTMLFlipBook>
                  )}
        </>
      )}
    </div>
  );
};

export default FlipBook;
