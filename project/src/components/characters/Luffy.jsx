import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/characters/Luffy.css";

const Luffy = ({ position = { x: 100, y: 100 } }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isMoving, setIsMoving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const [direction, setDirection] = useState("right");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [stamina, setStamina] = useState(100); // Endurance initiale à 100%
  const animationRef = useRef(null);
  const moveSpeed = 3;
  const runSpeed = 6;
  const pressedKeys = useRef(new Set());
  const lastKeyPressTime = useRef(0);
  const DOUBLE_CLICK_DELAY = 300; // 300ms pour détecter un double clic
  const momentumRef = useRef(0);
  const FRICTION = 0.9; // Valeur de friction pour ralentir le personnage moins brusquement
  const attackTimeoutRef = useRef(null);
  const canAttackRef = useRef(true);
  const keyPressedRef = useRef(false);
  const previousStateRef = useRef({ isMoving: false, isRunning: false });
  const animationStateRef = useRef({ isAttacking: false, currentFrame: 0 });
  const attackEndRef = useRef(false);
  const wasMovingRef = useRef(false);
  const [jumpPhase, setJumpPhase] = useState("none");
  const [isJumping, setIsJumping] = useState(false);
  const [jumpHeight, setJumpHeight] = useState(0);
  const jumpSpeed = 8;
  const maxJumpHeight = 150;
  const gravity = 0.5;
  const jumpVelocityRef = useRef(0);
  const initialYRef = useRef(0); // Pour stocker la position Y initiale du saut
  const [isInAir, setIsInAir] = useState(false);
  const [verticalVelocity, setVerticalVelocity] = useState(0);
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const GROUND_Y = position.y; // Position Y initiale = sol
  const staminaIntervalRef = useRef(null);
  const staminaRegenIntervalRef = useRef(null);

  const frames = {
    idle: [
      { x: -13, y: -11, width: 30, height: 46 },
      { x: -62, y: -12, width: 31, height: 45 },
      { x: -108, y: -13, width: 32, height: 44 },
      { x: -157, y: -14, width: 33, height: 43 },
    ],
    walk: [
      { x: -244, y: -11, width: 38, height: 43 },
      { x: -296, y: -8, width: 28, height: 45 },
      { x: -337, y: -7, width: 34, height: 47 },
      { x: -384, y: -11, width: 33, height: 44 },
      { x: -433, y: -8, width: 26, height: 46 },
      { x: -474, y: -6, width: 33, height: 48 },
    ],
    run: [
      { x: -20, y: -82, width: 39, height: 40 },
      { x: -71, y: -83, width: 31, height: 39 },
      { x: -113, y: -82, width: 41, height: 41 },
      { x: -167, y: -84, width: 35, height: 41 },
      { x: -217, y: -81, width: 26, height: 43 },
      { x: -250, y: -79, width: 41, height: 45 },
    ],
    stop: [
      { x: -313, y: -81, width: 45, height: 39 },
      { x: -369, y: -80, width: 41, height: 39 },
    ],
    jump: [
      { x: -18, y: -158, width: 31, height: 42 }, // Préparation saut
      { x: -66, y: -148, width: 30, height: 51 }, // Saut
      { x: -109, y: -145, width: 34, height: 55 }, // Saut
      { x: -154, y: -144, width: 34, height: 55 }, // Saut
      { x: -201, y: -145, width: 32, height: 55 }, // Saut
      { x: -245, y: -147, width: 31, height: 48 }, // Descente
      { x: -291, y: -149, width: 32, height: 47 }, // Descente
      { x: -339, y: -149, width: 32, height: 49 }, // Descente
      { x: -384, y: -148, width: 32, height: 51 }, // Descente
      { x: -432, y: -148, width: 31, height: 52 }, // Descente
      { x: -475, y: -149, width: 31, height: 52 }, // Descente
    ],
    attack: [
      { x: -457, y: -82, width: 32, height: 37 },
      { x: -502, y: -69, width: 35, height: 51 },
      { x: -549, y: -75, width: 41, height: 40 },
      { x: -601, y: -71, width: 50, height: 43 },
      { x: -661, y: -74, width: 60, height: 37 },
      { x: -729, y: -69, width: 35, height: 43 },
    ],
  };

  const updatePosition = useCallback(() => {
    const speed = isRunning ? runSpeed : moveSpeed;

    if (pressedKeys.current.has("ArrowRight")) {
      setDirection("right");
      setCurrentPosition((prev) => ({ ...prev, x: prev.x + speed }));
      setIsMoving(true);
      setIsStopping(false);
      momentumRef.current = speed; // Utiliser une vitesse normale
    } else if (pressedKeys.current.has("ArrowLeft")) {
      setDirection("left");
      setCurrentPosition((prev) => ({ ...prev, x: prev.x - speed }));
      setIsMoving(true);
      setIsStopping(false);
      momentumRef.current = -speed; // Utiliser une vitesse normale
    } else if (isRunning) {
      setIsStopping(true);
      setIsMoving(false);
      // Appliquer le freinage progressif
      momentumRef.current *= FRICTION; // Réduire la vitesse par la friction
      setCurrentPosition((prev) => ({
        ...prev,
        x: prev.x + momentumRef.current, // Déplacer le personnage avec la vitesse actuelle
      }));

      // Arrêter complètement quand la vitesse est très faible
      if (Math.abs(momentumRef.current) < 0.1) {
        momentumRef.current = 0; // Arrêter complètement si la vitesse est très faible
        setIsStopping(false);
        setIsRunning(false);
        setCurrentFrame(0); // Réinitialiser le frame pour revenir à l'idle
      }
    } else {
      setIsMoving(false);
      setIsRunning(false);
      setIsStopping(false);
      momentumRef.current = 0;
    }
  }, [isRunning]);

  useEffect(() => {
    let gravityInterval;

    const applyGravity = () => {
      if (isInAir) {
        setVerticalVelocity((prev) => prev + GRAVITY);
        setCurrentPosition((prev) => {
          const newY = prev.y + verticalVelocity;

          // Si on touche le sol
          if (newY >= GROUND_Y) {
            setIsInAir(false);
            setVerticalVelocity(0);
            setIsJumping(false);
            setCurrentFrame(0);
            return { ...prev, y: GROUND_Y };
          }

          // Animation basée sur la direction du mouvement
          if (verticalVelocity < 0) {
            // Montée
            setCurrentFrame((prev) => Math.min(prev + 1, 4));
          } else {
            // Descente - on utilise les frames 5 à 10 progressivement
            const descentFrame = Math.min(
              Math.floor((verticalVelocity / 10) * 5) + 5,
              10
            );
            setCurrentFrame(descentFrame);
          }

          return { ...prev, y: newY };
        });
      }
    };

    gravityInterval = setInterval(applyGravity, 16);
    return () => clearInterval(gravityInterval);
  }, [isInAir, verticalVelocity]);

  useEffect(() => {
    let animationInterval;
    let moveInterval;

    const updateAnimation = () => {
      let currentFrames;
      let animationSpeed;

      if (isAttacking) {
        currentFrames = frames.attack;
        animationSpeed = 100; // Vitesse d'animation pour l'attaque
        if (currentFrame >= currentFrames.length - 1) {
          setIsAttacking(false);
          canAttackRef.current = true;

          // Vérifier si aucune touche n'est pressée pour retourner à idle
          if (!isMoving && !isRunning && !isInAir) {
            setCurrentFrame(0); // Réinitialiser le frame pour l'animation idle
          } else {
            // Ne rien faire, rester dans l'état d'attaque
            setCurrentFrame(currentFrame); // Rester sur le dernier frame d'attaque
          }
          return 100;
        }
        setCurrentFrame((prev) => prev + 1);
      } else if (isStopping) {
        // Appliquer la friction
        momentumRef.current *= FRICTION; // Réduire la vitesse par la friction
        setCurrentPosition((prev) => ({
          ...prev,
          x: prev.x + momentumRef.current, // Déplacer le personnage avec la vitesse actuelle
        }));

        // Ralentir l'animation de stop
        currentFrames = frames.stop;
        animationSpeed = 200; // Ralentir l'animation de stop pour la rendre plus visible

        if (Math.abs(momentumRef.current) < 0.1) {
          momentumRef.current = 0; // Arrêter complètement si la vitesse est très faible
          setIsStopping(false);
          setIsRunning(false);
          setCurrentFrame(0); // Réinitialiser le frame pour revenir à l'idle
        } else {
          setCurrentFrame((prev) => (prev + 1) % currentFrames.length); // Incrémenter le frame de l'animation de stop
        }
      } else if (isInAir) {
        // Gestion de l'animation en l'air
        if (verticalVelocity < 0) {
          // Montée
          setCurrentFrame((prev) => Math.min(prev + 1, 4));
        } else {
          // Descente
          const descentFrame = Math.min(
            Math.floor((verticalVelocity / 10) * 5) + 5,
            10
          );
          setCurrentFrame(descentFrame);
        }
        return 100;
      } else {
        // État par défaut (idle)
        currentFrames = isRunning
          ? frames.run
          : isMoving
          ? frames.walk
          : frames.idle;
        animationSpeed = isRunning ? 50 : 100;
        setCurrentFrame((prev) => (prev + 1) % currentFrames.length);
      }

      return animationSpeed;
    };

    const animationSpeed = updateAnimation();
    animationInterval = setInterval(updateAnimation, animationSpeed);
    moveInterval = setInterval(updatePosition, 16);

    return () => {
      if (animationInterval) clearInterval(animationInterval);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [
    isMoving,
    isRunning,
    isStopping,
    isAttacking,
    isInAir,
    updatePosition,
    verticalVelocity,
  ]);

  // Gestion de l'endurance
  useEffect(() => {
    if (isRunning) {
      // Diminution de l'endurance pendant la course
      staminaIntervalRef.current = setInterval(() => {
        setStamina((prev) => {
          if (prev <= 0) {
            setIsRunning(false);
            setIsStopping(true);
            return 0;
          }
          return prev - 2; // Diminue plus rapidement
        });
      }, 50); // Diminue toutes les 50ms

      // Arrêter la régénération si elle était active
      if (staminaRegenIntervalRef.current) {
        clearInterval(staminaRegenIntervalRef.current);
      }
    } else if (stamina < 100) {
      // Régénération de l'endurance quand on ne court pas
      staminaRegenIntervalRef.current = setInterval(() => {
        setStamina((prev) => {
          if (prev >= 100) {
            clearInterval(staminaRegenIntervalRef.current);
            return 100;
          }
          return prev + 1;
        });
      }, 200); // Régénère plus lentement
    }

    return () => {
      if (staminaIntervalRef.current) clearInterval(staminaIntervalRef.current);
      if (staminaRegenIntervalRef.current)
        clearInterval(staminaRegenIntervalRef.current);
    };
  }, [isRunning, stamina]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const currentTime = Date.now();

      if (key === "ArrowUp" && !isInAir && !isAttacking) {
        setIsInAir(true);
        setIsJumping(true);
        setVerticalVelocity(JUMP_FORCE);
        setCurrentFrame(1);
      } else if (key === "ArrowRight" || key === "ArrowLeft") {
        if (
          currentTime - lastKeyPressTime.current < DOUBLE_CLICK_DELAY &&
          stamina > 20
        ) {
          setIsRunning(true);
        }
        lastKeyPressTime.current = currentTime;
        pressedKeys.current.add(key);
      } else if (
        key === "1" &&
        canAttackRef.current &&
        !isAttacking &&
        !isInAir
      ) {
        setIsMoving(false);
        setIsRunning(false);
        setIsStopping(false);
        setIsAttacking(true);
        canAttackRef.current = false;
        setCurrentFrame(0);
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      if (key === "ArrowRight" || key === "ArrowLeft") {
        pressedKeys.current.delete(key);
        if (isRunning) {
          setIsStopping(true);
          setCurrentFrame(0); // Réinitialiser le frame pour l'animation de stop
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAttacking, isInAir, isRunning, stamina]);

  const currentFrames = isAttacking
    ? frames.attack
    : isJumping
    ? frames.jump
    : isStopping
    ? frames.stop
    : isRunning
    ? frames.run
    : isMoving
    ? frames.walk
    : frames.idle;
  const currentSprite = currentFrames[currentFrame] || currentFrames[0];

  return (
    <>
      <div
        className={`luffy-sprite ${direction === "left" ? "flip" : ""}`}
        style={{
          left: `${currentPosition.x}px`,
          top: `${currentPosition.y}px`,
          backgroundPosition: `${currentSprite.x}px ${currentSprite.y}px`,
          width: `${currentSprite.width}px`,
          height: `${currentSprite.height}px`,
        }}
      />
      <div
        className="stamina-bar"
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "200px",
          height: "20px",
          backgroundColor: "#333",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${stamina}%`,
            height: "100%",
            backgroundColor: stamina > 30 ? "#4CAF50" : "#FF5722",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </>
  );
};

export default React.memo(Luffy);
