import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Home from './pages/finance/financePage';
import Page1 from './pages/Page1';
import Test from './pages/finance/test';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Page1 />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
