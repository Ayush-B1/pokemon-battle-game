import { ChakraProvider, Container, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PokemonGame from './components/PokemonGame';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box 
          minH="100vh" 
          w="100vw" 
          position="relative"
          overflow="auto"
          margin={0}
          padding={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Background Image with transparency */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgImage="url('/images/kanto-map.png')"
            bgPosition="center"
            bgRepeat="no-repeat"
            bgSize="100% 100%"
            bgAttachment="fixed"
            opacity={0.7}
            zIndex={0}
          />
          {/* Dark overlay with less opacity */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-b, rgba(0,0,0,0.2), rgba(0,0,0,0.1))"
            zIndex={1}
            margin={0}
            padding={0}
          />
          <Container 
            maxW="container.xl" 
            py={8} 
            position="relative" 
            zIndex={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Routes>
              <Route path="/" element={<PokemonGame />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ChakraProvider>
  )
}

export default App
