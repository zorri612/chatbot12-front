

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectSession from "./pages/SelectSession";
import Chat from "./pages/Chat";
import Summary from "./pages/Summary";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select" element={<SelectSession />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/summary/:userId" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  );
}
