import {useRef, useCallback} from 'react';
import {Platform, findNodeHandle} from 'react-native';

export function useTVFocus() {
  const ref = useRef<any>(null);

  const requestFocus = useCallback(() => {
    if (Platform.isTV && ref.current) {
      const node = findNodeHandle(ref.current);
      if (node) {
        // Request focus for TV navigation
        ref.current.setNativeProps?.({hasTVPreferredFocus: true});
      }
    }
  }, []);

  return {ref, requestFocus};
}
