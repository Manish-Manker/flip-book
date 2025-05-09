import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import './flip.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const FlipBook = ({ numPages01, pdfFile01, width, height, pageFlipTimer }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const containerRef = useRef(null);
  const flipBookRef = useRef(null);
  const autoplayInterval = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [flipSound, setFlipSound] = useState(false);
  const [isControlVisible, setIsControlVisible] = useState(true);

  useEffect(() => {
    setPageHeight(height);
    setPageWidth(width);
    setPdfFile(pdfFile01);
    setNumPages(numPages01);
  }, [])

  const calculateFitDimensions = (originalWidth, originalHeight) => {
    const maxWidth = window.innerWidth * 0.95; 
    const maxHeight = window.innerHeight * 0.90;
    
    const aspectRatio = originalWidth / originalHeight;
    
    let finalWidth = originalWidth;
    let finalHeight = originalHeight;

    // First check width
    if (finalWidth > maxWidth) {
      finalWidth = maxWidth;
      finalHeight = finalWidth / aspectRatio;
    }
    
    // Then check height
    if (finalHeight > maxHeight) {
      finalHeight = maxHeight;
      finalWidth = finalHeight * aspectRatio;
    }
    
    // Ensure each page is not wider than half the screen
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
    const handleResize = () => {
      const { width: fitWidth, height: fitHeight } = calculateFitDimensions(width, height);
      setPageWidth(fitWidth);
      setPageHeight(fitHeight);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial calculation

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height]);

  // useEffect(() => {
  //   const { width: fitWidth, height: fitHeight } = calculateFitDimensions(width, height);
  //   setPageWidth(fitWidth);
  //   setPageHeight(fitHeight);
  //   setPdfFile(pdfFile01);
  //   setNumPages(numPages01);
  // }, [width, height, pdfFile01, numPages01]);
  let audio = new Audio('sound/page-flip1.mp3');

  const startAutoplay = () => {
    if (flipBookRef.current) {
      setIsPlaying(true);
      autoplayInterval.current = setInterval(() => {
        const currentPage = flipBookRef.current.pageFlip().getCurrentPageIndex();
        if (currentPage < numPages - 1) {
          audio.play();
          flipBookRef.current.pageFlip().flipNext();
        }
        else {
          setIsPlaying(false);
          clearInterval(autoplayInterval.current);
        }
      }, pageFlipTimer * 1000);
    }
  };

  const stopAutoplay = () => {
    setIsPlaying(false);
    clearInterval(autoplayInterval.current);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="flipbook-container" ref={containerRef}>
      {!pdfFile ? (
        <div className="upload-section">
          <input
            type="file"
            accept=".pdf"
          // onChange={handleFileUpload}
          />
          <p>Upload a PDF file to create a flip book</p>
        </div>
      ) : (
        <>

          <div className="controls">
            <button onClick={() => setIsControlVisible(!isControlVisible)}>
              {isControlVisible ? 'Disable Controls' : 'Enable Controls'}
            </button>

            <button disabled={!isControlVisible} onClick={isPlaying ? stopAutoplay : startAutoplay}>
              {isPlaying ? 'Stop Autoplay' : 'Start Autoplay'}
            </button>

            <button disabled={!isControlVisible} onClick={() => window.open(pdfFile, '_blank')}>
              Download Flipbook
            </button>
            <button disabled={!isControlVisible} onClick={() => setFlipSound(!flipSound)}>
              Flip sound {flipSound ? 'ON' : 'OFF'}
            </button>
          </div>

          <HTMLFlipBook
            onFlip={() => {
              let audio = new Audio('sound/page-flip01.mp3');
              if (flipSound) audio.play();
            }}
            ref={flipBookRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            maxShadowOpacity={0.8}
            drawShadow={true}
            // flippingTime={1000}
            usePortrait={false}
            startPage={currentPage}
            showCover={true}
            mobileScrollSupport={true}
            autoSize={true}
            className="demo-book"
            style={{ margin: '0 auto' }}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <div className="demoPage" key={index}>
                <Document
                  file={pdfFile}
                  onLoadSuccess={onDocumentLoadSuccess}
                >
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
        </>
      )}
    </div>
  );
};

export default FlipBook;