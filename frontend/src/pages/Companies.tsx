import React from 'react';
import { useTranslation } from 'react-i18next';

const Companies: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {t('companies.title')}
        </h1>
      </div>
    </div>
  );
};

export default Companies; 