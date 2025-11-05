import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Cold from "./pages/Cold";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cold" element={<Cold />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  );
}

export default App;
