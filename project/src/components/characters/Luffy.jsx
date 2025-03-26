import React, { useState, useEffect, useCallback, useRef } from "react";
import "../../styles/characters/Luffy.css";

const Luffy = ({ position = { x: 100, y: 100 } }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState("right");
  const frameRef = useRef(0);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(0);

  const frames = {
    idle: [
      { x: -13, y: -11, width: 30, height: 46 },
      { x: -62, y: -12, width: 31, height: 45 },
      { x: -108, y: -13, width: 32, height: 44 },
      { x: -108, y: -13, width: 32, height: 44 },
    ],
    walk: [
      { x: -244, y: -11, width: 38, height: 43 },
      { x: -296, y: -8, width: 28, height: 45 },
      { x: -337, y: -7, width: 34, height: 47 },
      { x: -384, y: -11, width: 33, height: 44 },
      { x: -433, y: -8, width: 26, height: 46 },
      { x: -474, y: -6, width: 33, height: 48 },
    ],
  };

  const moveCharacter = useCallback((direction) => {
    setDirection(direction);
    setIsMoving(true);
    setCurrentPosition((prev) => ({
      ...prev,
      x: direction === "right" ? prev.x + 5 : prev.x - 5,
    }));
  }, []);

  const animate = useCallback(
    (timestamp) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= 100) {
        const currentFrames = isMoving ? frames.walk : frames.idle;
        frameRef.current = (frameRef.current + 1) % currentFrames.length;
        lastUpdateRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isMoving]
  );

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "d") {
        moveCharacter("right");
      } else if (key === "q") {
        moveCharacter("left");
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === "d" || key === "q") {
        setIsMoving(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [moveCharacter]);

  const currentSprite = isMoving
    ? frames.walk[frameRef.current]
    : frames.idle[frameRef.current];

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
