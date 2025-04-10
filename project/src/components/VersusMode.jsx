import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Character from "./characters/Character";
import "../styles/VersusMode.css";

const VersusMode = () => {
  const location = useLocation();
  const mapData = location.state || {
    mapId: 1,
    mapName: "One Piece",
    mapImage:
      mapData.mapName === "Hunter x Hunter"
        ? "../../Map/JS-HunterXHunter.png"
        : mapData.mapName === "Naruto"
        ? "../../Map/konoha.jpg"
        : "../../Map/Onepiece.png",
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
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const navigate = useNavigate();

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

    // ===== SYSTÈME DE HITBOX AMÉLIORÉ =====

    // Configuration des hitbox et dégâts pour les différentes attaques
    const attackConfig = {
      normal: { width: 40, height: 60, damage: 5, stunTime: 300 },
      punch: { width: 45, height: 65, damage: 10, stunTime: 400 },
      powerAttack: { width: 60, height: 70, damage: 20, stunTime: 600 },
      kickDown: { width: 50, height: 70, damage: 15, stunTime: 500 },
      rushAttack: { width: 55, height: 60, damage: 12, stunTime: 350 },
      downAttack: { width: 50, height: 40, damage: 12, stunTime: 400 },
      upAttack: { width: 45, height: 80, damage: 12, stunTime: 350 },
      airAttack: { width: 55, height: 60, damage: 15, stunTime: 450 },
      ultimateCharge: { width: 60, height: 70, damage: 5, stunTime: 300 },
      ultimateRush: { width: 70, height: 70, damage: 25, stunTime: 700 },
    };

    // === JOUEUR 1 ATTAQUE JOUEUR 2 ===
    if (player1Attacking && !player2Hurt) {
      // Récupérer la configuration de l'attaque actuelle
      const attack = attackConfig[player1AttackType] || attackConfig.normal;

      // Calculer la position de la hitbox en fonction de la direction
      const hitboxOffsetX = player1Direction === "right" ? 40 : -attack.width;

      // Créer la hitbox
      const attackHitbox = {
        x: player1Position.x + hitboxOffsetX,
        y: player1Position.y - attack.height / 2,
        width: attack.width,
        height: attack.height,
      };

      // Créer la hitbox du joueur 2
      const player2Hitbox = {
        x: player2Position.x - 25,
        y: player2Position.y - 60,
        width: 50,
        height: 80,
      };

      // Vérifier si l'attaque touche (collision AABB)
      if (
        attackHitbox.x < player2Hitbox.x + player2Hitbox.width &&
        attackHitbox.x + attackHitbox.width > player2Hitbox.x &&
        attackHitbox.y < player2Hitbox.y + player2Hitbox.height &&
        attackHitbox.y + attackHitbox.height > player2Hitbox.y
      ) {
        console.log(`Player 1 a touché Player 2 avec ${player1AttackType}!`);

        // Appliquer les dégâts
        setPlayer2Health((prev) => Math.max(0, prev - attack.damage));

        // Déclencher l'animation hurt
        setPlayer2Hurt(true);

        // Stun le joueur
        player2Ref.current.stun(attack.stunTime);

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
      const energyBallPos = player1Ref.current.getEnergyBallPosition?.();

      if (energyBallPos) {
        // Hitbox plus précise pour la boule d'énergie
        const energyBallHitbox = {
          x: energyBallPos.x - 40,
          y: energyBallPos.y - 40,
          width: 80,
          height: 80,
        };

        // Hitbox du joueur 2
        const player2Hitbox = {
          x: player2Position.x - 25,
          y: player2Position.y - 60,
          width: 50,
          height: 80,
        };

        // Vérifier collision
        if (
          energyBallHitbox.x < player2Hitbox.x + player2Hitbox.width &&
          energyBallHitbox.x + energyBallHitbox.width > player2Hitbox.x &&
          energyBallHitbox.y < player2Hitbox.y + player2Hitbox.height &&
          energyBallHitbox.y + energyBallHitbox.height > player2Hitbox.y
        ) {
          console.log("Boule d'énergie de Naruto a touché Player 2!");

          // Dégâts de la boule d'énergie (plus forts)
          setPlayer2Health((prev) => Math.max(0, prev - 8));

          // Effet visuel et stun plus court
          setPlayer2Hurt(true);
          player2Ref.current.stun(250);

          setTimeout(() => {
            setPlayer2Hurt(false);
          }, 200);

          const player2HealthBar = document.querySelector(
            ".health-bar-wrapper.player2"
          );
          player2HealthBar.classList.add("damaged");
          setTimeout(() => player2HealthBar.classList.remove("damaged"), 300);
        }
      }
    }

    // === JOUEUR 2 ATTAQUE JOUEUR 1 ===
    if (player2Attacking && !player1Hurt) {
      // Récupérer la configuration de l'attaque actuelle
      const attack = attackConfig[player2AttackType] || attackConfig.normal;

      // Calculer la position de la hitbox en fonction de la direction
      const hitboxOffsetX = player2Direction === "right" ? 40 : -attack.width;

      // Créer la hitbox
      const attackHitbox = {
        x: player2Position.x + hitboxOffsetX,
        y: player2Position.y - attack.height / 2,
        width: attack.width,
        height: attack.height,
      };

      // Créer la hitbox du joueur 1
      const player1Hitbox = {
        x: player1Position.x - 25,
        y: player1Position.y - 60,
        width: 50,
        height: 80,
      };

      // Vérifier si l'attaque touche (collision AABB)
      if (
        attackHitbox.x < player1Hitbox.x + player1Hitbox.width &&
        attackHitbox.x + attackHitbox.width > player1Hitbox.x &&
        attackHitbox.y < player1Hitbox.y + player1Hitbox.height &&
        attackHitbox.y + attackHitbox.height > player1Hitbox.y
      ) {
        console.log(`Player 2 a touché Player 1 avec ${player2AttackType}!`);

        // Appliquer les dégâts
        setPlayer1Health((prev) => Math.max(0, prev - attack.damage));

        // Déclencher l'animation hurt
        setPlayer1Hurt(true);

        // Stun le joueur
        player1Ref.current.stun(attack.stunTime);

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
    setTimeout(() => {
      const mapElement = document.querySelector(".game-background");

      if (mapElement) {
        const mapRect = mapElement.getBoundingClientRect();
        console.log("Dimensions de la map:", mapRect);

        let p1X, p2X, p1Y, p2Y;

        if (mapData.mapName === "Hunter x Hunter") {
          // Utiliser les dimensions spécifiques pour HxH
          p1X = mapData.boundaries.left + 150; // Position à gauche
          p2X = mapData.boundaries.right - 150; // Position à droite
          p1Y = mapData.boundaries.bottom - 80; // Position en bas
          p2Y = mapData.boundaries.bottom - 80;
        } else if (mapData.mapName === "Naruto") {
          // Pour Konoha, placer les personnages près du bas
          p1X = mapRect.left + mapRect.width / 3;
          p2X = mapRect.left + (mapRect.width * 2) / 3;
          p1Y = mapRect.bottom - 100;
          p2Y = mapRect.bottom - 100;
        } else {
          // Pour les autres maps
          p1X = mapRect.left + mapRect.width / 3;
          p2X = mapRect.left + (mapRect.width * 2) / 3;
          p1Y = mapRect.bottom - 120;
          p2Y = mapRect.bottom - 120;
        }

        console.log(`Positions calculées pour ${mapData.mapName}:`, {
          p1: { x: p1X, y: p1Y },
          p2: { x: p2X, y: p2Y },
        });

        setPlayer1Position({ x: p1X, y: p1Y });
        setPlayer2Position({ x: p2X, y: p2Y });
      }
    }, 100);
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
      try {
        if (
          player1Ref.current &&
          typeof player1Ref.current.getUltimateCooldown === "function"
        ) {
          const cooldown = player1Ref.current.getUltimateCooldown();
          if (typeof cooldown === "number") {
            setPlayer1UltimateCooldown(cooldown);
          }
        }

        if (
          player2Ref.current &&
          typeof player2Ref.current.getUltimateCooldown === "function"
        ) {
          const cooldown = player2Ref.current.getUltimateCooldown();
          if (typeof cooldown === "number") {
            setPlayer2UltimateCooldown(cooldown);
          }
        }

        console.log("Cooldown P1:", player1UltimateCooldown);
        console.log("Cooldown P2:", player2UltimateCooldown);
        console.log("P2 ref exists:", !!player2Ref.current);
        console.log(
          "P2 method exists:",
          !!(player2Ref.current && player2Ref.current.getUltimateCooldown)
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour des cooldowns:", error);
      }
    };

    const cooldownInterval = setInterval(updateCooldowns, 100);

    return () => clearInterval(cooldownInterval);
  }, [isPaused]);

  // Ajouter cet useEffect pour la musique de fond
  useEffect(() => {
    // Créer un nouvel élément audio
    const backgroundMusic = new Audio(
      "/Sound/Most Epic Anime OST - Requiem Aranea! (2).mp3"
    );
    backgroundMusic.volume = 0.3; // Volume à 30%
    backgroundMusic.loop = true; // En boucle

    // Jouer la musique
    backgroundMusic.play().catch((error) => {
      console.log("Autoplay empêché par le navigateur:", error);
    });

    // Pause/reprise en fonction de l'état du jeu
    if (isPaused) {
      backgroundMusic.pause();
    } else {
      backgroundMusic.play().catch((e) => console.log(e));
    }

    // Nettoyer lors du démontage du composant
    return () => {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    };
  }, [isPaused]);

  // Ajoutez cette fonction pour vérifier la fin du jeu (vers ligne 150)
  const checkGameOver = useCallback(() => {
    if (player1Health <= 0) {
      setGameOver(true);
      setWinner(player2Character);
      // Retourner à la sélection des personnages après 5 secondes
      setTimeout(() => {
        navigate("/character-selection");
      }, 5000);
    } else if (player2Health <= 0) {
      setGameOver(true);
      setWinner(player1Character);
      // Retourner à la sélection des personnages après 5 secondes
      setTimeout(() => {
        navigate("/character-selection");
      }, 5000);
    }
  }, [
    player1Health,
    player2Health,
    player1Character,
    player2Character,
    navigate,
  ]);

  // Ajoutez cet useEffect pour vérifier la fin du jeu (vers ligne 220)
  useEffect(() => {
    checkGameOver();
  }, [player1Health, player2Health, checkGameOver]);

  return (
    <div className="versus-mode">
      {/* Background avec la map sélectionnée */}
      <div
        className="game-background"
        style={{
          background:
            mapData.mapName === "Hunter x Hunter"
              ? "url('/Map/JS-HunterXHunter.png') no-repeat 0 0"
              : `url(${mapData.mapImage})`,
          width: mapData.mapName === "Hunter x Hunter" ? "516px" : "1000px",
          height: mapData.mapName === "Hunter x Hunter" ? "484px" : "550px",
          backgroundSize:
            mapData.mapName === "Hunter x Hunter" ? "auto" : "cover",
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
          top: "140px" /* Descendre sous les barres de vie */,
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
                    : 100 - (player1UltimateCooldown / 30000) * 100
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
                    : 100 - (player2UltimateCooldown / 30000) * 100
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

      {gameOver && (
        <div className="winner-announcement">
          <h1 className="winner-text">
            {winner === player1Character ? player1Character : player2Character}{" "}
            GAGNE !
          </h1>
        </div>
      )}
    </div>
  );
};

export default VersusMode;
