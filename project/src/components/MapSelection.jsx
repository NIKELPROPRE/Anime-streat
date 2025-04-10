import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/MapSelection.css";

const MapSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [maps, setMaps] = useState([
    {
      id: 1,
      name: "One Piece",
      mapImage: "Map/Onepiece.png",
      previewImage: "Map/Onepiece.png",
      frameCoordinates: { x: 0, y: 0, width: 0, height: 0 },
      boundaries: {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50,
      },
    },
    {
      id: 2,
      name: "Naruto",
      mapImage: "Map/konoha.jpg",
      previewImage: "Map/konoha.jpg",
      frameCoordinates: { x: 0, y: 0, width: 0, height: 0 },
      boundaries: {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50,
      },
    },
    {
      id: 3,
      name: "Hunter x Hunter",
      mapImage: "Map/JS-HunterXHunter.png",
      previewImage: "Map/JS-HunterXHunter.png",
      frameCoordinates: { x: 0, y: 0, width: 0, height: 0 },
      boundaries: {
        left: 100,
        right: 100,
        top: 50,
        bottom: 50,
      },
    },
  ]);

  const [player1Selection, setPlayer1Selection] = useState(0);
  const [player2Selection, setPlayer2Selection] = useState(0);
  const [player1Confirmed, setPlayer1Confirmed] = useState(false);
  const [player2Confirmed, setPlayer2Confirmed] = useState(false);

  // Gestion des entrées clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // Contrôles Joueur 1 (q, d, i)
      if (key === "q" && !player1Confirmed) {
        setPlayer1Selection((prev) => (prev > 0 ? prev - 1 : maps.length - 1));
      } else if (key === "d" && !player1Confirmed) {
        setPlayer1Selection((prev) => (prev < maps.length - 1 ? prev + 1 : 0));
      } else if (key === "i" && !player1Confirmed) {
        setPlayer1Confirmed(true);
        console.log("Joueur 1 a confirmé:", maps[player1Selection].name);
      }

      // Contrôles Joueur 2 (flèches gauche/droite, 1)
      if (key === "arrowleft" && !player2Confirmed) {
        setPlayer2Selection((prev) => (prev > 0 ? prev - 1 : maps.length - 1));
      } else if (key === "arrowright" && !player2Confirmed) {
        setPlayer2Selection((prev) => (prev < maps.length - 1 ? prev + 1 : 0));
      } else if (key === "1" && !player2Confirmed) {
        setPlayer2Confirmed(true);
        console.log("Joueur 2 a confirmé:", maps[player2Selection].name);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    player1Selection,
    player2Selection,
    player1Confirmed,
    player2Confirmed,
    maps,
  ]);

  // Vérifier si les deux joueurs ont confirmé
  useEffect(() => {
    if (player1Confirmed && player2Confirmed) {
      // Déterminer la map à utiliser
      let selectedMap;

      if (player1Selection === player2Selection) {
        // Les deux joueurs ont choisi la même map
        selectedMap = maps[player1Selection];
      } else {
        // Choix différents, sélection aléatoire
        const randomIndex = Math.floor(Math.random() * maps.length);
        selectedMap = maps[randomIndex];
        console.log("Choix différents, map aléatoire:", selectedMap.name);
      }

      // Récupérer les personnages sélectionnés de la navigation
      const { player1Character, player2Character } = location.state || {
        player1Character: "Naruto",
        player2Character: "Luffy",
      };

      console.log(
        "Personnages sélectionnés:",
        player1Character,
        player2Character
      );

      // Passer à l'écran de combat avec la map et les personnages sélectionnés
      setTimeout(() => {
        navigate("/versus", {
          state: {
            mapId: selectedMap.id,
            mapName: selectedMap.name,
            mapImage: selectedMap.mapImage,
            frameCoordinates: selectedMap.frameCoordinates,
            boundaries: selectedMap.boundaries,
            player1Character: player1Character,
            player2Character: player2Character,
          },
        });
      }, 1500);
    }
  }, [
    player1Confirmed,
    player2Confirmed,
    player1Selection,
    player2Selection,
    maps,
    navigate,
    location.state,
  ]);

  return (
    <div className="map-selection">
      <h1>Sélection de la map</h1>

      {/* Aperçu de la map actuelle */}
      <div className="current-map-preview">
        <img
          src={
            maps[
              player1Confirmed
                ? player1Selection
                : player2Confirmed
                ? player2Selection
                : player1Selection
            ].previewImage
          }
          alt="Aperçu de la map"
        />
        <h2>
          {
            maps[
              player1Confirmed
                ? player1Selection
                : player2Confirmed
                ? player2Selection
                : player1Selection
            ].name
          }
        </h2>
      </div>

      {/* Statut des joueurs */}
      <div className="player-status">
        <div
          className={`player player1 ${player1Confirmed ? "confirmed" : ""}`}
        >
          <h3>Joueur 1</h3>
          <p>
            {player1Confirmed
              ? "Confirmé!"
              : "Choisissez une map (q, d) et confirmez (i)"}
          </p>
        </div>
        <div
          className={`player player2 ${player2Confirmed ? "confirmed" : ""}`}
        >
          <h3>Joueur 2</h3>
          <p>
            {player2Confirmed
              ? "Confirmé!"
              : "Choisissez une map (←, →) et confirmez (1)"}
          </p>
        </div>
      </div>

      {/* Miniatures des maps */}
      <div className="map-thumbnails">
        {maps.map((map, index) => (
          <div
            key={map.id}
            className={`map-thumbnail 
              ${player1Selection === index ? "player1-selected" : ""} 
              ${player2Selection === index ? "player2-selected" : ""}
              ${
                player1Selection === index && player2Selection === index
                  ? "both-selected"
                  : ""
              }
            `}
            onClick={() => {
              if (!player1Confirmed) setPlayer1Selection(index);
              else if (!player2Confirmed) setPlayer2Selection(index);
            }}
          >
            <img src={map.previewImage} alt={map.name} />
            <p>{map.name}</p>

            {/* Indicateurs de sélection */}
            {player1Selection === index && !player1Confirmed && (
              <div className="p1-indicator">P1</div>
            )}
            {player2Selection === index && !player2Confirmed && (
              <div className="p2-indicator">P2</div>
            )}
            {player1Confirmed && player1Selection === index && (
              <div className="p1-confirmed">✓</div>
            )}
            {player2Confirmed && player2Selection === index && (
              <div className="p2-confirmed">✓</div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="instructions">
        <p>Joueur 1: Utilisez Q et D pour naviguer, I pour confirmer</p>
        <p>Joueur 2: Utilisez ← et → pour naviguer, 1 pour confirmer</p>
      </div>
    </div>
  );
};

export default MapSelection;
