import React, { useState } from 'react';
import ClientsTable from './components/ClientsTable';
import AddClientDrawer from './components/AddClientDrawer';
import { useTranslation } from 'react-i18next';

const Clients: React.FC = () => {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="py-6" style={{ width: '100%' }}>
      <div style={{ width: '100%', padding: '0 32px' }}>
        <div style={{ width: '100%', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 28, display: 'flex', alignItems: 'center', gap: 8 }}>
            {t('clients.title', 'Clients')}
          </div>
        </div>
        {/* Clients table/list */}
        <ClientsTable setDrawerOpen={setDrawerOpen} />
        <AddClientDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </div>
  );
};

export default Clients; 