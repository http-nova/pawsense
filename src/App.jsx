import { HashRouter, Routes, Route } from "react-router-dom";

import Nav from "./Navbar/Nav.jsx";
import Home from "./Home/Home.jsx";
import Toys from "./Toys/Toys.jsx";
import Groom from "./Groom/Groom.jsx";
import Admin from "./Admin/Admin.jsx";
import AboutUs from "./AboutUs/AboutUs.jsx";
import ContactUs from "./ContactUs/ContactUs.jsx";

function App() {
  return (
    <BrowserRouter basename="/pawsense">
      <Nav />

      <Routes>
        {/* MAIN WEBSITE */}
        <Route
          path="/"
          element={
            <>
              <Home />
              <Toys />
              <Groom />
              <AboutUs />
              <ContactUs />
            </>
          }
        />

        {/* ADMIN PANEL */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
