import { useEffect, useState } from 'react';
import Landing from './components/Landing';
import RegistrationFlow from './components/RegistrationFlow';
import Success from './components/Success';

export default function App() {
  const [view, setView] = useState(() =>
    typeof window !== 'undefined' && window.location.hash === '#register' ? 'form' : 'landing'
  );
  const [result, setResult] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [view]);

  const start = () => {
    window.history.replaceState(null, '', '#register');
    setView('form');
  };

  const home = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setView('landing');
    setResult(null);
  };

  if (view === 'success' && result) {
    return (
      <Success
        result={result}
        onHome={home}
        onRegisterAnother={() => {
          setResult(null);
          setView('form');
          window.scrollTo({ top: 0, behavior: 'auto' });
        }}
      />
    );
  }

  if (view === 'form') {
    return (
      <RegistrationFlow
        onExit={home}
        onComplete={(payload) => {
          setResult(payload);
          setView('success');
        }}
      />
    );
  }

  return <Landing onStart={start} />;
}
