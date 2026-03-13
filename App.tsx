import React, {useState} from 'react';
import {AppNavigator} from '@/navigation/AppNavigator';
import {SplashScreenComponent} from '@/components/SplashScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreenComponent onFinish={() => setShowSplash(false)} />;
  }

  return <AppNavigator />;
};

export default App;
