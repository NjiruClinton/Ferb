import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import Navigation from '../Navigation/Navigation';
import {useAuth} from "../../contexts/AuthContext";

function QRsPage() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { logout } = useAuth();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          setError('Excel file must contain header row and at least one data row');
          setIsLoading(false);
          return;
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const rows = jsonData.slice(1);

        // Find required columns
        const ticketIndex = headers.findIndex(h => h.includes('ticket'));
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const phoneIndex = headers.findIndex(h => h.includes('phone'));
        const emailIndex = headers.findIndex(h => h.includes('email'));

        if (ticketIndex === -1 || nameIndex === -1) {
          setError('Excel file must contain "Ticket Number" and "Name" columns');
          setIsLoading(false);
          return;
        }

        const processedData = rows.map((row, index) => {
          const ticketNumber = row[ticketIndex];
          const name = row[nameIndex];

          if (!ticketNumber || !name) {
            return null; // Skip rows with missing required data
          }

          return {
            id: index,
            ticketNumber: ticketNumber.toString(),
            name: name.toString(),
            phone: row[phoneIndex] ? row[phoneIndex].toString() : '',
            email: row[emailIndex] ? row[emailIndex].toString() : '',
            qrContent: `TICKET NUMBER: ${ticketNumber}\nName: ${name}${row[phoneIndex] ? `\nPhone: ${row[phoneIndex]}` : ''}${row[emailIndex] ? `\nEmail: ${row[emailIndex]}` : ''}`
          };
        }).filter(item => item !== null);

        setData(processedData);
        setIsLoading(false);
      } catch (err) {
        setError('Error reading Excel file. Please ensure it\'s a valid .xlsx file.');
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const downloadQR = async (item, withFrame = false) => {
    const qrElement = document.getElementById(`qr-${item.id}`);
    if (!qrElement) return;

    try {
      if (!withFrame) {
        const canvas = await html2canvas(qrElement);
        const link = document.createElement('a');
        link.download = `qr-${item.ticketNumber}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        return;
      }

      // Download with frame
      const canvas = await html2canvas(qrElement);
      const scale = canvas.width / (qrElement.offsetWidth || canvas.width);
      const paddingCssPx = 24;
      const padding = Math.round(paddingCssPx * (scale || 1));
      const cornerRadiusCssPx = 8;
      const radius = Math.round(cornerRadiusCssPx * (scale || 1));

      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvas.width + padding * 2;
      outCanvas.height = canvas.height + padding * 2;
      const ctx = outCanvas.getContext('2d');

      // Draw rounded white background
      ctx.fillStyle = '#ffffff';
      const w = outCanvas.width;
      const h = outCanvas.height;
      const r = radius;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(w, 0, w, h, r);
      ctx.arcTo(w, h, 0, h, r);
      ctx.arcTo(0, h, 0, 0, r);
      ctx.arcTo(0, 0, w, 0, r);
      ctx.closePath();
      ctx.fill();

      // Clip and draw QR
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.arcTo(w, 0, w, h, r);
      ctx.arcTo(w, h, 0, h, r);
      ctx.arcTo(0, h, 0, 0, r);
      ctx.arcTo(0, 0, w, 0, r);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(canvas, padding, padding);
      ctx.restore();

      const link = document.createElement('a');
      link.download = `qr-${item.ticketNumber}-framed.png`;
      link.href = outCanvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error downloading QR code:', err);
    }
  };

  const downloadQRSvg = (item) => {
    const svgEl = document.querySelector(`#qr-svg-${item.id} svg`);
    if (!svgEl) return;

    // Clone so we can safely add attributes without affecting the DOM
    const clone = svgEl.cloneNode(true);
    if (!clone.getAttribute('xmlns')) {
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    if (!clone.getAttribute('xmlns:xlink')) {
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob(['<?xml version="1.0" standalone="no"?>\r\n', svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-${item.ticketNumber}.svg`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadAllQRs = async () => {
    const filteredData = data.filter(item =>
      item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    for (let i = 0; i < filteredData.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
      await downloadQR(filteredData[i], false);
    }
  };

  const filteredData = data.filter(item =>
    item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">QR Code Manager</h1>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isLoading && <div className="text-blue-600">Processing...</div>}
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Required columns:</strong> Ticket Number, Name</p>
            <p><strong>Optional columns:</strong> Phone, Email</p>
          </div>
        </div>

        {/* Search and Actions */}
        {data.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by ticket number, name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={downloadAllQRs}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Download All ({filteredData.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Grid */}
        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg p-6">
                <div className="text-center">
                  <div id={`qr-${item.id}`} className="flex justify-center mb-4">
                    <QRCode value={item.qrContent} size={200} />
                  </div>
                  {/* Hidden SVG version for SVG downloads */}
                  <div id={`qr-svg-${item.id}`} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                    <QRCode value={item.qrContent} size={200} renderAs="svg" />
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p><strong>Ticket:</strong> {item.ticketNumber}</p>
                    <p><strong>Name:</strong> {item.name}</p>
                    {item.phone && <p><strong>Phone:</strong> {item.phone}</p>}
                    {item.email && <p><strong>Email:</strong> {item.email}</p>}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => downloadQR(item, false)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                      title="Download PNG"
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      PNG
                    </button>
                    <button
                      onClick={() => downloadQR(item, true)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center"
                      title="Download with frame"
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <polyline points="8 12 12 16 16 12"/>
                        <line x1="12" y1="16" x2="12" y2="8"/>
                      </svg>
                      Frame
                    </button>
                    <button
                      onClick={() => downloadQRSvg(item)}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                      title="Download SVG"
                    >
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M4 4h6v6H4z"/>
                        <path d="M14 4h6v6h-6z"/>
                        <path d="M4 14h6v6H4z"/>
                        <path d="M14 14h3v3h-3zM18 18h2v2h-2z"/>
                      </svg>
                      SVG
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.length === 0 && !isLoading && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes generated yet</h3>
            <p className="text-gray-600">Upload an Excel file to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRsPage;
