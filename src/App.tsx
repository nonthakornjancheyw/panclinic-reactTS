import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Finance from './pages/finance/financePage';
import Page1 from './pages/Page1';
import ProductAdminTable from './pages/productAdmin/productAdminPage';
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
        path="/about"
        element={<AppLayout hasUnsavedChanges={unsavedCheck}><Page1 /></AppLayout>}
      />
      <Route
        path="/productAdmin"
        element={
          <AppLayout hasUnsavedChanges={unsavedCheck}>
            <ProductAdminTable setHasUnsavedChanges={setUnsavedCheck} />
          </AppLayout>
        }
      />
    </Routes>
  );
}

export default App;
