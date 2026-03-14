if (__DEV__) {
  require('@/config/reactotron');
}

import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {queryClient} from '@/lib/queryClient';
import {AppNavigator} from '@/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppNavigator />
    </QueryClientProvider>
  );
};

export default App;
