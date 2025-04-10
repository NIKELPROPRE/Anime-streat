import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./components/MainMenu";
import VersusBot from "./components/VersusBot";
import TwoPlayer from "./components/TwoPlayer";
import Settings from "./components/Settings";
import TestLuffy from "./components/TestLuffy";
import TestNaruto from "./components/TestNaruto";
import TestCharacters from "./components/TestCharacters";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/versus-bot" element={<VersusBot />} />
        <Route path="/two-player" element={<TwoPlayer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test-luffy" element={<TestLuffy />} />
        <Route path="/test-naruto" element={<TestNaruto />} />
        <Route path="/test-characters" element={<TestCharacters />} />
        {/* Autres routes si nécessaire */}
      </Routes>
    </Router>
  );
}

export default App;
