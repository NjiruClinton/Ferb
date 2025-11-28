import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';

function QRCodeGenerator() {
  const [inputText, setInputText] = useState('');

  function handleInputChange(e) {
    setInputText(e.target.value);
  }

  function paste (event) {
event.preventDefault();
navigator.clipboard.readText().then(text => {
          setInputText(text);
        }).then(() => {
            console.log('Pasted');
            document.getElementById('response').innerHTML = 'pasted'

            setTimeout(() => {
                document.getElementById('response').style.display = 'none';
            }, 1000);
            document.getElementById('response').style.display = 'block';

        }).catch(err => {
            console.log('Something went wrong', err);
            document.getElementById('response').innerHTML = 'Something went wrong';
        }
        );

  }

    function capture(event, withFrame = false) {
        if (event && event.preventDefault) event.preventDefault()
        const node = document.getElementById('qr')
        if (!node) return

        if (!withFrame) {
          html2canvas(node).then(function (canvas) {
              var img = canvas.toDataURL("image/png")
              var link = document.createElement('a')
              link.download = 'qr.png'
              link.href = img
              link.click()
          }).catch(err => console.error('capture error', err))
          return
        }
        html2canvas(node).then(function (capturedCanvas) {
          try {
            const scale = capturedCanvas.width / (node.offsetWidth || capturedCanvas.width)
            const paddingCssPx = 24
            const padding = Math.round(paddingCssPx * (scale || 1))
            const cornerRadiusCssPx = 8
            const radius = Math.round(cornerRadiusCssPx * (scale || 1))

            const outCanvas = document.createElement('canvas')
            outCanvas.width = capturedCanvas.width + padding * 2
            outCanvas.height = capturedCanvas.height + padding * 2
            const ctx = outCanvas.getContext('2d')

            ctx.fillStyle = '#ffffff'
            const w = outCanvas.width
            const h = outCanvas.height
            const r = radius
            ctx.beginPath()
            ctx.moveTo(r, 0)
            ctx.arcTo(w, 0, w, h, r)
            ctx.arcTo(w, h, 0, h, r)
            ctx.arcTo(0, h, 0, 0, r)
            ctx.arcTo(0, 0, w, 0, r)
            ctx.closePath()
            ctx.fill()

            ctx.save()
            ctx.beginPath()
            ctx.moveTo(r, 0)
            ctx.arcTo(w, 0, w, h, r)
            ctx.arcTo(w, h, 0, h, r)
            ctx.arcTo(0, h, 0, 0, r)
            ctx.arcTo(0, 0, w, 0, r)
            ctx.closePath()
            ctx.clip()

            ctx.drawImage(capturedCanvas, padding, padding)
            ctx.restore()

            const img = outCanvas.toDataURL('image/png')
            const link = document.createElement('a')
            link.download = 'qr-with-frame.png'
            link.href = img
            link.click()
          } catch (err) {
            console.error('frame capture error', err)
          }
        }).catch(err => console.error('capture error', err))
    }

  return (
    <div className='grid h-screen place-items-center '>
        <h1 className='font-bold text-5xl text-sky-400/100 animate-bounce'>QRs</h1>
      <div>

<div className='flex items-center
bg-white
        justify-center border-2 border-gray-300 p-0 rounded-lg'>

        <input type="text" className=" border-white p-2 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-none focus:border-transparent
        " placeholder='paste link' value={inputText} onChange={handleInputChange} />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer" onClick={paste} >
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
</svg>
</div>
<div id="response" className='text-green-400'></div>
      </div>
    <div id = "qr" >
      <QRCode value={inputText} size={256} />
</div>

      <div className="flex gap-3 mt-4">
        <button
          className="bg-sky-500 text-white p-2 rounded hover:bg-sky-600 flex items-center justify-center"
          onClick={(e) => capture(e, false)}
          aria-label="Download PNG"
          title="Download PNG"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        <button
          className="bg-gray-800 text-white p-2 rounded hover:bg-gray-900 flex items-center justify-center"
          onClick={(e) => capture(e, true)}
          aria-label="Download with white frame"
          title="Download with white frame"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <polyline points="8 12 12 16 16 12"/>
            <line x1="12" y1="16" x2="12" y2="8"/>
          </svg>
        </button>
      </div>

{/* tailwind footer */}


<footer className="p-4 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:p-6 dark:bg-gray-800">
    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2023 <a href="https://njiruclinton.netlify.app/" className="hover:underline">njiruclinton</a>. All Rights Reserved.
    </span>
    <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0 ml-4">
        <li>
            <a href="https://maingrainarticles.netlify.app/" className="mr-4 hover:underline md:mr-6 ">About</a>
        </li>
        <li>
            <a href="https://njiruclinton.netlify.app/" className="mr-4 hover:underline md:mr-6">Privacy Policy</a>
        </li>
        <li>
            <a href="https://njiruclinton.netlify.app/" className="mr-4 hover:underline md:mr-6">Licensing</a>
        </li>
        <li>
            <a href="https://njiruclinton.netlify.app/" className="hover:underline">Contact</a>
        </li>
    </ul>
</footer>


    </div>
  );
}

export default QRCodeGenerator;
