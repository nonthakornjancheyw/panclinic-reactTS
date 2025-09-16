import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Finance from './pages/finance/financePage';
import FirstPage from './pages/firstPage';
import ProductAdminPage from './pages/productAdmin/productAdminPage';
import LoginPage from './pages/login/LoginPage';

function App() {
  const [unsavedCheck, setUnsavedCheck] = React.useState<(() => boolean) | undefined>(undefined);

  return (
    <Routes>
      {/* default → ไป login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/finance"
        element={<AppLayout hasUnsavedChanges={unsavedCheck}><Finance /></AppLayout>}
      />
      <Route
        path="/firstPage"
        element={<AppLayout hasUnsavedChanges={unsavedCheck}><FirstPage /></AppLayout>}
      />
      <Route
        path="/productAdmin"
        element={
          <AppLayout hasUnsavedChanges={unsavedCheck}>
            <ProductAdminPage setHasUnsavedChanges={setUnsavedCheck} />
          </AppLayout>
        }
      />
    </Routes>
  );
}

export default App;
