import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Creator from './pages/Creator';
import PublicProfile from './pages/PublicProfile';
import EditProfile from './pages/EditProfile';
import MediaDetailPage from './pages/MediaDetailPage';
import Landing from './pages/Landing';
import FAQ from './pages/FAQ';
import Features from './pages/Features';
import Account from './pages/Account';
import Letters from './pages/Letters';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Creator />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/features" element={<Features />} />
      <Route path="/account" element={<Account />} />
      <Route path="/letters" element={<Letters />} />
      <Route path="/s/:id" element={<PublicProfile />} />
      <Route path="/s/:id/edit" element={<EditProfile />} />
      <Route path="/s/:id/:mediaType/:itemSlug" element={<MediaDetailPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App