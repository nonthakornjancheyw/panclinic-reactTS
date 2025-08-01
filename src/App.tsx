import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Finance from './pages/finance/financePage';
import Page1 from './pages/Page1';
import ProdctAdmin from './pages/productAdmin/productAdminPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Finance/>} />
          <Route path="/about" element={<Page1/>} />
          <Route path="/prodctAdmin" element={<ProdctAdmin/>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
