import { Navigate, Route, Routes } from 'react-router-dom';
import { useSalesforceAuth } from './hooks/useSalesforceAuth';
import CallbackPage from './pages/CallbackPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  const auth = useSalesforceAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <LoginPage
            isAuthenticated={auth.isAuthenticated}
            isCheckingAuth={auth.isCheckingAuth}
            login={auth.login}
            authError={auth.authError}
          />
        }
      />
      <Route path="/callback" element={<CallbackPage refreshAuth={auth.refreshAuth} />} />
      <Route
        path="/dashboard"
        element={
          <DashboardPage
            isAuthenticated={auth.isAuthenticated}
            isCheckingAuth={auth.isCheckingAuth}
            accessToken={auth.accessToken}
            instanceUrl={auth.instanceUrl}
            userInfo={auth.userInfo}
            logout={auth.logout}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
