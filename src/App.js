
import FlipBook from './FlipBook.js'
// import BackupFlipBook from './BackupFlipBook'
import './App.css'

import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import './flip.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const App = () => {

  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file?.type !== 'application/pdf') {
      alert('Please upload a valid PDF file');
      return;
    }

    const fileURL = URL.createObjectURL(file);

    const loadingTask = pdfjs.getDocument(fileURL);
    const pdfDocument = await loadingTask.promise;

    const page = await pdfDocument.getPage(1);
    const rotation = page.rotate || 0;
    const viewport = page.getViewport({ scale: 1, rotation });

    // const pdfWidth = Math.floor(viewport.width);
    // const pdfHeight = Math.floor(viewport.height);
    const pdfWidth = viewport.width * 96 / 72;
    const pdfHeight = viewport.height * 96 / 72;

    setWidth(pdfWidth);
    setHeight(pdfHeight);

    console.log('PDF dimensions:', pdfWidth, 'x', pdfHeight);

    setNumPages(pdfDocument.numPages);
    // at very last 
    setPdfFile(fileURL);

  };

  // useEffect(() => {
  //   handleFileUpload();
  // }, [])

  return (
    <>
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
        <div className="flipbook-container" >
          <FlipBook numPages01={numPages} pdfFile01={pdfFile} width={width} height={height} />
        </div>
      )}
    </>
  )
}

export default App