import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook to monitor network connectivity status
 * @returns {Object} Network status information
 */
export const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        type: state.type,
      });
    });

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? true,
        isInternetReachable: state.isInternetReachable ?? true,
        type: state.type,
      });
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
};

