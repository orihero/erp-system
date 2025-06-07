import Footer from '../../components/Footer/Footer';
import LanguagePicker from '../../components/LanguagePicker/LanguagePicker';
import LoginForm from './components/LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen flex items-stretch bg-gradient-to-r from-[#f8fafc] to-[#e0e7ff]">
      {/* Left: Login Form */}
      <div className="flex flex-col justify-between w-full md:w-1/2 px-6 py-8">
        <div className="max-w-md w-full mx-auto">
          {/* <Header /> */}
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 mt-8">
            <h2 className="text-3xl font-bold mb-2">Login</h2>
            <p className="mb-6 text-gray-500">See your growth and get consulting support!</p>
            <LoginForm />
          </div>
        </div>
        <div className="flex flex-col items-center mt-8">
          <LanguagePicker />
          <Footer />
        </div>
      </div>
      {/* Right: Illustration/Marketing */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-[#6366f1] to-[#4f46e5] relative">
        {/* Replace below with your actual illustration or marketing content */}
        <div className="w-[350px] h-[350px] bg-white/10 rounded-2xl flex flex-col items-center justify-center shadow-2xl">
          <div className="bg-white rounded-xl shadow p-6 mb-4 w-60">
            <div className="font-bold text-gray-700">Rewards</div>
            <div className="flex items-center mt-2">
              <div className="w-12 h-12 rounded-full bg-gray-200 mr-3" />
              <div>
                <div className="text-xs text-gray-400">Points</div>
                <div className="font-bold text-lg text-gray-700">172,832</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 w-60">
            <div className="font-bold text-gray-700 mb-2">$162,751</div>
            <div className="text-xs text-gray-400 mb-1">Last year</div>
            <div className="w-full h-12 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="absolute bottom-16 text-white text-center w-3/4">
          <h3 className="text-2xl font-bold mb-2">Turn your ideas into reality.</h3>
          <p className="text-sm opacity-80">Consistent quality and experience across all platforms and devices.</p>
        </div>
      </div>
    </div>
  );
} 