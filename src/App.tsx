import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Finance from './pages/finance/financePage';
import Page1 from './pages/Page1';
import ProductAdmin from './pages/productAdmin/productAdminPage';

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Finance />} />
        <Route path="/about" element={<Page1 />} />
        <Route path="/productAdmin" element={<ProductAdmin />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
