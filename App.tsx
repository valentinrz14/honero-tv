if (__DEV__) {
  require('@/config/reactotron');
}

import React, {useState} from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/lib/queryClient';
import {AppNavigator} from '@/navigation/AppNavigator';
import {SplashScreenComponent} from '@/components/SplashScreen';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreenComponent onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
};

export default App;
