import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/NavBar";
import Home from "./pages/Home";
import Locator from "./pages/Locator";
import About from "./pages/About";

function App() {

  const [userLocation, setUserLocation] = useState(null);
  const [search, setSearch] = useState("");

  // Detect live user location
  useEffect(() => {

    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        (position) => {

          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);

        },
        (error) => {
          console.log("Location access denied", error);
        }
      );

    }

  }, []);

  return (

    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Homepage */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* ATM Locator Page */}
        <Route
          path="/locator"
          element={
            <Locator
              userLocation={userLocation}
              search={search}
              setSearch={setSearch}
            />
          }
        />

        {/* About Page */}
        <Route
          path="/about"
          element={<About />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;