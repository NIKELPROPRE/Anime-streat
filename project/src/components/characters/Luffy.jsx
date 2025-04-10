import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../../styles/characters/Luffy.css";
import UltimateSound from "/Sound/Gomu Gomu No Bazooka sound effect - No Copyright sound for your videos.mp3";
import UltimateImage from "/Image_perso/bazooka.jpg";

const Luffy = forwardRef(
  (
    { position = { x: 100, y: 400 }, isPaused, controls, playerId, isHurt },
    ref
  ) => {
    const [posX, setPosX] = useState(position.x);
    const [posY, setPosY] = useState(position.y);
    const [currentPosition, setCurrentPosition] = useState(position);
    const [isMoving, setIsMoving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isAttacking, setIsAttacking] = useState(false);
    const [direction, setDirection] = useState("right");
    const [currentFrame, setCurrentFrame] = useState(0);
    const [stamina, setStamina] = useState(100); // Endurance initiale à 100%
    const [attackCooldown, setAttackCooldown] = useState(0); // Cooldown d'attaque
    const animationRef = useRef(null);
    const moveSpeed = 3;
    const runSpeed = 6;
    const pressedKeys = useRef(new Set());
    const lastKeyPressTime = useRef(0);
    const DOUBLE_CLICK_DELAY = 300; // 300ms pour détecter un double clic
    const momentumRef = useRef(0);
    const FRICTION = 0.9; // Valeur de friction pour ralentir le personnage moins brusquement
    const gravity = 0.5;
    const GROUND_Y = position.y; // Position Y initiale = sol
    const [jumpPhase, setJumpPhase] = useState("none");
    const [isJumping, setIsJumping] = useState(false);
    const [jumpHeight, setJumpHeight] = useState(0);
    const jumpSpeed = 8;
    const maxJumpHeight = 80;
    const GRAVITY = 0.4; // Réduire de 0.6 à 0.4 pour ralentir la chute
    const JUMP_FORCE = -12; // Augmenter de -10 à -12 pour un saut plus haut
    const initialYRef = useRef(0); // Pour stocker la position Y initiale du saut
    const [isInAir, setIsInAir] = useState(false);
    const [verticalVelocity, setVerticalVelocity] = useState(0);
    const staminaIntervalRef = useRef(null);
    const staminaRegenIntervalRef = useRef(null);
    const [attackType, setAttackType] = useState("normal"); // "normal", "punch", "kickDown", "ultimate"
    const [attackLandedOnGround, setAttackLandedOnGround] = useState(false);
    const [ultimateCooldown, setUltimateCooldown] = useState(0);
    const [showUltimateOverlay, setShowUltimateOverlay] = useState(false);
    const [ultimateAudio, setUltimateAudio] = useState(null);
    const [energyBallActive, setEnergyBallActive] = useState(false);
    const [energyBallPosition, setEnergyBallPosition] = useState({
      x: 0,
      y: 0,
    });
    const [energyBallFrame, setEnergyBallFrame] = useState(0);
    const [isExecutingUltimate, setIsExecutingUltimate] = useState(false);
    const [isStunned, setIsStunned] = useState(false);
    const [stunTimeout, setStunTimeout] = useState(null);
    const [ultimateBar, setUltimateBar] = useState(0);
    const ultimateBarRef = useRef(null);

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
      airAttack: [
        { x: -500, y: -68, width: 38, height: 53 },
        { x: -547, y: -74, width: 45, height: 42 },
        { x: -600, y: -69, width: 52, height: 46 },
        { x: -659, y: -73, width: 64, height: 39 },
        { x: -728, y: -67, width: 38, height: 46 }, // Frame de retombée
      ],
      hurt: [
        { x: -42, y: -3153, width: 32, height: 48 },
        { x: -89, y: -3157, width: 38, height: 44 },
        { x: -137, y: -3155, width: 47, height: 44 },
      ],
      punch: [
        { x: -11, y: -1726, width: 37, height: 44 },
        { x: -374, y: -1723, width: 38, height: 47 },
        { x: -421, y: -1722, width: 46, height: 49 },
        { x: -503, y: -1718, width: 62, height: 49 },
        { x: -582, y: -1718, width: 46, height: 49 },
        { x: -647, y: -1719, width: 38, height: 48 },
        { x: -703, y: -1723, width: 37, height: 44 },
      ],
      kickDown: [
        { x: -17, y: -303, width: 29, height: 45 },
        { x: -58, y: -307, width: 29, height: 37 },
        { x: -98, y: -304, width: 28, height: 41 },
        { x: -141, y: -296, width: 30, height: 59 },
        { x: -176, y: -299, width: 32, height: 71 },
        { x: -215, y: -303, width: 35, height: 90 },
        { x: -262, y: -301, width: 36, height: 114 },
        { x: -317, y: -293, width: 31, height: 59 },
        { x: -370, y: -293, width: 29, height: 63 },
        { x: -418, y: -293, width: 42, height: 36 },
        { x: -472, y: -296, width: 46, height: 28 },
        { x: -532, y: -300, width: 53, height: 26 },
        { x: -596, y: -295, width: 51, height: 32 },
        { x: -656, y: -294, width: 34, height: 50 },
      ],
      ultimate: [
        { x: -17, y: -2525, width: 25, height: 45 },
        { x: -66, y: -2523, width: 37, height: 49 },
        { x: -121, y: -2523, width: 37, height: 50 },
        { x: -167, y: -2521, width: 52, height: 51 },
        { x: -232, y: -2523, width: 86, height: 49 },
        { x: -333, y: -2526, width: 110, height: 47 },
        { x: -454, y: -2522, width: 86, height: 49 },
        { x: -550, y: -2525, width: 40, height: 46 },
        { x: -602, y: -2526, width: 41, height: 45 },
        { x: -657, y: -2530, width: 48, height: 41 },
        { x: -717, y: -2525, width: 37, height: 45 },
      ],
      ultimateCharge: [
        { x: -17, y: -2525, width: 25, height: 45 },
        { x: -66, y: -2523, width: 37, height: 49 },
        { x: -121, y: -2523, width: 37, height: 50 },
      ],
      ultimateRush: [
        { x: -167, y: -2521, width: 52, height: 51 },
        { x: -232, y: -2523, width: 86, height: 49 },
        { x: -333, y: -2526, width: 110, height: 47 },
        { x: -454, y: -2522, width: 86, height: 49 },
      ],
      energyBall: [
        { x: -550, y: -2525, width: 40, height: 46 },
        { x: -602, y: -2526, width: 41, height: 45 },
        { x: -657, y: -2530, width: 48, height: 41 },
        { x: -717, y: -2525, width: 37, height: 45 },
      ],
    };

    const updatePosition = useCallback(() => {
      const speed = isRunning ? runSpeed : moveSpeed;

      // Ne pas gérer le mouvement horizontal ici si le personnage est en l'air
      if (isInAir) return;

      if (pressedKeys.current.has(controls.RIGHT)) {
        setDirection("right");
        setCurrentPosition((prev) => ({ ...prev, x: prev.x + speed }));
        setIsMoving(true);
        setIsStopping(false);
        momentumRef.current = speed;
      } else if (pressedKeys.current.has(controls.LEFT)) {
        setDirection("left");
        setCurrentPosition((prev) => ({ ...prev, x: prev.x - speed }));
        setIsMoving(true);
        setIsStopping(false);
        momentumRef.current = -speed;
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
    }, [isRunning, isInAir]);

    useEffect(() => {
      let gravityInterval;

      const applyGravity = () => {
        if (isInAir) {
          // Maintenir le mouvement horizontal pendant le saut
          const horizontalSpeed = isRunning ? runSpeed : moveSpeed;

          if (pressedKeys.current.has(controls.RIGHT)) {
            setDirection("right");
            setCurrentPosition((prev) => ({
              ...prev,
              x: prev.x + horizontalSpeed,
            }));
          } else if (pressedKeys.current.has(controls.LEFT)) {
            setDirection("left");
            setCurrentPosition((prev) => ({
              ...prev,
              x: prev.x - horizontalSpeed,
            }));
          }

          // Appliquer la gravité de manière différente selon la phase
          if (verticalVelocity < 0) {
            // Phase de montée - gravité normale
            setVerticalVelocity((prev) => prev + GRAVITY * 1.1); // Légèrement plus forte
          } else {
            // Phase de descente - gravité réduite mais pas trop
            setVerticalVelocity((prev) => prev + GRAVITY * 0.9); // Réduire moins la gravité
          }

          setCurrentPosition((prev) => {
            const newY = prev.y + verticalVelocity;

            if (newY >= GROUND_Y) {
              setIsInAir(false);
              setVerticalVelocity(0);
              setIsJumping(false);

              // IMPORTANT: Détecter si on touche le sol pendant une attaque
              if (isAttacking) {
                setAttackLandedOnGround(true);

                // Forcer la fin de l'animation d'attaque
                if (attackType === "kickDown") {
                  // Annuler immédiatement l'attaque de coup de pied vers le bas
                  setIsAttacking(false);
                  setAttackType("normal");
                  setCurrentFrame(0);
                }
              } else {
                setCurrentFrame(0);
              }

              // Si on n'attaque pas, vérifier le mouvement horizontal
              if (!isAttacking) {
                if (
                  pressedKeys.current.has(controls.RIGHT) ||
                  pressedKeys.current.has(controls.LEFT)
                ) {
                  setIsMoving(true);
                  if (isRunning) {
                    return { ...prev, y: GROUND_Y };
                  }
                } else {
                  setCurrentFrame(0);
                }
              }

              return { ...prev, y: GROUND_Y };
            }

            // Ne pas changer les frames si on est en train d'attaquer
            if (!isAttacking) {
              // Utiliser une progression plus fluide pour les frames de saut
              const totalJumpHeight =
                GROUND_Y - Math.max(newY, GROUND_Y - maxJumpHeight);
              const jumpRatio = totalJumpHeight / maxJumpHeight;

              // Adoucir les transitions entre les frames et ralentir leur changement
              if (verticalVelocity < 0) {
                // Phase de montée - frames 0 à 4 plus lentes
                const ascendProgress = Math.max(0, Math.min(1, jumpRatio * 2));
                const frameIndex = Math.min(Math.floor(ascendProgress * 5), 4);
                // Ne changer la frame que si nécessaire (ralentir les transitions)
                if (Math.abs(frameIndex - currentFrame) > 1) {
                  setCurrentFrame(frameIndex);
                }
              } else {
                // Phase de descente - frames 5 à 10 plus lentes
                const descendProgress = Math.max(0, 1 - jumpRatio * 2);
                // Utiliser une progression non-linéaire pour la descente
                // Cela crée un effet de "flottement" avant de tomber rapidement
                const slowedDesc = Math.pow(descendProgress, 0.85); // Exposant < 1 pour ralentir la progression
                const frameIndex = Math.min(5 + Math.floor(slowedDesc * 6), 10);
                setCurrentFrame(frameIndex);
              }
            }

            return { ...prev, y: newY };
          });
        }
      };

      // Utiliser un intervalle plus court pour une animation plus fluide
      gravityInterval = setInterval(applyGravity, 10); // Légèrement plus lent (10ms au lieu de 8ms)

      return () => clearInterval(gravityInterval);
    }, [
      isInAir,
      verticalVelocity,
      isRunning,
      moveSpeed,
      runSpeed,
      isAttacking,
      currentFrame,
      attackType,
    ]);

    useEffect(() => {
      let animationInterval;
      let moveInterval;

      const updateAnimation = () => {
        let currentFrames;
        let animationSpeed;

        if (isAttacking) {
          // Déterminer le type d'animation d'attaque
          if (attackType === "punch") {
            currentFrames = frames.punch;
            animationSpeed = 140;
          } else if (attackType === "kickDown") {
            currentFrames = frames.kickDown;
            animationSpeed = 180;
          } else if (attackType === "ultimate") {
            currentFrames = frames.ultimate;
            animationSpeed = 250;
          } else if (isInAir) {
            currentFrames = frames.airAttack;
            animationSpeed = 200;
          } else {
            currentFrames = frames.attack;
            animationSpeed = 80; // Réduire de 130 à 80 pour que l'animation soit plus rapide
          }

          // Mettre à jour la frame de l'animation
          setCurrentFrame((prevFrame) => {
            if (attackLandedOnGround && attackType === "kickDown") {
              // Forcer immédiatement la fin de l'animation pour kickDown
              setIsAttacking(false);
              setAttackType("normal");
              setAttackLandedOnGround(false);
              return 0;
            }

            if (prevFrame >= currentFrames.length - 1) {
              setTimeout(() => {
                setIsAttacking(false);
                setAttackType("normal");
                setCurrentFrame(0);
              }, 250);
              return prevFrame;
            }

            // Gestion spécifique pour le coup de pied vers le bas
            if (attackType === "kickDown") {
              return Math.floor(Date.now() / 200) % 2 === 0
                ? Math.min(prevFrame + 1, currentFrames.length - 1)
                : prevFrame;
            }

            // Pour l'attaque ultime
            if (attackType === "ultimate") {
              // Animation plus lente - un frame à la fois
              return prevFrame + 1;
            }

            // Pour les attaques aériennes
            if (isInAir && attackType === "normal") {
              const shouldAdvance = Math.floor(Date.now() / 200) % 2 === 0;
              return shouldAdvance
                ? Math.min(prevFrame + 1, currentFrames.length - 1)
                : prevFrame;
            }

            return prevFrame + 1;
          });
        } else {
          // Animations standard
          if (isJumping) {
            currentFrames = frames.jump;
            animationSpeed = 80;
          } else {
            currentFrames = isRunning
              ? frames.run
              : isMoving
              ? frames.walk
              : frames.idle;
            animationSpeed = isRunning ? 50 : 100;
          }
          setCurrentFrame((prev) => (prev + 1) % currentFrames.length);
        }

        return animationSpeed;
      };

      // Ajuster le multiplicateur pour la vitesse d'animation
      const handleAnimation = () => {
        const speed = updateAnimation();

        let actualSpeed = speed;
        if (isAttacking) {
          if (attackType === "kickDown") {
            actualSpeed = speed * 1.5; // Réduire le multiplicateur (2 -> 1.5)
          } else if (isInAir && attackType === "normal") {
            actualSpeed = speed * 1.8;
          } else {
            actualSpeed = speed * 1.3;
          }
        }

        animationInterval = setTimeout(handleAnimation, actualSpeed);
      };

      handleAnimation();
      moveInterval = setInterval(updatePosition, 16);

      return () => {
        clearTimeout(animationInterval);
        clearInterval(moveInterval);
      };
    }, [
      isMoving,
      isRunning,
      isStopping,
      isAttacking,
      isInAir,
      isJumping,
      updatePosition,
      verticalVelocity,
      currentPosition.y,
      attackType,
      attackCooldown,
      attackLandedOnGround,
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
            return prev - 1; // Diminue plus lentement (par exemple, 1% au lieu de 5%)
          });
        }, 100); // Diminue toutes les 100ms

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
            return prev + 1; // Régénère plus lentement (par exemple, 1% au lieu de 2%)
          });
        }, 200); // Régénère plus lentement
      }

      return () => {
        if (staminaIntervalRef.current)
          clearInterval(staminaIntervalRef.current);
        if (staminaRegenIntervalRef.current)
          clearInterval(staminaRegenIntervalRef.current);
      };
    }, [isRunning, stamina]);

    useEffect(() => {
      if (isPaused) {
        // Arrêter toutes les animations et mouvements si le jeu est en pause
        if (staminaIntervalRef.current)
          clearInterval(staminaIntervalRef.current);
        if (staminaRegenIntervalRef.current)
          clearInterval(staminaRegenIntervalRef.current);
        return;
      }

      const handleKeyDown = (e) => {
        if (isPaused || isExecutingUltimate || isStunned) return;

        const key = e.key;

        // Vérifier si la touche fait partie des contrôles de ce personnage
        if (Object.values(controls).includes(key)) {
          pressedKeys.current.add(key);

          if (key === controls.JUMP && !isInAir && !isAttacking) {
            setIsInAir(true);
            setIsJumping(true);
            setVerticalVelocity(JUMP_FORCE);
            setCurrentFrame(1);

            // Ajouter un effet "d'apesanteur" au sommet du saut
            setTimeout(() => {
              if (
                isInAir &&
                verticalVelocity > JUMP_FORCE / 2 &&
                verticalVelocity < 0
              ) {
                // Ralentir temporairement la gravité au sommet du saut
                setVerticalVelocity((prev) => prev * 0.7); // Réduire la vitesse verticale
              }
            }, 200); // Moment approximatif où le personnage approche du sommet
          } else if (
            key === controls.ATTACK1 &&
            attackCooldown <= 0 &&
            !isAttacking
          ) {
            console.log(
              isInAir ? "Attaque aérienne normale" : "Attaque au sol"
            );
            setAttackType("normal");
            setIsAttacking(true);
            setCurrentFrame(0);

            // Arrêter le mouvement pour les attaques au sol
            if (!isInAir) {
              setIsMoving(false);
              setIsRunning(false);
              setIsStopping(false);
            }

            setAttackCooldown(isInAir ? 500 : 0); // Mettre 0 au lieu de 2000 pour l'attaque au sol
          } else if (
            key === controls.ATTACK2 &&
            attackCooldown <= 0 &&
            !isAttacking
          ) {
            console.log("Coup de poing");
            setAttackType("punch");

            // Désactiver l'animation de saut pendant le coup de poing en l'air
            if (isInAir) {
              setIsJumping(false);
            } else {
              setIsMoving(false);
              setIsRunning(false);
              setIsStopping(false);
            }

            setIsAttacking(true);
            setCurrentFrame(0);
            setAttackCooldown(1500);
          } else if (
            key === controls.ULTIMATE &&
            !isInAir &&
            ultimateCooldown <= 0 &&
            !isAttacking &&
            ultimateBar >= 100
          ) {
            console.log("Démarrage de l'ultime de Luffy");

            // Réinitialiser la barre d'ultime
            setUltimateBar(0);

            // Bloquer les touches
            setIsExecutingUltimate(true);

            // Afficher l'overlay de l'ultime
            setShowUltimateOverlay(true);

            // Jouer le son de l'ultime et calculer sa durée
            const audio = new Audio(UltimateSound);
            audio.addEventListener("loadedmetadata", () => {
              const soundDuration = audio.duration * 1000; // Convertir en millisecondes

              audio.play();
              setUltimateAudio(audio);

              // Exécuter l'attaque ultime après 2 secondes
              setTimeout(() => {
                setShowUltimateOverlay(false);

                // Activer l'animation d'attaque ultime
                setIsAttacking(true);
                setAttackType("ultimate");
                setCurrentFrame(0);
                setUltimateCooldown(8000);

                // Terminer l'attaque à la fin du son
                setTimeout(
                  () => {
                    setIsAttacking(false);
                    setAttackType("normal");

                    // Débloquer les touches à la fin de l'ultime
                    setIsExecutingUltimate(false);

                    // Arrêter le son
                    if (ultimateAudio) {
                      ultimateAudio.pause();
                      ultimateAudio.currentTime = 0;
                      setUltimateAudio(null);
                    }
                  },
                  soundDuration - 2000 > 0
                    ? soundDuration - 2000
                    : frames.ultimate.length * 150
                );
              }, 2000);
            });

            // En cas d'erreur de chargement du son
            audio.addEventListener("error", () => {
              console.error("Erreur lors du chargement du son ultime");
              // Fallback sur la durée de l'animation
              const animationDuration = frames.ultimate.length * 150;

              setTimeout(() => {
                setShowUltimateOverlay(false);
                setIsAttacking(true);
                setAttackType("ultimate");
                setCurrentFrame(0);
                setUltimateCooldown(8000);

                setTimeout(() => {
                  setIsAttacking(false);
                  setAttackType("normal");
                  // Débloquer les touches en cas d'erreur aussi
                  setIsExecutingUltimate(false);
                }, animationDuration);
              }, 2000);
            });
          } else if (key === controls.RIGHT || key === controls.LEFT) {
            const currentTime = Date.now();
            // Vérifier si c'est un double appui rapide
            if (currentTime - lastKeyPressTime.current < DOUBLE_CLICK_DELAY) {
              // Activer le sprint seulement si on a assez d'endurance
              if (stamina > 5) {
                setIsRunning(true);
              }
            }
            lastKeyPressTime.current = currentTime;
          }
        }
      };

      const handleKeyUp = (e) => {
        const key = e.key;

        if (Object.values(controls).includes(key)) {
          pressedKeys.current.delete(key);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [
      isAttacking,
      isInAir,
      isRunning,
      stamina,
      isPaused,
      attackCooldown,
      ultimateCooldown,
      controls,
      isStunned,
      ultimateBar,
    ]);

    // Gestion du cooldown d'attaque
    useEffect(() => {
      if (attackCooldown > 0) {
        const cooldownInterval = setInterval(() => {
          setAttackCooldown((prev) => prev - 16);
        }, 16);

        return () => clearInterval(cooldownInterval);
      }
    }, [attackCooldown]);

    // Gestion du cooldown de l'ultime
    useEffect(() => {
      if (ultimateCooldown > 0) {
        const cooldownInterval = setInterval(() => {
          setUltimateCooldown((prev) => prev - 16);
        }, 16);

        return () => clearInterval(cooldownInterval);
      }
    }, [ultimateCooldown]);

    // Ajouter une vérification supplémentaire dans l'effet qui gère le retour au sol
    useEffect(() => {
      // Cet effet vérifie spécifiquement quand on touche le sol
      if (!isInAir && attackLandedOnGround) {
        // Si on vient de toucher le sol pendant une attaque
        setIsAttacking(false);
        setAttackType("normal");
        setAttackLandedOnGround(false);
        setCurrentFrame(0);
      }
    }, [isInAir, attackLandedOnGround]);

    // Ajouter un useEffect pour gérer l'animation hurt
    useEffect(() => {
      console.log("Luffy - isHurt changé à:", isHurt);
      if (isHurt) {
        console.log("Démarrage animation hurt pour Luffy");

        // Sauvegarder l'état actuel
        const currentIsAttacking = isAttacking;
        const currentAttackType = attackType;

        // Interrompre toute animation en cours
        setIsAttacking(false);
        setIsMoving(false);
        setIsRunning(false);

        // Forcer l'animation hurt
        setAttackType("hurt");
        setCurrentFrame(0);

        // Ajouter un recul
        const knockbackDirection = direction === "right" ? -10 : 10;
        setCurrentPosition((prev) => ({
          ...prev,
          x: prev.x + knockbackDirection,
        }));

        // Revenir à l'état normal après l'animation hurt
        setTimeout(() => {
          // Ne restaurer l'état d'attaque que si l'animation hurt est terminée
          if (!isHurt) {
            setAttackType(
              currentAttackType === "hurt" ? "normal" : currentAttackType
            );
            setIsAttacking(currentIsAttacking);
          }
        }, 500);
      }
    }, [isHurt]);

    useEffect(() => {
      // Mettre à jour les positions initiales si elles changent
      setPosX(position.x);
      setPosY(position.y);
    }, [position.x, position.y]);

    const currentFrames = isHurt
      ? frames.hurt
      : isAttacking
      ? attackType === "punch"
        ? frames.punch
        : attackType === "kickDown"
        ? frames.kickDown
        : attackType === "ultimate"
        ? frames.ultimate
        : isInAir
        ? frames.airAttack
        : frames.attack
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

    useImperativeHandle(ref, () => ({
      getPosition: () => currentPosition,
      isAttacking: () => isAttacking,
      getAttackType: () => attackType,
      getDirection: () => direction,
      stun: (duration) => {
        setIsStunned(true);
        if (stunTimeout) clearTimeout(stunTimeout);
        const timeout = setTimeout(() => {
          setIsStunned(false);
        }, duration);
        setStunTimeout(timeout);
      },
    }));

    // Au début de votre rendu
    console.log("Luffy rendu avec isHurt:", isHurt);

    // Ajouter un useEffect pour incrémenter la barre d'ultime avec le temps
    useEffect(() => {
      if (isPaused || isExecutingUltimate) return;

      const ultimateBarInterval = setInterval(() => {
        setUltimateBar((prev) => {
          // Ne pas dépasser 100
          if (prev >= 100) return 100;
          // Incrémenter de 1 toutes les 500ms (20 secondes pour charger complètement)
          return prev + 1;
        });
      }, 500);

      return () => clearInterval(ultimateBarInterval);
    }, [isPaused, isExecutingUltimate]);

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
            transform:
              direction === "left" ? "scaleX(-1) scale(2)" : "scale(2)",
            transformOrigin: "center bottom",
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
        {/* Barre d'ultime */}
        <div
          className="ultimate-bar"
          style={{
            position: "absolute",
            top: "40px", // Positionner sous la barre de stamina
            left: "10px",
            width: "200px",
            height: "20px",
            backgroundColor: "#333",
            borderRadius: "10px",
            overflow: "hidden",
            border: "2px solid #e74c3c",
          }}
        >
          <div
            style={{
              width: `${ultimateBar}%`,
              height: "100%",
              backgroundColor: ultimateBar >= 100 ? "#e74c3c" : "#f08080",
              transition: "width 0.5s linear",
              boxShadow: ultimateBar >= 100 ? "0 0 10px #e74c3c" : "none",
            }}
          />
          {ultimateBar >= 100 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                textShadow: "0 0 3px black",
              }}
            >
              READY
            </div>
          )}
        </div>
        {/* Poing étiré (équivalent à la boule d'énergie) */}
        {energyBallActive && (
          <div
            className="luffy-sprite"
            style={{
              position: "absolute",
              left: `${energyBallPosition.x}px`,
              top: `${energyBallPosition.y}px`,
              backgroundPosition: `${frames.energyBall[energyBallFrame].x}px ${frames.energyBall[energyBallFrame].y}px`,
              width: `${frames.energyBall[energyBallFrame].width}px`,
              height: `${frames.energyBall[energyBallFrame].height}px`,
              transform: "scale(3)",
              transformOrigin: "center center",
              zIndex: 200,
              filter: "brightness(1.2) drop-shadow(0 0 8px #ff3333)",
            }}
          />
        )}

        {/* Overlay de l'ultime */}
        {showUltimateOverlay && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              zIndex: 1000,
            }}
          >
            <img
              src={UltimateImage}
              alt="Ultimate Attack"
              style={{
                maxWidth: "70%",
                maxHeight: "70%",
                objectFit: "contain",
                animation: "pulse 1s infinite alternate",
              }}
            />
          </div>
        )}
      </>
    );
  }
);

export default Luffy;
