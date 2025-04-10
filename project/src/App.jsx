import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./components/MainMenu";
import VersusBot from "./components/VersusBot";
import TestLuffy from "./components/TestLuffy";
import TestNaruto from "./components/TestNaruto";
import CharacterSelection from "./components/CharacterSelection";
import VersusMode from "./components/VersusMode";
import MapSelection from "./components/MapSelection";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/versus-bot" element={<VersusBot />} />
        <Route path="/two-player" element={<CharacterSelection />} />
        <Route path="/character-selection" element={<CharacterSelection />} />
        <Route path="/map-selection" element={<MapSelection />} />
        <Route path="/versus" element={<VersusMode />} />
      </Routes>
    </Router>
  );
}

export default App;
