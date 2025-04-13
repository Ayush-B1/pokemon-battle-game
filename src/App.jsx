import { ChakraProvider, Container } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PokemonGame from './components/PokemonGame';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Container maxW="container.xl" py={8}>
          <Routes>
            <Route path="/" element={<PokemonGame />} />
          </Routes>
        </Container>
      </Router>
    </ChakraProvider>
  )
}

export default App
