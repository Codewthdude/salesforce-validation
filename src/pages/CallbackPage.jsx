import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '../api/salesforceAuth';

const CallbackPage = ({ refreshAuth }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error_description') || searchParams.get('error');

      if (oauthError) {
        setError('Login failed. Please try again.');
        return;
      }

      if (!code) {
        setError('Login failed. Please try again.');
        return;
      }

      try {
        await exchangeCodeForToken(code);
        if (isMounted) {
          refreshAuth();
          navigate('/dashboard', { replace: true });
        }
      } catch (tokenError) {
        if (isMounted) {
          setError('Login failed. Please try again.');
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshAuth]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-salesforce-gray px-4">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-soft">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-gray-950">Connection failed</h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">{error}</p>
            <Link
              to="/"
              className="focus-ring mt-6 inline-flex rounded-lg bg-salesforce-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#005fb2]"
            >
              Return to Login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-salesforce-blue border-t-transparent" />
            <h1 className="mt-5 text-xl font-bold text-gray-950">Connecting to Salesforce...</h1>
            <p className="mt-3 text-sm text-gray-600">
              Exchanging your authorization code for a secure session.
            </p>
          </>
        )}
      </section>
    </main>
  );
};

export default CallbackPage;
