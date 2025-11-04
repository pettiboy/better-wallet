import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import Cold from "./pages/Cold";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cold" element={<Cold />} />
    </Routes>
  );
}

export default App;
