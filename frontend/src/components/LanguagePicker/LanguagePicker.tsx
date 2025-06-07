import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: "O'zbekcha", flag: '🇺🇿' }
];

const LanguagePicker: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      // Update user preferences in the backend
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ language: languageCode })
      });

      if (!response.ok) {
        throw new Error('Failed to update language preference');
      }
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <GlobeAltIcon className="w-5 h-5 mr-2" />
          {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
          <span className="ml-2">
            {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={() => changeLanguage(language.code)}
                    className={`${
                      active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } ${
                      i18n.language === language.code ? 'bg-blue-100' : ''
                    } group flex items-center w-full px-4 py-2 text-sm`}
                  >
                    <span className="mr-2">{language.flag}</span>
                    {language.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LanguagePicker; 