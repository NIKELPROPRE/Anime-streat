import React, { forwardRef, useImperativeHandle, useRef } from "react";
import Naruto from "./Naruto";
import Luffy from "./Luffy";

// Composant adaptateur qui choisit le bon personnage en fonction du paramètre
const Character = forwardRef(
  ({ character, position, controls, isPaused, isHurt }, ref) => {
    // Créer des références pour les personnages
    const characterRef = useRef(null);

    // Exposer les méthodes nécessaires via ref
    useImperativeHandle(ref, () => ({
      getPosition: () => characterRef.current?.getPosition(),
      setPosition: (position) => characterRef.current?.setPosition(position),
      isAttacking: () => characterRef.current?.isAttacking(),
      isLastFrame: () => characterRef.current?.isLastFrame(),
      isAttackActive: () => characterRef.current?.isAttackActive(),
      getAttackType: () => characterRef.current?.getAttackType(),
      getDirection: () => characterRef.current?.getDirection(),
      stun: (duration) => characterRef.current?.stun(duration),
      isJumping: () => characterRef.current?.isJumping(),
      isEnergyBallActive: () => characterRef.current?.isEnergyBallActive(),
      getEnergyBallPosition: () =>
        characterRef.current?.getEnergyBallPosition(),
    }));

    // Générer un identifiant unique pour chaque instance de personnage
    const playerId = controls.LEFT === "q" ? "player1" : "player2";

    // Sélectionner le bon composant de personnage
    const renderCharacter = () => {
      console.log(`Rendering ${character} with hurt state: ${isHurt}`);

      switch (character.toLowerCase()) {
        case "naruto":
          return (
            <Naruto
              ref={characterRef}
              position={position}
              controls={controls}
              isPaused={isPaused}
              isHurt={isHurt}
              playerId={playerId}
            />
          );
        case "luffy":
          return (
            <Luffy
              ref={characterRef}
              position={position}
              controls={controls}
              isPaused={isPaused}
              isHurt={isHurt}
              playerId={playerId}
            />
          );
        default:
          return null;
      }
    };

    return renderCharacter();
  }
);

export default Character;
