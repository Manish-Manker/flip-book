import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import './backup.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BackupFlipBook = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageWidth, setPageWidth] = useState(720);
  const [pageHeight, setPageHeight] = useState(720);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const newPageWidth = Math.min(containerWidth/2 , 920);
        const newPageHeight = newPageWidth * 0.7625;
        setPageWidth(newPageWidth);
        setPageHeight(newPageHeight);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(URL.createObjectURL(file));
    } else {
      alert('Please upload a valid PDF file');
    }
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
            onChange={handleFileUpload}
          />
          <p>Upload a PDF file to create a flip book</p>
        </div>
      ) : (
        <HTMLFlipBook
          width={pageWidth}
          height={pageHeight}
          size="stretch"
          maxWidth={1920}
          maxHeight={1080}
          maxShadowOpacity={0.8}
          minWidth={pageWidth}
          drawShadow={true}
          flippingTime={500}
          usePortrait={false}
          startPage={0}
          showCover={true}
          mobileScrollSupport={true}
          autoSize={true}
          className="demo-book"
          style={{ margin: "0 auto" }}

        >
          {Array.from(new Array(numPages), (el, index) => (
            <div className="demoPage" key={index + 1}>
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
                  scale={pageHeight / 720}
                />
              </Document>
            </div>
          ))}
        </HTMLFlipBook>
      )}
    </div>
  );
};

export default BackupFlipBook;