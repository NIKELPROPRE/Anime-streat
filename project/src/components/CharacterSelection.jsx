import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CharacterSelection.css";

// Importez directement les images
import luffyImage from "../../Image_perso/Luffy.jpg";
import narutoImage from "../../Image_perso/Naruto.jpg";

// Puis utilisez-les dans votre composant
const characterImages = {
  Luffy: luffyImage,
  Naruto: narutoImage,
};

const CharacterSelection = () => {
  const navigate = useNavigate();
  const [characters] = useState(["Luffy", "Naruto"]); // Liste des personnages disponibles
  const [player1Selection, setPlayer1Selection] = useState(0);
  const [player2Selection, setPlayer2Selection] = useState(1);
  const [player1Confirmed, setPlayer1Confirmed] = useState(false);
  const [player2Confirmed, setPlayer2Confirmed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;

      // Contrôles joueur 1 (QZSD + i)
      if (key === "q" && !player1Confirmed) {
        setPlayer1Selection((prev) =>
          prev > 0 ? prev - 1 : characters.length - 1
        );
      } else if (key === "d" && !player1Confirmed) {
        setPlayer1Selection((prev) =>
          prev < characters.length - 1 ? prev + 1 : 0
        );
      } else if (key === "i") {
        setPlayer1Confirmed(true);
      }

      // Contrôles joueur 2 (flèches + 1)
      if (key === "ArrowLeft" && !player2Confirmed) {
        setPlayer2Selection((prev) =>
          prev > 0 ? prev - 1 : characters.length - 1
        );
      } else if (key === "ArrowRight" && !player2Confirmed) {
        setPlayer2Selection((prev) =>
          prev < characters.length - 1 ? prev + 1 : 0
        );
      } else if (key === "1") {
        setPlayer2Confirmed(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player1Confirmed, player2Confirmed, characters.length]);

  // Lorsque les deux joueurs ont confirmé, passer au combat
  useEffect(() => {
    if (player1Confirmed && player2Confirmed) {
      setTimeout(() => {
        navigate("/map-selection", {
          state: {
            player1Character: characters[player1Selection],
            player2Character: characters[player2Selection],
          },
        });
      }, 1500);
    }
  }, [
    player1Confirmed,
    player2Confirmed,
    player1Selection,
    player2Selection,
    characters,
    navigate,
  ]);

  return (
    <div className="character-selection">
      <h1>Sélection des personnages</h1>

      <div className="selection-area">
        {/* Zone de sélection joueur 1 */}
        <div
          className={`player-selection ${player1Confirmed ? "confirmed" : ""}`}
        >
          <h2>Joueur 1</h2>
          <div className="character-card">
            <img
              src={characterImages[characters[player1Selection]]}
              alt={characters[player1Selection]}
              className="character-image"
            />
            <div className="character-name">{characters[player1Selection]}</div>
          </div>
          <div className="controls-hint">
            Q/D pour naviguer • I pour confirmer
          </div>
          {player1Confirmed && <div className="confirmed-text">Confirmé !</div>}
        </div>

        <div className="vs-sign">VS</div>

        {/* Zone de sélection joueur 2 */}
        <div
          className={`player-selection ${player2Confirmed ? "confirmed" : ""}`}
        >
          <h2>Joueur 2</h2>
          <div className="character-card">
            <img
              src={characterImages[characters[player2Selection]]}
              alt={characters[player2Selection]}
              className="character-image"
            />
            <div className="character-name">{characters[player2Selection]}</div>
          </div>
          <div className="controls-hint">
            ←/→ pour naviguer • 1 pour confirmer
          </div>
          {player2Confirmed && <div className="confirmed-text">Confirmé !</div>}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelection;
