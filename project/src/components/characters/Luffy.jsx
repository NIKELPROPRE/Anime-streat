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
  const animationRef = useRef(null);
  const moveSpeed = 3;
  const runSpeed = 6;
  const pressedKeys = useRef(new Set());
  const lastKeyPressTime = useRef(0);
  const DOUBLE_CLICK_DELAY = 300; // 300ms pour détecter un double clic
  const momentumRef = useRef(0);
  const FRICTION = 0.95; // Facteur de friction pour le freinage
  const attackTimeoutRef = useRef(null);
  const canAttackRef = useRef(true);
  const keyPressedRef = useRef(false);
  const previousStateRef = useRef({ isMoving: false, isRunning: false });
  const animationStateRef = useRef({ isAttacking: false, currentFrame: 0 });
  const attackEndRef = useRef(false);

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
      momentumRef.current = speed;
    } else if (pressedKeys.current.has("ArrowLeft")) {
      setDirection("left");
      setCurrentPosition((prev) => ({ ...prev, x: prev.x - speed }));
      setIsMoving(true);
      setIsStopping(false);
      momentumRef.current = -speed;
    } else if (isRunning) {
      setIsStopping(true);
      setIsMoving(false);
      // Appliquer le freinage progressif
      const momentum = momentumRef.current * FRICTION;
      setCurrentPosition((prev) => ({ ...prev, x: prev.x + momentum }));
      momentumRef.current = momentum;

      // Arrêter complètement quand la vitesse est très faible
      if (Math.abs(momentum) < 0.1) {
        setIsStopping(false);
        setIsRunning(false);
        momentumRef.current = 0;
      }
    } else {
      setIsMoving(false);
      setIsRunning(false);
      setIsStopping(false);
      momentumRef.current = 0;
    }
  }, [isRunning]);

  useEffect(() => {
    let animationInterval;
    let moveInterval;

    const updateAnimation = () => {
      let currentFrames;
      let animationSpeed;

      if (isAttacking) {
        currentFrames = frames.attack;
        animationSpeed = 100;
        if (currentFrame >= currentFrames.length - 1) {
          setIsAttacking(false);
          setCurrentFrame(0);
          canAttackRef.current = true;
          attackEndRef.current = true;
          return;
        }
        setCurrentFrame((prev) => prev + 1);
      } else if (isStopping) {
        currentFrames = frames.stop;
        animationSpeed = 200;
        if (currentFrame >= currentFrames.length - 1) {
          setTimeout(() => {
            setIsStopping(false);
            setIsRunning(false);
            setCurrentFrame(0);
          }, 500);
          return;
        }
        setCurrentFrame((prev) => (prev + 1) % currentFrames.length);
      } else {
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
  }, [isMoving, isRunning, isStopping, isAttacking, updatePosition]);

  // Effet pour gérer la fin de l'attaque
  useEffect(() => {
    if (attackEndRef.current) {
      // Forcer le retour à l'état immobile
      setIsMoving(false);
      setIsRunning(false);
      setIsStopping(false);
      setCurrentFrame(0);

      // Réinitialiser la référence
      attackEndRef.current = false;
    }
  }, [attackEndRef.current]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const currentTime = Date.now();

      if (key === "ArrowRight" || key === "ArrowLeft") {
        if (currentTime - lastKeyPressTime.current < DOUBLE_CLICK_DELAY) {
          setIsRunning(true);
        }
        lastKeyPressTime.current = currentTime;
        pressedKeys.current.add(key);
      } else if (
        key === "1" &&
        canAttackRef.current &&
        !keyPressedRef.current
      ) {
        setIsAttacking(true);
        setCurrentFrame(0);
        canAttackRef.current = false;
        keyPressedRef.current = true;
        attackEndRef.current = false;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key;
      if (key === "ArrowRight" || key === "ArrowLeft") {
        pressedKeys.current.delete(key);
      } else if (key === "1") {
        keyPressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isAttacking, isMoving, isRunning]);

  const currentFrames = isAttacking
    ? frames.attack
    : isStopping
    ? frames.stop
    : isRunning
    ? frames.run
    : isMoving
    ? frames.walk
    : frames.idle;
  const currentSprite = currentFrames[currentFrame] || currentFrames[0];

  return (
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
  );
};

export default React.memo(Luffy);
