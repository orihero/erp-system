import Footer from '../../components/Footer/Footer';
// import Header from '../../components/Header/Header';
import LanguagePicker from '../../components/LanguagePicker/LanguagePicker';
import SignupForm from './components/SignupForm';
import { useTranslation } from 'react-i18next';

export default function Signup() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-r from-white to-blue-100">
      <div className="flex-1 flex flex-col justify-center items-center px-4">
        {/* <Header /> */}
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">{t('signup.heading', 'Sign Up')}</h2>
          <p className="mb-6 text-gray-500">{t('signup.subtitle', 'Create your account to get started!')}</p>
          <SignupForm />
        </div>
        <div className="mt-4">
          <LanguagePicker />
        </div>
        <Footer />
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center bg-blue-700 relative">
        {/* Screenshot/visual placeholder */}
        <div className="w-3/4 h-3/4 bg-white bg-opacity-10 rounded-lg flex flex-col items-center justify-center">
          <span className="text-white text-2xl font-bold mb-4">{t('signup.screenshotPlaceholder', '[Screenshot Placeholder]')}</span>
        </div>
      </div>
    </div>
  );
} 