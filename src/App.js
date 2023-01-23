import Favicon from 'react-favicon'
import QRCodeGenerator from './components/QrCodeGenerator/QrCodeGenerator';

function App() {
  
  

  return (
  <div className=" sm:bg-blue-700 bg-[url('/images/backg.jpg')] bg-cover min-h-screen ">
    <Favicon url = {require("./logo.png")} />
      <QRCodeGenerator />
    </div>
  );
}

export default App;
