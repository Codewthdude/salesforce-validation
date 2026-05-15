import { Navigate } from 'react-router-dom';
import LoginButton from '../components/LoginButton';

const LoginPage = ({ isAuthenticated, isCheckingAuth, login, authError }) => {
  if (!isCheckingAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-salesforce-gray px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-soft">
        <img src="/salesforce-logo.svg" alt="Salesforce" className="mx-auto h-20 w-28" />
        <h1 className="mt-6 text-2xl font-bold text-gray-950">
          Salesforce Validation Rule Manager
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          Manage Account validation rules directly from your browser
        </p>

        {authError ? (
          <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-800">
            {authError}
          </p>
        ) : null}

        <div className="mt-7">
          <LoginButton onClick={login} disabled={isCheckingAuth} />
        </div>

        <p className="mt-6 text-xs font-medium text-gray-500">
          Powered by Salesforce OAuth 2.0 + Tooling API
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
