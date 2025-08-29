import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Finance from './pages/finance/financePage';
import Page1 from './pages/Page1';
import ProductAdminTable from './pages/productAdmin/productAdminPage';

function App() {
  // state เพื่อเก็บ callback ของ hasUnsavedChanges จาก ProductAdmin
  const [unsavedCheck, setUnsavedCheck] = React.useState<(() => boolean) | undefined>(undefined);

  return (
    <Routes>
      <Route
        path="/"
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
