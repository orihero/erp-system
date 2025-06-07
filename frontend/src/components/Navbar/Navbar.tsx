import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                ERP System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {t('common.welcome')}
              </Link>
              <Link
                to="/receipts"
                className={`${
                  isActive('/receipts')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {t('receipts.title')}
              </Link>
              <Link
                to="/directories"
                className={`${
                  isActive('/directories')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {t('directories.title')}
              </Link>
              <Link
                to="/companies"
                className={`${
                  isActive('/companies')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {t('companies.title')}
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              to="/profile"
              className={`${
                isActive('/profile')
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              } px-3 py-2 rounded-md text-sm font-medium`}
            >
              {t('common.profile')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 