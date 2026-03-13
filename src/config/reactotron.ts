import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const reactotron = Reactotron.setAsyncStorageHandler!(AsyncStorage)
  .configure({
    name: 'Hornero TV',
  })
  .useReactNative({
    asyncStorage: {ignore: ['secret']},
    networking: {
      ignoreUrls: /symbolicate/,
    },
    errors: {veto: () => false},
  })
  .connect();

// Patch console.log to also show in Reactotron
const originalLog = console.log;
console.log = (...args: any[]) => {
  originalLog(...args);
  reactotron.log!(...args);
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  originalWarn(...args);
  reactotron.warn!(args.join(' '));
};

export default reactotron;
