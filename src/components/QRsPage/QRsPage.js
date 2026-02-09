import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'
import Navigation from '../Navigation/Navigation'
import { useAuth } from '../../contexts/AuthContext'

// 👉 IMPORT YOUR IMAGE
import flyerImg from '../../assets/bf.png'

function QRsPage() {
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const { logout } = useAuth()

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length < 2) {
          setError('Excel file must contain header row and at least one data row')
          setIsLoading(false)
          return
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim())
        const rows = jsonData.slice(1)

        const ticketIndex = headers.findIndex(h => h.includes('ticket'))
        const nameIndex = headers.findIndex(h => h.includes('name'))
        const phoneIndex = headers.findIndex(h => h.includes('phone'))
        const emailIndex = headers.findIndex(h => h.includes('email'))

        if (ticketIndex === -1 || nameIndex === -1) {
          setError('Excel must contain Ticket Number and Name columns')
          setIsLoading(false)
          return
        }

        const processedData = rows.map((row, index) => {
          const ticketNumber = row[ticketIndex]
          const name = row[nameIndex]

          if (!ticketNumber || !name) return null

          return {
            id: index,
            ticketNumber: ticketNumber.toString(),
            name: name.toString(),
            phone: row[phoneIndex]?.toString() || '',
            email: row[emailIndex]?.toString() || '',
            qrContent: `TICKET: ${ticketNumber}\nNAME: ${name}`
          }
        }).filter(Boolean)

        setData(processedData)
        setIsLoading(false)
      } catch (err) {
        setError('Invalid Excel file')
        setIsLoading(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  const downloadQR = async (item) => {
    const element = document.getElementById(`ticket-${item.id}`)
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true
    })

    const link = document.createElement('a')
    link.download = `ticket-${item.ticketNumber}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const filteredData = data.filter(item =>
      item.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        {/* HEADER */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">QR Ticket Generator</h1>
            <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* UPLOAD */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
            />
            {isLoading && <p className="text-blue-600 mt-2">Processing…</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>

          {/* SEARCH */}
          {data.length > 0 && (
              <input
                  type="text"
                  placeholder="Search by ticket or name…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="mb-6 w-full px-4 py-2 border rounded"
              />
          )}

          {/* GRID */}
          <div className="flex flex-col gap-10">
          {filteredData.map(item => (
                <div key={item.id} className="bg-white p-4 rounded shadow">

                  {/* 🎟️ TICKET */}
                  <div
                      id={`ticket-${item.id}`}
                      className="relative w-[1000px] h-[380px] mx-auto"
                      style={{
                        backgroundImage: `url(${flyerImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                  >
                    {/* QR POSITION */}
                    <div
                        className="absolute text-center"
                        style={{
                          right: '15px',
                          top: '105px'
                        }}
                    >
                      <QRCode
                          value={item.qrContent}
                          size={160}
                          bgColor="#ffffff"
                      />
                      <div className="mt-10 font-semibold text-sm text-gray-900">
                        {item.name}
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}
                  <div className="flex justify-center mt-4">
                    <button
                        onClick={() => downloadQR(item)}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Download Ticket
                    </button>
                  </div>

                </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default QRsPage
