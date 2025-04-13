import { useState, useEffect } from 'react';
import { Box, Button, Flex, Text, VStack, useToast, Progress, Select, HStack, IconButton, Container, Center, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Image } from '@chakra-ui/react';
import axios from 'axios';
import { FaVolumeUp, FaVolumeMute, FaTrophy, FaSadTear, FaRedo } from 'react-icons/fa';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const PokemonGame = () => {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [battleHistory, setBattleHistory] = useState([]);
  const [difficulty, setDifficulty] = useState('normal');
  const [isMuted, setIsMuted] = useState(false);
  const [battleAnimation, setBattleAnimation] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const { isOpen: isWinOpen, onOpen: onWinOpen, onClose: onWinClose } = useDisclosure();
  const { isOpen: isLossOpen, onOpen: onLossOpen, onClose: onLossClose } = useDisclosure();
  const toast = useToast();

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const particlesOptions = {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: "#ffd700"
      },
      shape: {
        type: "star"
      },
      opacity: {
        value: 0.5,
        random: true
      },
      size: {
        value: 3,
        random: true
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#ffd700",
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
        bounce: false
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse"
        },
        onclick: {
          enable: true,
          mode: "push"
        },
        resize: true
      }
    },
    retina_detect: true
  };

  const playSound = (sound) => {
    if (!isMuted) {
      const audio = new Audio(sound);
      audio.play();
    }
  };

  const getRandomPokemon = async () => {
    const maxId = difficulty === 'easy' ? 151 : difficulty === 'normal' ? 251 : 898;
    const id = Math.floor(Math.random() * maxId) + 1;
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return response.data;
  };

  const calculateTypeAdvantage = (type1, type2) => {
    // Simplified type advantage system
    const typeChart = {
      fire: { grass: 2, water: 0.5 },
      water: { fire: 2, grass: 0.5 },
      grass: { water: 2, fire: 0.5 },
      electric: { water: 2, grass: 0.5 },
      normal: {}
    };

    let advantage = 1;
    if (typeChart[type1] && typeChart[type1][type2]) {
      advantage = typeChart[type1][type2];
    }
    return advantage;
  };

  const calculateScore = (pokemon) => {
    const baseScore = pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
    const typeAdvantage = calculateTypeAdvantage(
      pokemon.types[0].type.name,
      pokemon === pokemon1 ? pokemon2.types[0].type.name : pokemon1.types[0].type.name
    );
    return baseScore * typeAdvantage;
  };

  const fetchPokemon = async () => {
    setLoading(true);
    setBetPlaced(false);
    setWinner(null);
    try {
      const [poke1, poke2] = await Promise.all([
        getRandomPokemon(),
        getRandomPokemon()
      ]);
      setPokemon1(poke1);
      setPokemon2(poke2);
      playSound('/sounds/pokemon-appear.mp3');
    } catch (error) {
      toast({
        title: 'Error fetching Pokemon',
        status: 'error',
        duration: 3000,
      });
    }
    setLoading(false);
  };

  const placeBet = (selectedPokemon) => {
    setBetPlaced(true);
    setBattleAnimation(true);
    playSound('/sounds/battle.mp3');

    setTimeout(() => {
      const pokemon1Score = calculateScore(pokemon1);
      const pokemon2Score = calculateScore(pokemon2);
      const winningPokemon = pokemon1Score > pokemon2Score ? pokemon1 : pokemon2;
      setWinner(winningPokemon);
      setBattleAnimation(false);

      const isWin = selectedPokemon.id === winningPokemon.id;
      setScore(prev => ({
        ...prev,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: isWin ? prev.losses : prev.losses + 1
      }));

      setBattleHistory(prev => [{
        pokemon1: pokemon1.name,
        pokemon2: pokemon2.name,
        winner: winningPokemon.name,
        timestamp: new Date().toLocaleString()
      }, ...prev].slice(0, 5));

      if (isWin) {
        setShowWinAnimation(true);
        onWinOpen();
        playSound('/sounds/win.mp3');
      } else {
        onLossOpen();
        playSound('/sounds/lose.mp3');
      }

      toast({
        title: isWin ? 'You won!' : 'You lost!',
        description: `${winningPokemon.name.toUpperCase()} was stronger!`,
        status: isWin ? 'success' : 'error',
        duration: 3000,
      });
    }, 2000);
  };

  const resetGame = () => {
    setPokemon1(null);
    setPokemon2(null);
    setLoading(false);
    setBetPlaced(false);
    setWinner(null);
    setScore({ wins: 0, losses: 0 });
    setBattleHistory([]);
    setDifficulty('normal');
    setBattleAnimation(false);
    setShowWinAnimation(false);
    onWinClose();
    onLossClose();
  };

  const PokemonCard = ({ pokemon, onBet, isWinner }) => (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      textAlign="center"
      bg="white"
      shadow="md"
      width="300px"
      transform={battleAnimation ? 'scale(1.1)' : isWinner ? 'scale(1.1)' : 'scale(1)'}
      transition="transform 0.3s ease-in-out"
      animation={isWinner ? "shake 0.5s infinite" : "none"}
      keyframes={`
        @keyframes shake {
          0% { transform: translate(0, 0) rotate(0deg) scale(1.1); }
          25% { transform: translate(5px, 0) rotate(5deg) scale(1.1); }
          50% { transform: translate(0, 0) rotate(0deg) scale(1.1); }
          75% { transform: translate(-5px, 0) rotate(-5deg) scale(1.1); }
          100% { transform: translate(0, 0) rotate(0deg) scale(1.1); }
        }
      `}
    >
      {pokemon && (
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold" textTransform="capitalize" textAlign="center">
            {pokemon.name}
          </Text>
          <Box boxSize="200px">
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
          <Text textAlign="center">Level: {Math.floor(Math.random() * 50) + 50}</Text>
          <VStack spacing={2} width="100%">
            {pokemon.stats.map((stat, index) => (
              <Box key={index} width="100%">
                <Text fontSize="sm" textAlign="center" mb={1}>
                  {stat.stat.name}: {stat.base_stat}
                </Text>
                <Progress value={stat.base_stat} max={255} colorScheme="blue" />
              </Box>
            ))}
          </VStack>
          <Text fontWeight="bold" textAlign="center">Types:</Text>
          <HStack justify="center">
            {pokemon.types.map((type, index) => (
              <Text key={index} textTransform="capitalize" color={`${type.type.name}.500`} textAlign="center">
                {type.type.name}
              </Text>
            ))}
          </HStack>
          {!betPlaced && (
            <Button
              colorScheme="blue"
              onClick={() => onBet(pokemon)}
              isDisabled={loading}
              width="100%"
            >
              Bet on this Pokemon
            </Button>
          )}
        </VStack>
      )}
    </Box>
  );

  return (
    <Box 
      minH="100vh" 
      w="100vw" 
      position="relative"
      overflow="auto"
      bgImage="url('/images/kanto-map.png')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="100% 100%"
      bgAttachment="fixed"
      margin={0}
      padding={0}
    >
      {/* Overlay for better readability */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(to-b, rgba(0,0,0,0.8), rgba(0,0,0,0.7))"
        zIndex={1}
        margin={0}
        padding={0}
      />

      {/* Main Content */}
      <Box 
        position="relative"
        zIndex={2}
        minH="100vh"
        w="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={8}
        margin={0}
        padding={0}
      >
        <Center width="100%" height="100%">
          <Box 
            width="100%" 
            maxW="1200px" 
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            px={4}
            py={8}
          >
            <VStack 
              spacing={8} 
              width="100%" 
              align="center" 
              justify="center"
            >
              {/* Title Section */}
              <Box
                textAlign="center"
                p={6}
                borderRadius="xl"
                bg="rgba(0, 0, 0, 0.7)"
                boxShadow="xl"
                border="4px solid"
                borderColor="yellow.400"
                position="relative"
                overflow="hidden"
                backdropFilter="blur(10px)"
              >
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color="yellow.300"
                  position="relative"
                  zIndex={1}
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  Pokemon Battle Game
                </Text>
                <Text 
                  fontSize="lg" 
                  color="gray.100"
                  position="relative"
                  zIndex={1}
                  mt={2}
                >
                  Choose your Pokemon and battle!
                </Text>
              </Box>

              {/* Controls Section */}
              <HStack 
                width="100%" 
                maxW="400px"
                justify="center" 
                spacing={4}
                p={2}
                borderRadius="lg"
                bg="rgba(0, 0, 0, 0.7)"
                boxShadow="md"
                backdropFilter="blur(10px)"
              >
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  width="200px"
                  variant="filled"
                  bg="yellow.100"
                  color="black"
                  borderColor="yellow.400"
                  _hover={{ bg: "yellow.200" }}
                  size="md"
                  borderRadius="md"
                >
                  <option value="easy">Easy (Gen 1)</option>
                  <option value="normal">Normal (Gen 2)</option>
                  <option value="hard">Hard (All Gens)</option>
                </Select>
                <IconButton
                  icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label="Toggle sound"
                  colorScheme="yellow"
                  variant="solid"
                  size="md"
                  bg="yellow.400"
                  _hover={{ bg: "yellow.500" }}
                />
                <IconButton
                  icon={<FaRedo />}
                  onClick={resetGame}
                  aria-label="Reset game"
                  colorScheme="red"
                  variant="solid"
                  size="md"
                  bg="red.500"
                  _hover={{ bg: "red.600" }}
                />
              </HStack>

              {/* Score Section */}
              <HStack 
                spacing={4} 
                justify="center"
                p={4}
                borderRadius="lg"
                bg="rgba(0, 0, 0, 0.7)"
                boxShadow="md"
                backdropFilter="blur(10px)"
              >
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="green.300"
                  textAlign="center"
                >
                  Wins: {score.wins}
                </Text>
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="red.300"
                  textAlign="center"
                >
                  Losses: {score.losses}
                </Text>
              </HStack>

              <Button
                colorScheme="yellow"
                onClick={fetchPokemon}
                isLoading={loading}
                mb={4}
                size="lg"
                _hover={{ bg: "yellow.500" }}
              >
                Get Random Pokemon
              </Button>

              <Flex 
                gap={8} 
                wrap="wrap" 
                justify="center" 
                width="100%" 
                maxW="800px"
                align="center"
              >
                {pokemon1 && <PokemonCard 
                  pokemon={pokemon1} 
                  onBet={placeBet} 
                  isWinner={winner && winner.id === pokemon1.id} 
                />}
                {pokemon2 && <PokemonCard 
                  pokemon={pokemon2} 
                  onBet={placeBet} 
                  isWinner={winner && winner.id === pokemon2.id} 
                />}
              </Flex>

              {winner && (
                <Text fontSize="xl" fontWeight="bold" color="yellow.300" textAlign="center">
                  Winner: {winner.name.toUpperCase()}
                </Text>
              )}

              {battleHistory.length > 0 && (
                <Box 
                  width="100%" 
                  maxW="800px" 
                  mt={8}
                >
                  <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center" color="yellow.300">
                    Recent Battles
                  </Text>
                  <VStack spacing={2} align="center">
                    {battleHistory.map((battle, index) => (
                      <Box 
                        key={index} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        width="100%" 
                        textAlign="center"
                        bg="rgba(0, 0, 0, 0.7)"
                        borderColor="yellow.400"
                      >
                        <Text textAlign="center" color="gray.100">{battle.pokemon1} vs {battle.pokemon2}</Text>
                        <Text color="green.300" textAlign="center">Winner: {battle.winner}</Text>
                        <Text fontSize="sm" color="gray.400" textAlign="center">{battle.timestamp}</Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        </Center>
      </Box>

      <Modal isOpen={isWinOpen} onClose={onWinClose} isCentered>
        <ModalOverlay />
        <ModalContent 
          bg="yellow.100"
          borderRadius="xl"
          p={6}
          textAlign="center"
          animation="bounce 1s"
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={0}>
            <Particles
              id="tsparticles"
              init={particlesInit}
              options={particlesOptions}
            />
          </Box>
          <Box position="relative" zIndex={1}>
            <ModalHeader>
              <Flex direction="column" align="center" gap={4}>
                <Box
                  as={FaTrophy}
                  size="64px"
                  color="yellow.500"
                  animation="spin 1s linear infinite"
                />
                <Text fontSize="2xl" fontWeight="bold" color="yellow.700">
                  Congratulations!
                </Text>
              </Flex>
            </ModalHeader>
            <ModalBody>
              <Text fontSize="xl" mb={4}>
                You won the battle! 🎉
              </Text>
              <Text fontSize="lg" color="gray.600">
                Your Pokemon was stronger!
              </Text>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>

      <Modal isOpen={isLossOpen} onClose={onLossClose} isCentered>
        <ModalOverlay />
        <ModalContent 
          bg="red.100"
          borderRadius="xl"
          p={6}
          textAlign="center"
          animation="shake 0.5s"
        >
          <ModalHeader>
            <Flex direction="column" align="center" gap={4}>
              <Box
                as={FaSadTear}
                size="64px"
                color="red.500"
              />
              <Text fontSize="2xl" fontWeight="bold" color="red.700">
                Better Luck Next Time!
              </Text>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <Text fontSize="xl" mb={4}>
              You lost the battle... 😢
            </Text>
            <Text fontSize="lg" color="gray.600">
              Don't worry, you'll win next time!
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default PokemonGame;