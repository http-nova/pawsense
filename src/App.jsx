import { HashRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navbar/Nav.jsx";
import Home from "./Home/Home.jsx";
import Toys from "./Toys/Toys.jsx";
import Groom from "./Groom/Groom.jsx";
import Admin from "./Admin/Admin.jsx";
import AboutUs from "./AboutUs/AboutUs.jsx";
import ContactUs from "./ContactUs/ContactUs.jsx";
import VetMap from "./VetFinder/VetMap.jsx";

function App() {
  return (
    <HashRouter>
      <Nav />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Toys />
              <Groom />
              <VetMap />
              <AboutUs />
              <ContactUs />
            </>
          }
        />

        <Route path="/admin" element={<Admin />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
