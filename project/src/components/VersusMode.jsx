import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Character from "./characters/Character";
import "../styles/VersusMode.css";

const VersusMode = () => {
  const location = useLocation();
  const mapData = location.state || {
    mapId: 1,
    mapName: "One Piece",
    mapImage: "Map/Onepiece.png",
    boundaries: { left: 0, right: 1200, top: 0, bottom: 600 },
    player1Character: "Naruto",
    player2Character: "Luffy",
  };

  const [isPaused, setIsPaused] = useState(false);
  const [player1Health, setPlayer1Health] = useState(500);
  const [player2Health, setPlayer2Health] = useState(500);
  const [player1Hurt, setPlayer1Hurt] = useState(false);
  const [player2Hurt, setPlayer2Hurt] = useState(false);
  const player1Ref = useRef(null);
  const player2Ref = useRef(null);
  const [player1UltimateCooldown, setPlayer1UltimateCooldown] = useState(0);
  const [player2UltimateCooldown, setPlayer2UltimateCooldown] = useState(0);

  // Extraire les personnages sélectionnés
  const player1Character = mapData.player1Character;
  const player2Character = mapData.player2Character;

  console.log(
    "VersusMode - Personnages reçus:",
    player1Character,
    player2Character
  );

  // Définition des contrôles
  const player1Controls = {
    LEFT: "q",
    RIGHT: "d",
    UP: "z",
    DOWN: "s",
    JUMP: "z",
    ATTACK1: "i",
    ATTACK2: "o",
    ULTIMATE: "k",
  };

  const player2Controls = {
    LEFT: "ArrowLeft",
    RIGHT: "ArrowRight",
    UP: "ArrowUp",
    DOWN: "ArrowDown",
    JUMP: "ArrowUp",
    ATTACK1: "1",
    ATTACK2: "2",
    ULTIMATE: "3",
  };

  // Gestion de la pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Vérifier les collisions entre les personnages et les dégâts
  const checkCollisions = useCallback(() => {
    if (!player1Ref.current || !player2Ref.current) return;

    const player1Position = player1Ref.current.getPosition();
    const player2Position = player2Ref.current.getPosition();
    const player1Attacking = player1Ref.current.isAttacking();
    const player2Attacking = player2Ref.current.isAttacking();
    const player1AttackType = player1Ref.current.getAttackType();
    const player2AttackType = player2Ref.current.getAttackType();
    const player1Direction = player1Ref.current.getDirection();
    const player2Direction = player2Ref.current.getDirection();

    // Vérifier les limites de la map pour player 1
    if (player1Ref.current) {
      const currentPos = player1Ref.current.getPosition();

      if (currentPos.x < mapData.boundaries.left) {
        player1Ref.current.setPosition({
          ...currentPos,
          x: mapData.boundaries.left,
        });
      }
      if (currentPos.x > mapData.boundaries.right) {
        player1Ref.current.setPosition({
          ...currentPos,
          x: mapData.boundaries.right,
        });
      }
      if (currentPos.y < mapData.boundaries.top) {
        player1Ref.current.setPosition({
          ...currentPos,
          y: mapData.boundaries.top,
        });
      }
      if (currentPos.y > mapData.boundaries.bottom) {
        player1Ref.current.setPosition({
          ...currentPos,
          y: mapData.boundaries.bottom,
        });
      }
    }

    // Vérifier les limites de la map pour player 2
    if (player2Ref.current) {
      const currentPos = player2Ref.current.getPosition();

      if (currentPos.x < mapData.boundaries.left) {
        player2Ref.current.setPosition({
          ...currentPos,
          x: mapData.boundaries.left,
        });
      }
      if (currentPos.x > mapData.boundaries.right) {
        player2Ref.current.setPosition({
          ...currentPos,
          x: mapData.boundaries.right,
        });
      }
      if (currentPos.y < mapData.boundaries.top) {
        player2Ref.current.setPosition({
          ...currentPos,
          y: mapData.boundaries.top,
        });
      }
      if (currentPos.y > mapData.boundaries.bottom) {
        player2Ref.current.setPosition({
          ...currentPos,
          y: mapData.boundaries.bottom,
        });
      }
    }

    // ===== VÉRIFICATION GÉNÉRALE DES COLLISIONS D'ATTAQUES =====

    // Joueur 1 attaque Joueur 2
    if (player1Attacking && !player2Hurt) {
      // Détecter les collisions normales
      let hitboxWidth = 30;

      // Élargir la hitbox pour les attaques spéciales
      if (
        player1AttackType === "powerAttack" ||
        player1AttackType === "ultimate" ||
        player1AttackType === "ultimateRush"
      ) {
        hitboxWidth = 10;
      }

      // Position de l'attaque basée sur la direction
      const attackX =
        player1Direction === "right"
          ? player1Position.x + 40
          : player1Position.x - hitboxWidth;

      // Vérifier si l'attaque touche
      if (
        Math.abs(attackX - player2Position.x) < hitboxWidth &&
        Math.abs(player1Position.y - player2Position.y) < 60
      ) {
        console.log(`Player 1 a touché Player 2 avec ${player1AttackType}!`);

        // Calculer les dégâts selon le type d'attaque
        let damage = 2; // Réduit de 5 à 2 (dégâts de base)

        if (player1AttackType === "powerAttack") damage = 8; // Réduit de 15 à 8
        else if (player1AttackType === "kickDown")
          damage = 6; // Réduit de 12 à 6
        else if (
          player1AttackType === "ultimate" ||
          player1AttackType === "ultimateRush"
        )
          damage = 10; // Réduit de 15 à 10

        // Appliquer les dégâts
        setPlayer2Health((prev) => Math.max(0, prev - damage));

        // Déclencher l'animation hurt
        setPlayer2Hurt(true);

        // Stun le joueur pendant 0.5 secondes
        player2Ref.current.stun(500);

        // Réinitialiser l'état hurt après l'animation
        setTimeout(() => {
          setPlayer2Hurt(false);
        }, 500);

        // Ajouter la classe damaged à la barre de vie du joueur 2
        const player2HealthBar = document.querySelector(
          ".health-bar-wrapper.player2"
        );
        player2HealthBar.classList.add("damaged");
        setTimeout(() => player2HealthBar.classList.remove("damaged"), 300);
      }
    }

    // Cas spécial pour la boule d'énergie de Naruto
    if (
      player1AttackType === "ultimateRush" &&
      player1Ref.current.isEnergyBallActive?.() &&
      !player2Hurt
    ) {
      // Position de la boule d'énergie
      const energyBallPos = player1Ref.current.getEnergyBallPosition?.();

      if (energyBallPos) {
        // Vérifier si la boule d'énergie touche le joueur 2
        if (
          Math.abs(energyBallPos.x - player2Position.x) < 70 &&
          Math.abs(energyBallPos.y - player2Position.y) < 80
        ) {
          console.log("Boule d'énergie de Naruto a touché Player 2!");

          // Appliquer les dégâts
          setPlayer2Health((prev) => Math.max(0, prev - 3));

          // Déclencher l'animation hurt
          setPlayer2Hurt(true);

          // Stun le joueur pendant 0.2 secondes (moins long car frappe continue)
          player2Ref.current.stun(200);

          // Réinitialiser l'état hurt après l'animation
          setTimeout(() => {
            setPlayer2Hurt(false);
          }, 200);

          // Ajouter la classe damaged à la barre de vie du joueur 2
          const player2HealthBar = document.querySelector(
            ".health-bar-wrapper.player2"
          );
          player2HealthBar.classList.add("damaged");
          setTimeout(() => player2HealthBar.classList.remove("damaged"), 300);
        }
      }
    }

    // Joueur 2 attaque Joueur 1
    if (player2Attacking && !player1Hurt) {
      // Détecter les collisions normales
      let hitboxWidth = 30;

      // Élargir la hitbox pour les attaques spéciales
      if (
        player2AttackType === "punch" ||
        player2AttackType === "ultimate" ||
        player2AttackType === "powerAttack"
      ) {
        hitboxWidth = 30;
      }

      // Position de l'attaque basée sur la direction
      const attackX =
        player2Direction === "right"
          ? player2Position.x + 40
          : player2Position.x - hitboxWidth;

      // Vérifier si l'attaque touche
      if (
        Math.abs(attackX - player1Position.x) < hitboxWidth &&
        Math.abs(player2Position.y - player1Position.y) < 60
      ) {
        console.log(`Player 2 a touché Player 1 avec ${player2AttackType}!`);

        // Calculer les dégâts selon le type d'attaque
        let damage = 2; // Réduit de 5 à 2 (dégâts de base)

        if (player2AttackType === "punch") damage = 8; // Réduit de 15 à 8
        else if (player2AttackType === "kickDown")
          damage = 6; // Réduit de 12 à 6
        else if (player2AttackType === "ultimate") damage = 10; // Réduit de 15 à 10

        // Appliquer les dégâts
        setPlayer1Health((prev) => Math.max(0, prev - damage));

        // Déclencher l'animation hurt
        setPlayer1Hurt(true);

        // Stun le joueur pendant 0.5 secondes ou plus pour l'ultime
        player1Ref.current.stun(player2AttackType === "ultimate" ? 800 : 500);

        // Réinitialiser l'état hurt après l'animation
        setTimeout(() => {
          setPlayer1Hurt(false);
        }, 500);

        // Ajouter la classe damaged à la barre de vie du joueur 1
        const player1HealthBar = document.querySelector(
          ".health-bar-wrapper.player1"
        );
        player1HealthBar.classList.add("damaged");
        setTimeout(() => player1HealthBar.classList.remove("damaged"), 300);
      }
    }
  }, [mapData.boundaries, player1Character, player2Character]);

  // Vérifier les collisions périodiquement
  useEffect(() => {
    if (isPaused) return;

    const collisionInterval = setInterval(checkCollisions, 100);

    return () => clearInterval(collisionInterval);
  }, [checkCollisions, isPaused]);

  // Lignes 185-206 - Modifier la gestion des positions initiales
  // Supprimer l'initialisation actuelle des états
  const [player1Position, setPlayer1Position] = useState(null);
  const [player2Position, setPlayer2Position] = useState(null);

  // Ajouter un useEffect pour calculer les positions en fonction de la map
  useEffect(() => {
    // Attendre que les éléments du DOM soient prêts
    setTimeout(() => {
      // Obtenir les dimensions de la fenêtre
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Récupérer l'élément de fond de la map
      const mapElement = document.querySelector(".game-background");

      if (mapElement) {
        // Obtenir les dimensions et position réelles de la map
        const mapRect = mapElement.getBoundingClientRect();

        console.log("Dimensions de la map:", mapRect);

        // Calculer les positions Y selon le type de map
        let p1Y, p2Y;

        if (mapData.mapName === "Naruto") {
          // Pour Konoha, placer les personnages près du bas de la map
          p1Y = mapRect.bottom - 100;
          p2Y = mapRect.bottom - 100;
        } else {
          // Pour les autres maps
          p1Y = mapRect.bottom - 120;
          p2Y = mapRect.bottom - 120;
        }

        // Calculer les positions X (un tiers et deux tiers de la largeur)
        const p1X = mapRect.left + mapRect.width / 3;
        const p2X = mapRect.left + (mapRect.width * 2) / 3;

        console.log(`Positions calculées pour ${mapData.mapName}:`, {
          p1: { x: p1X, y: p1Y },
          p2: { x: p2X, y: p2Y },
        });

        // Mettre à jour les positions
        setPlayer1Position({
          x: p1X,
          y: p1Y,
        });

        setPlayer2Position({
          x: p2X,
          y: p2Y,
        });

        // Mettre à jour les limites de la map en fonction de ses dimensions réelles
        if (mapData.boundaries) {
          mapData.boundaries = {
            left: mapRect.left + 10,
            right: mapRect.right - 10,
            top: mapRect.top + 10,
            bottom: mapRect.bottom - 10,
          };
        }
      } else {
        console.error("Élément de map non trouvé");

        // Position par défaut si la map n'est pas encore chargée
        setPlayer1Position({
          x: windowWidth / 2 - 300,
          y: windowHeight / 2 + 180,
        });

        setPlayer2Position({
          x: windowWidth / 2 + 300,
          y: windowHeight / 2 + 180,
        });
      }
    }, 100); // Attendre 100ms pour s'assurer que le DOM est prêt
  }, [mapData.mapName, mapData.boundaries]);

  // Ajouter une fonction pour obtenir la couleur en fonction de la santé
  const getHealthColor = (health) => {
    const percentage = (health / 500) * 100;
    if (percentage > 80) return "#4CAF50"; // Vert
    if (percentage > 60) return "#8BC34A"; // Vert clair
    if (percentage > 40) return "#FFEB3B"; // Jaune
    if (percentage > 20) return "#FF9800"; // Orange
    return "#F44336"; // Rouge
  };

  // Ajouter un useEffect pour gérer les cooldowns
  useEffect(() => {
    if (isPaused) return;

    // Récupérer les cooldowns depuis les composants de personnage
    const updateCooldowns = () => {
      if (player1Ref.current) {
        const cooldown = player1Ref.current.getUltimateCooldown?.();
        if (typeof cooldown === "number") {
          setPlayer1UltimateCooldown(cooldown);
        }
      }

      if (player2Ref.current) {
        const cooldown = player2Ref.current.getUltimateCooldown?.();
        if (typeof cooldown === "number") {
          setPlayer2UltimateCooldown(cooldown);
        }
      }
    };

    const cooldownInterval = setInterval(updateCooldowns, 100);

    return () => clearInterval(cooldownInterval);
  }, [isPaused]);

  return (
    <div className="versus-mode">
      {/* Background avec la map sélectionnée */}
      <div
        className="game-background"
        style={{
          backgroundImage: `url(${mapData.mapImage})`,
          backgroundPosition: "center",
          width: "1000px",
          height: "550px",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "0",
          border: "2px solid #444",
          zIndex: 0,
        }}
      />

      {/* Murs invisibles pour les limites de la map */}
      <div className="map-boundaries">
        <div className="wall wall-left" style={{ left: "calc(50% - 500px)" }} />
        <div
          className="wall wall-right"
          style={{ left: "calc(50% + 500px)" }}
        />
        <div className="wall wall-top" style={{ top: "calc(50% - 275px)" }} />
        <div
          className="wall wall-bottom"
          style={{ top: "calc(50% + 275px)" }}
        />
      </div>

      {/* Barres de vie des joueurs - Design amélioré */}
      <div
        className="health-bars-container"
        style={{
          position: "absolute",
          top: "80px", // Augmenter cette valeur pour descendre les barres
          left: "calc(50% - 450px)", // Centrer par rapport à la map
          right: "calc(50% - 450px)",
          width: "900px",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 500,
        }}
      >
        <div className="health-bar-wrapper player1">
          <div className="player-info">
            <div className="player-name">{player1Character}</div>
            <div className="player-number">P1</div>
          </div>
          <div
            className="health-bar"
            style={{
              width: "280px", // Un peu plus petit que les 300px actuels
              height: "25px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              border: "2px solid white",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              className="health-fill"
              style={{
                width: `${(player1Health / 500) * 100}%`,
                backgroundColor: getHealthColor(player1Health),
              }}
            ></div>
            <div className="health-value">
              {Math.floor((player1Health / 500) * 100)}%
            </div>
          </div>
        </div>

        <div className="health-bar-wrapper player2">
          <div className="player-info">
            <div className="player-name">{player2Character}</div>
            <div className="player-number">P2</div>
          </div>
          <div
            className="health-bar"
            style={{
              width: "280px", // Un peu plus petit que les 300px actuels
              height: "25px",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              border: "2px solid white",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              className="health-fill"
              style={{
                width: `${(player2Health / 500) * 100}%`,
                backgroundColor: getHealthColor(player2Health),
              }}
            ></div>
            <div className="health-value">
              {Math.floor((player2Health / 500) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs d'ultime */}
      <div
        className="ultimate-indicators"
        style={{
          position: "absolute",
          top: "140px" /* Positionné juste sous les barres de vie */,
          left: "calc(50% - 450px)",
          width: "900px",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 500,
        }}
      >
        <div className="ultimate-indicator player1">
          <div className="ultimate-icon">K</div>
          <div className="ultimate-bar-container">
            <div
              className="ultimate-bar-fill"
              style={{
                width: `${
                  player1UltimateCooldown <= 0
                    ? 100
                    : 100 - player1UltimateCooldown / 80
                }%`,
                backgroundColor:
                  player1UltimateCooldown <= 0 ? "#f7d51d" : "#555",
              }}
            ></div>
          </div>
          {player1UltimateCooldown <= 0 ? (
            <div className="ultimate-ready">PRÊT!</div>
          ) : (
            <div className="ultimate-cooldown">
              {Math.ceil(player1UltimateCooldown / 1000)}s
            </div>
          )}
        </div>

        <div className="ultimate-indicator player2">
          <div className="ultimate-icon">3</div>
          <div className="ultimate-bar-container">
            <div
              className="ultimate-bar-fill"
              style={{
                width: `${
                  player2UltimateCooldown <= 0
                    ? 100
                    : 100 - player2UltimateCooldown / 80
                }%`,
                backgroundColor:
                  player2UltimateCooldown <= 0 ? "#f7d51d" : "#555",
              }}
            ></div>
          </div>
          {player2UltimateCooldown <= 0 ? (
            <div className="ultimate-ready">PRÊT!</div>
          ) : (
            <div className="ultimate-cooldown">
              {Math.ceil(player2UltimateCooldown / 1000)}s
            </div>
          )}
        </div>
      </div>

      {/* Nom de la map */}
      <div className="map-name">
        <h2>{mapData.mapName}</h2>
      </div>

      {/* Personnages */}
      {player1Position && (
        <Character
          ref={player1Ref}
          character={player1Character}
          position={player1Position}
          controls={player1Controls}
          isPaused={isPaused}
          isHurt={player1Hurt}
        />
      )}
      {player2Position && (
        <Character
          ref={player2Ref}
          character={player2Character}
          position={player2Position}
          controls={player2Controls}
          isPaused={isPaused}
          isHurt={player2Hurt}
        />
      )}

      {/* Menu de pause */}
      {isPaused && (
        <div className="pause-menu">
          <h2>Pause</h2>
          <p>Appuyez sur Échap pour reprendre</p>
        </div>
      )}
    </div>
  );
};

export default VersusMode;
