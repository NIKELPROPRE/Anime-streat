import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../../styles/characters/Naruto.css";
import UltimateSound from "/Sound/Naruto Shippuden - Rasengan.mp3";
import UltimateImage from "/Image_perso/Naruto.jpg";

const Naruto = forwardRef(
  (
    { position = { x: 100, y: 400 }, controls, isPaused, isHurt, playerId },
    ref
  ) => {
    // États
    const [posX, setPosX] = useState(position.x);
    const [posY, setPosY] = useState(position.y);
    const [currentPosition, setCurrentPosition] = useState(position);
    const [isMoving, setIsMoving] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isAttacking, setIsAttacking] = useState(false);
    const [direction, setDirection] = useState("left");
    const [currentFrame, setCurrentFrame] = useState(0);
    const [attackCooldown, setAttackCooldown] = useState(0);
    const [ultimateCooldown, setUltimateCooldown] = useState(0);
    const [isJumping, setIsJumping] = useState(false);
    const [isInAir, setIsInAir] = useState(false);
    const [verticalVelocity, setVerticalVelocity] = useState(0);
    const [attackType, setAttackType] = useState("normal");
    const [attackLandedOnGround, setAttackLandedOnGround] = useState(false);
    const [energyBallActive, setEnergyBallActive] = useState(false);
    const [energyBallPosition, setEnergyBallPosition] = useState({
      x: 0,
      y: 0,
    });
    const [energyBallFrame, setEnergyBallFrame] = useState(0);
    const [showUltimateOverlay, setShowUltimateOverlay] = useState(false);
    const [ultimateAudio, setUltimateAudio] = useState(null);
    const [isExecutingUltimate, setIsExecutingUltimate] = useState(false);
    const [isStunned, setIsStunned] = useState(false);
    const [stunTimeout, setStunTimeout] = useState(null);

    // Références
    const animationRef = useRef(null);
    const pressedKeys = useRef(new Set());
    const lastKeyPressTime = useRef(0);
    const momentumRef = useRef(0);

    // Constantes
    const moveSpeed = 3;
    const runSpeed = 6;
    const DOUBLE_CLICK_DELAY = 300;
    const FRICTION = 0.9;
    const GROUND_Y = position.y;
    const maxJumpHeight = 80;
    const GRAVITY = 0.4;
    const JUMP_FORCE = -12;

    // Frames de Naruto
    const frames = {
      idle: [
        { x: -8, y: -230, width: 25, height: 40 },
        { x: -42, y: -230, width: 25, height: 41 },
        { x: -77, y: -232, width: 25, height: 38 },
        { x: -111, y: -230, width: 25, height: 41 },
      ],
      walk: [
        { x: -5, y: -289, width: 28, height: 34 },
        { x: -43, y: -286, width: 31, height: 37 },
        { x: -83, y: -289, width: 28, height: 34 },
        { x: -124, y: -289, width: 24, height: 34 },
        { x: -155, y: -289, width: 31, height: 34 },
        { x: -193, y: -286, width: 31, height: 37 },
        { x: -236, y: -289, width: 31, height: 34 },
        { x: -274, y: -289, width: 25, height: 34 },
      ],
      run: [
        { x: -362, y: -289, width: 37, height: 31 },
        { x: -408, y: -289, width: 38, height: 34 },
      ],
      jump: [
        { x: -8, y: -352, width: 22, height: 34 },
        { x: -36, y: -339, width: 28, height: 39 },
        { x: -73, y: -339, width: 29, height: 38 },
        { x: -114, y: -339, width: 25, height: 38 },
        { x: -149, y: -339, width: 25, height: 38 },
        { x: -186, y: -352, width: 22, height: 34 },
        { x: -217, y: -358, width: 28, height: 28 },
        { x: -254, y: -352, width: 23, height: 34 },
      ],
      attack: [
        { x: -5, y: -695, width: 25, height: 41 },
        { x: -39, y: -698, width: 31, height: 38 },
        { x: -79, y: -698, width: 35, height: 38 },
        { x: -124, y: -698, width: 25, height: 38 },
      ],
      airAttack: [
        { x: -5, y: -811, width: 31, height: 37 },
        { x: -42, y: -813, width: 25, height: 32 },
        { x: -77, y: -808, width: 41, height: 40 },
        { x: -127, y: -811, width: 42, height: 44 },
        { x: -177, y: -811, width: 26, height: 44 },
        { x: -214, y: -811, width: 25, height: 37 },
        { x: -249, y: -811, width: 25, height: 37 },
      ],
      punch: [
        { x: -5, y: -695, width: 25, height: 41 },
        { x: -39, y: -698, width: 31, height: 38 },
        { x: -79, y: -698, width: 35, height: 38 },
        { x: -124, y: -698, width: 25, height: 38 },
      ],
      kickDown: [
        { x: -8, y: -352, width: 22, height: 34 },
        { x: -36, y: -339, width: 28, height: 39 },
        { x: -73, y: -339, width: 29, height: 38 },
        { x: -114, y: -339, width: 25, height: 38 },
      ],
      hurt: [
        { x: -5, y: -405, width: 28, height: 40 },
        { x: -45, y: -410, width: 28, height: 35 },
        { x: -89, y: -411, width: 31, height: 34 },
        { x: -142, y: -410, width: 22, height: 35 },
      ],
      rushAttack: [
        { x: -233, y: -705, width: 31, height: 31 },
        { x: -274, y: -702, width: 31, height: 34 },
        { x: -315, y: -705, width: 43, height: 31 },
        { x: -364, y: -708, width: 35, height: 28 },
        { x: -408, y: -699, width: 28, height: 37 },
      ],
      downAttack: [
        { x: -5, y: -755, width: 25, height: 37 },
        { x: -39, y: -761, width: 28, height: 31 },
        { x: -77, y: -755, width: 28, height: 37 },
        { x: -117, y: -755, width: 35, height: 37 },
        { x: -158, y: -764, width: 34, height: 28 },
        { x: -201, y: -761, width: 26, height: 31 },
      ],
      upAttack: [
        { x: -335, y: -755, width: 26, height: 37 },
        { x: -370, y: -755, width: 19, height: 37 },
        { x: -402, y: -758, width: 25, height: 34 },
        { x: -436, y: -752, width: 31, height: 40 },
        { x: -480, y: -755, width: 28, height: 37 },
        { x: -518, y: -754, width: 25, height: 38 },
      ],
      powerAttack: [
        { x: -8, y: -870, width: 25, height: 41 },
        { x: -42, y: -870, width: 25, height: 41 },
        { x: -80, y: -870, width: 23, height: 41 },
        { x: -114, y: -873, width: 19, height: 38 },
        { x: -143, y: -873, width: 37, height: 38 },
        { x: -189, y: -873, width: 19, height: 38 },
        { x: -220, y: -877, width: 22, height: 34 },
        { x: -252, y: -877, width: 22, height: 34 },
        { x: -283, y: -880, width: 44, height: 31 },
        { x: -333, y: -880, width: 41, height: 31 },
        { x: -383, y: -873, width: 28, height: 38 },
      ],
      ultimateCharge: [
        { x: -5, y: -2602, width: 25, height: 40 },
        { x: -36, y: -2605, width: 31, height: 37 },
        { x: -74, y: -2605, width: 28, height: 37 },
      ],
      ultimateRush: [
        { x: -120, y: -2608, width: 35, height: 34 },
        { x: -164, y: -2608, width: 35, height: 34 },
        { x: -217, y: -2611, width: 44, height: 31 },
        { x: -267, y: -2608, width: 41, height: 34 },
        { x: -314, y: -2611, width: 41, height: 31 },
        { x: -361, y: -2610, width: 41, height: 32 },
      ],
      energyBall: [
        { x: -149, y: -2252, width: 31, height: 31 },
        { x: -186, y: -2252, width: 31, height: 34 },
        { x: -230, y: -2245, width: 44, height: 47 },
        { x: -283, y: -2248, width: 40, height: 41 },
        { x: -333, y: -2252, width: 40, height: 36 },
      ],
    };

    // Ajouter useImperativeHandle pour exposer les méthodes nécessaires
    useImperativeHandle(ref, () => ({
      getPosition: () => currentPosition,
      setPosition: (position) => setCurrentPosition(position),
      isAttacking: () => isAttacking,
      isLastFrame: () => {
        // Vérifie si on est à la dernière frame de l'animation d'attaque
        if (!isAttacking) return false;

        const frames = getCurrentFrames();
        return currentFrame === frames.length - 1;
      },
      isAttackActive: () => {
        // Retourne true seulement si l'attaque est dans sa phase active
        return (
          isAttacking &&
          currentFrame > 0 &&
          currentFrame < getCurrentFrames().length - 1
        );
      },
      getAttackType: () => attackType,
      getDirection: () => direction,
      stun: (duration) => {
        // Ne rien faire - le stun est désactivé pour Naruto
        console.log("Stun ignoré pour Naruto");
        return; // Simplement retourner sans changer l'état
      },
      isJumping: () => isJumping,
      isEnergyBallActive: () => energyBallActive,
      getEnergyBallPosition: () => energyBallPosition,
      getUltimateCooldown: () => ultimateCooldown,
    }));

    // Fonction de mise à jour de la position
    const updatePosition = useCallback(() => {
      const speed = isRunning ? runSpeed : moveSpeed;

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
        momentumRef.current *= FRICTION;
        setCurrentPosition((prev) => ({
          ...prev,
          x: prev.x + momentumRef.current,
        }));

        if (Math.abs(momentumRef.current) < 0.1) {
          momentumRef.current = 0;
          setIsStopping(false);
          setIsRunning(false);
          setCurrentFrame(0);
        }
      } else {
        setIsMoving(false);
        setIsRunning(false);
        setIsStopping(false);
        momentumRef.current = 0;
      }
    }, [isRunning, isInAir, controls]);

    // Gestion de la gravité et du saut
    useEffect(() => {
      let gravityInterval;

      const applyGravity = () => {
        if (isInAir) {
          const horizontalSpeed = isRunning ? runSpeed : moveSpeed;

          if (pressedKeys.current.has(controls.RIGHT) && !isAttacking) {
            setDirection("right");
            setCurrentPosition((prev) => ({
              ...prev,
              x: prev.x + horizontalSpeed,
            }));
          } else if (pressedKeys.current.has(controls.LEFT) && !isAttacking) {
            setDirection("left");
            setCurrentPosition((prev) => ({
              ...prev,
              x: prev.x - horizontalSpeed,
            }));
          }

          if (verticalVelocity < 0) {
            setVerticalVelocity((prev) => prev + GRAVITY * 1.1);
          } else {
            setVerticalVelocity((prev) => prev + GRAVITY * 0.9);
          }

          setCurrentPosition((prev) => {
            const newY = prev.y + verticalVelocity;

            if (newY >= GROUND_Y) {
              setIsInAir(false);
              setVerticalVelocity(0);
              setIsJumping(false);

              if (isAttacking) {
                setAttackLandedOnGround(true);

                if (attackType === "kickDown") {
                  setIsAttacking(false);
                  setAttackType("normal");
                  setCurrentFrame(0);
                }
              } else {
                setCurrentFrame(0);
              }

              return { ...prev, y: GROUND_Y };
            }

            if (!isAttacking) {
              const totalJumpHeight =
                GROUND_Y - Math.max(newY, GROUND_Y - maxJumpHeight);
              const jumpRatio = totalJumpHeight / maxJumpHeight;

              if (verticalVelocity < 0) {
                const ascendProgress = Math.max(0, Math.min(1, jumpRatio * 2));
                const frameIndex = Math.min(Math.floor(ascendProgress * 4), 3);
                if (Math.abs(frameIndex - currentFrame) > 1) {
                  setCurrentFrame(frameIndex);
                }
              } else {
                const descendProgress = Math.max(0, 1 - jumpRatio * 2);
                const slowedDesc = Math.pow(descendProgress, 0.85);
                const frameIndex = Math.min(4 + Math.floor(slowedDesc * 4), 7);
                setCurrentFrame(frameIndex);
              }
            }

            return { ...prev, y: newY };
          });
        }
      };

      gravityInterval = setInterval(applyGravity, 10);

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
      controls,
    ]);

    // Animation
    useEffect(() => {
      let animationInterval;
      let moveInterval;

      const updateAnimation = () => {
        let currentFrames;
        let animationSpeed;

        if (isAttacking) {
          if (attackType === "punch") {
            currentFrames = frames.punch;
            animationSpeed = 140;
          } else if (attackType === "kickDown") {
            currentFrames = frames.kickDown;
            animationSpeed = 180;
          } else if (attackType === "rushAttack") {
            currentFrames = frames.rushAttack;
            animationSpeed = 120;
          } else if (attackType === "downAttack") {
            currentFrames = frames.downAttack;
            animationSpeed = 150;
          } else if (attackType === "upAttack") {
            currentFrames = frames.upAttack;
            animationSpeed = 130;
          } else if (attackType === "airAttack") {
            currentFrames = frames.airAttack;
            animationSpeed = 130;
          } else if (attackType === "powerAttack") {
            currentFrames = frames.powerAttack;
            animationSpeed = 160;
          } else if (
            attackType === "ultimateCharge" ||
            attackType === "ultimateRush"
          ) {
            // Sélectionner les bonnes frames selon la phase
            currentFrames =
              attackType === "ultimateCharge"
                ? frames.ultimateCharge
                : frames.ultimateRush;

            // Vitesse d'animation différente selon la phase
            animationSpeed = attackType === "ultimateCharge" ? 200 : 80;

            // Faire avancer l'animation sans bloquer les transitions
            setCurrentFrame((prev) => {
              // Pour la phase charge, permettre de compléter l'animation
              // Pour la phase rush, boucler l'animation tant qu'elle est active
              if (prev >= currentFrames.length - 1) {
                return attackType === "ultimateRush" ? 0 : prev;
              }
              return prev + 1;
            });

            // Empêcher explicitement tout mouvement pendant cette phase
            setIsMoving(false);
            setIsRunning(false);

            return animationSpeed;
          } else {
            currentFrames = frames.attack;
            animationSpeed = 130;
          }

          setCurrentFrame((prevFrame) => {
            if (attackLandedOnGround) {
              setIsAttacking(false);
              setAttackType("normal");
              setAttackLandedOnGround(false);
              return 0;
            }

            if (prevFrame >= currentFrames.length - 1) {
              setTimeout(
                () => {
                  setIsAttacking(false);
                  setAttackType("normal");
                  setAttackLandedOnGround(false);

                  if (!isInAir) {
                    setCurrentFrame(0);
                    if (
                      pressedKeys.current.has(controls.LEFT) ||
                      pressedKeys.current.has(controls.RIGHT)
                    ) {
                      setIsMoving(true);
                    }
                  }
                },
                attackType === "powerAttack" ? 300 : 150
              );

              return prevFrame;
            }

            return prevFrame + 1;
          });
        } else {
          if (isJumping) {
            currentFrames = frames.jump;
            animationSpeed = 80;
          } else {
            currentFrames = isRunning
              ? frames.run
              : isMoving
              ? frames.walk
              : frames.idle;
            animationSpeed = isRunning ? 70 : isMoving ? 100 : 150;
          }
          setCurrentFrame((prev) => (prev + 1) % currentFrames.length);
        }

        return animationSpeed;
      };

      const handleAnimation = () => {
        if (isPaused) return;
        const speed = updateAnimation();
        animationInterval = setTimeout(handleAnimation, speed);
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
      isPaused,
      attackType,
      attackLandedOnGround,
      controls,
    ]);

    // Gestion des entrées clavier
    useEffect(() => {
      if (isPaused || isExecutingUltimate || isStunned) return;

      const handleKeyDown = (e) => {
        if (isPaused || isExecutingUltimate) return;

        if (attackType === "ultimateCharge" || attackType === "ultimateRush") {
          if (
            e.key === controls.LEFT ||
            e.key === controls.RIGHT ||
            e.key === controls.UP ||
            e.key === controls.DOWN ||
            e.key === controls.JUMP
          ) {
            return;
          }
        }

        const key = e.key;
        const currentTime = Date.now();

        console.log("Touche pressée:", key);
        console.log("Touche ultime attendue:", controls.ULTIMATE);
        console.log("isInAir:", isInAir);
        console.log("ultimateCooldown:", ultimateCooldown);
        console.log("isAttacking:", isAttacking);

        if (Object.values(controls).includes(key)) {
          pressedKeys.current.add(key);

          if (key === controls.JUMP && !isInAir && !isAttacking) {
            setIsInAir(true);
            setIsJumping(true);
            setVerticalVelocity(JUMP_FORCE);
            setCurrentFrame(1);

            setTimeout(() => {
              if (
                isInAir &&
                verticalVelocity > JUMP_FORCE / 2 &&
                verticalVelocity < 0
              ) {
                setVerticalVelocity((prev) => prev * 0.7);
              }
            }, 200);
          } else if (
            (key === controls.LEFT || key === controls.RIGHT) &&
            (!isAttacking || isInAir)
          ) {
            if (currentTime - lastKeyPressTime.current < DOUBLE_CLICK_DELAY) {
              setIsRunning(true);
            }
            lastKeyPressTime.current = currentTime;
          } else if (
            key === controls.ATTACK1 &&
            attackCooldown <= 0 &&
            !isAttacking
          ) {
            console.log("Exécution attaque normale");
            if (isInAir && pressedKeys.current.has(controls.DOWN)) {
              console.log("Exécution coup de pied vers le bas en l'air");
              setAttackType("kickDown");
              setIsJumping(false);
              setAttackLandedOnGround(false);

              const landingCheck = setInterval(() => {
                if (!isInAir && isAttacking && attackType === "kickDown") {
                  clearInterval(landingCheck);
                  setIsAttacking(false);
                  setAttackType("normal");
                  setAttackLandedOnGround(false);
                  setCurrentFrame(0);
                } else if (!isAttacking) {
                  clearInterval(landingCheck);
                }
              }, 50);

              setTimeout(() => clearInterval(landingCheck), 2000);
            } else if (isInAir) {
              console.log("Exécution attaque en l'air");
              setAttackType("airAttack");
              setIsJumping(false);
            } else if (pressedKeys.current.has(controls.DOWN)) {
              console.log("Exécution attaque vers le bas au sol");
              setAttackType("downAttack");
            } else if (pressedKeys.current.has(controls.JUMP)) {
              console.log("Exécution attaque vers le haut au sol");
              setAttackType("upAttack");
            } else if (isRunning) {
              console.log("Exécution attaque en course");
              setAttackType("rushAttack");
              setIsRunning(false);
              setIsStopping(false);
              momentumRef.current = 0;
            } else {
              setAttackType("punch");
            }

            setIsAttacking(true);
            setCurrentFrame(0);
            setAttackCooldown(1500);
          } else if (
            key === controls.ATTACK2 &&
            attackCooldown <= 0 &&
            !isAttacking
          ) {
            console.log("Exécution attaque puissante");
            setAttackType("powerAttack");

            // Arrêter tous les mouvements pendant l'attaque puissante
            setIsMoving(false);
            setIsRunning(false);
            setIsStopping(false);

            setIsAttacking(true);
            setCurrentFrame(0);
            // Cooldown plus long pour l'attaque puissante
            setAttackCooldown(2500);
          } else if (
            key === controls.ULTIMATE &&
            !isInAir &&
            ultimateCooldown <= 0 &&
            !isAttacking
          ) {
            console.log("Démarrage de l'ultime de Naruto");
            setAttackType("ultimate");
            setIsAttacking(true);
            setUltimateCooldown(30000);

            // Bloquer les touches
            setIsExecutingUltimate(true);

            // Capturer la direction actuelle au moment où on presse la touche
            const ultimateDirection = direction;

            // Afficher l'overlay de l'ultime
            setShowUltimateOverlay(true);

            // Jouer le son de l'ultime
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
                setAttackType("ultimateCharge");
                setCurrentFrame(0);
                setUltimateCooldown(30000);

                // Phase 1: Charge pendant 600ms
                setTimeout(() => {
                  console.log(
                    "Transition vers Rush, direction:",
                    ultimateDirection
                  );
                  setAttackType("ultimateRush");
                  setCurrentFrame(0);

                  // Utiliser la direction capturée au début
                  const rushDirection = ultimateDirection === "right" ? 1 : -1;

                  // Phase 2: Rush automatique
                  let rushDistance = 0;
                  const maxRushDistance = 220;
                  const rushSpeed = 10;

                  const rushInterval = setInterval(() => {
                    setCurrentPosition((prev) => {
                      rushDistance += rushSpeed;

                      if (rushDistance >= maxRushDistance) {
                        clearInterval(rushInterval);

                        // Phase 3: Création de la boule d'énergie
                        const finalX = prev.x + (rushDirection > 0 ? 80 : -80);
                        const finalY = prev.y - 40;

                        setEnergyBallPosition({
                          x: finalX,
                          y: finalY,
                        });
                        setEnergyBallActive(true);
                        setEnergyBallFrame(0);

                        // Animation de la boule d'énergie (sans déplacement)
                        const ballInterval = setInterval(() => {
                          setEnergyBallFrame(
                            (f) => (f + 1) % frames.energyBall.length
                          );
                        }, 50);

                        // Fin de l'attaque
                        setTimeout(() => {
                          clearInterval(ballInterval);
                          setEnergyBallActive(false);
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
                        }, 2000);
                      }

                      return {
                        ...prev,
                        x: prev.x + rushSpeed * rushDirection,
                      };
                    });
                  }, 16);
                }, 600);
              }, 2000);
            });

            // En cas d'erreur de chargement du son
            audio.addEventListener("error", () => {
              console.error("Erreur lors du chargement du son ultime");
              // Fallback sur la durée de l'animation
              const animationDuration = frames.ultimateRush.length * 150;

              setTimeout(() => {
                setShowUltimateOverlay(false);
                setIsAttacking(true);
                setAttackType("ultimate");
                setCurrentFrame(0);
                setUltimateCooldown(30000);

                setTimeout(() => {
                  setIsAttacking(false);
                  setAttackType("normal");
                  // Débloquer les touches en cas d'erreur aussi
                  setIsExecutingUltimate(false);
                }, animationDuration);
              }, 2000);
            });
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
      isPaused,
      attackCooldown,
      ultimateCooldown,
      controls,
    ]);

    // Gestion du cooldown d'attaque
    useEffect(() => {
      if (attackCooldown > 0) {
        const cooldownInterval = setInterval(() => {
          setAttackCooldown((prev) => prev - 100);
        }, 100);

        return () => clearInterval(cooldownInterval);
      }
    }, [attackCooldown]);

    // Gestion du cooldown de l'ultime
    useEffect(() => {
      if (isPaused) return;

      let interval;
      if (ultimateCooldown > 0) {
        interval = setInterval(() => {
          setUltimateCooldown((prev) => {
            const newValue = Math.max(0, prev - 100);
            console.log("Naruto cooldown:", newValue);
            return newValue;
          });
        }, 100);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [ultimateCooldown, isPaused]);

    // Vérification spécifique quand on touche le sol
    useEffect(() => {
      if (!isInAir && attackLandedOnGround) {
        setIsAttacking(false);
        setAttackType("normal");
        setAttackLandedOnGround(false);
        setCurrentFrame(0);
      }
    }, [isInAir, attackLandedOnGround]);

    // Ajouter un effet pour nettoyer le timeout de stun
    useEffect(() => {
      return () => {
        if (stunTimeout) {
          console.log("Nettoyage du stun timeout");
          clearTimeout(stunTimeout);
        }
      };
    }, [stunTimeout]);

    // Ajouter gestion de l'animation hurt quand le personnage est touché
    useEffect(() => {
      if (isHurt) {
        setIsAttacking(false);
        setAttackType("hurt");
        setCurrentFrame(0);

        // Ajouter un léger recul quand le personnage est touché
        const knockbackDirection = direction === "right" ? -5 : 5;
        setCurrentPosition((prev) => ({
          ...prev,
          x: prev.x + knockbackDirection,
        }));
      }
    }, [isHurt]);

    // Détermination des frames actuelles
    const getCurrentFrames = () => {
      if (isHurt) return frames.hurt;
      if (isAttacking) {
        if (attackType === "punch") return frames.punch;
        if (attackType === "kickDown") return frames.kickDown;
        if (attackType === "rushAttack") return frames.rushAttack;
        if (attackType === "downAttack") return frames.downAttack;
        if (attackType === "upAttack") return frames.upAttack;
        if (attackType === "airAttack") return frames.airAttack;
        if (attackType === "powerAttack") return frames.powerAttack;
        if (attackType === "ultimateCharge") return frames.ultimateCharge;
        if (attackType === "ultimateRush") return frames.ultimateRush;
        return frames.attack;
      }

      if (isJumping) return frames.jump;
      if (isStopping) return frames.idle;
      if (isRunning) return frames.run;
      if (isMoving) return frames.walk;
      return frames.idle;
    };

    // Récupérer les frames actuelles au moment du rendu
    const currentFrames = getCurrentFrames();
    const currentSprite = currentFrames[currentFrame] || currentFrames[0];

    useEffect(() => {
      // Mettre à jour les positions initiales si elles changent
      setPosX(position.x);
      setPosY(position.y);
    }, [position.x, position.y]);

    console.log("Type d'attaque actuel:", attackType);
    console.log("Frame actuelle:", currentFrame);

    return (
      <>
        {console.log(
          "Rendu de Naruto:",
          currentPosition,
          currentSprite,
          "Type d'attaque:",
          attackType,
          "Frame:",
          currentFrame
        )}

        {/* Sprite Naruto grossi et avancé */}
        <div
          className="naruto-sprite"
          style={{
            left: `${currentPosition.x}px`,
            top: `${currentPosition.y}px`,
            backgroundPosition: `${currentSprite.x}px ${currentSprite.y}px`,
            width: `${currentSprite.width}px`,
            height: `${currentSprite.height}px`,
            transform:
              direction === "left" ? "scaleX(-1) scale(2.5)" : "scale(2.5)",
            transformOrigin: "center bottom",
            zIndex: 100,
          }}
        />

        {/* Boule d'énergie */}
        {energyBallActive && (
          <div
            className="naruto-sprite"
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
              filter: "brightness(1.2) drop-shadow(0 0 8px #f7b733)",
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

export default Naruto;
