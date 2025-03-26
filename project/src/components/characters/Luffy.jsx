import React, { useState, useEffect, useRef } from "react";
import "../../styles/characters/Luffy.css";

const Luffy = ({ position = { x: 100, y: 100 } }) => {
  const [currentPosition, setCurrentPosition] = useState(position);
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState("right");
  const frameRef = useRef(0);
  const animationRef = useRef(null);

  const idleFrames = [
    { x: -13, y: -11, width: 30, height: 46 },
    { x: -62, y: -12, width: 31, height: 45 },
    { x: -108, y: -13, width: 32, height: 44 },
    { x: -108, y: -13, width: 32, height: 44 },
  ];

  const walkFrames = [
    { x: -244, y: -11, width: 38, height: 43 },
    { x: -296, y: -8, width: 28, height: 45 },
    { x: -337, y: -7, width: 34, height: 47 },
    { x: -384, y: -11, width: 33, height: 44 },
    { x: -433, y: -8, width: 26, height: 46 },
    { x: -474, y: -6, width: 33, height: 48 },
  ];

  const animate = () => {
    const frames = isMoving ? walkFrames : idleFrames;
    frameRef.current = (frameRef.current + 1) % frames.length;
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case "d":
          setDirection("right");
          setIsMoving(true);
          setCurrentPosition((prev) => ({ ...prev, x: prev.x + 5 }));
          break;
        case "q":
          setDirection("left");
          setIsMoving(true);
          setCurrentPosition((prev) => ({ ...prev, x: prev.x - 5 }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case "d":
        case "q":
          setIsMoving(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const currentSprite = isMoving
    ? walkFrames[frameRef.current]
    : idleFrames[frameRef.current];

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

export default Luffy;
