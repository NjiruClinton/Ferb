import React, { useState, useRef } from 'react';
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

    function capture(event) {
        event.preventDefault();
        var node = document.getElementById('qr');
        html2canvas(node).then(function (canvas) {
            var img = canvas.toDataURL("image/png");
            var link = document.createElement('a');
            link.download = 'my-image-name.png';
            link.href = img;
            link.click();
        });
    }

    





  return (
    <div className='grid h-screen place-items-center'>
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
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 cursor-pointer">
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" onClick={capture}/>
</svg>

    </div>
  );
}

export default QRCodeGenerator;



