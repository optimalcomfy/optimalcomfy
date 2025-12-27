import { useState, useEffect, useCallback } from 'react';

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState({
    online: true,
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    type: 'unknown'
  });

  const [isSlow, setIsSlow] = useState(false);

  const updateNetworkInfo = useCallback(() => {
    const state = {
      online: navigator.onLine,
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      type: 'unknown'
    };

    // Check if Network Information API is supported
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      if (connection) {
        state.effectiveType = connection.effectiveType || '4g';
        state.downlink = connection.downlink || 10;
        state.rtt = connection.rtt || 50;
        state.saveData = connection.saveData || false;
        state.type = connection.type || 'unknown';
      }
    }

    setNetworkState(state);
    
    // Determine if connection is slow
    const slowConnections = ['slow-2g', '2g', '3g'];
    const isSlowConnection = slowConnections.includes(state.effectiveType) || 
                            state.saveData || 
                            (state.downlink && state.downlink < 1);
    setIsSlow(isSlowConnection);
  }, []);

  useEffect(() => {
    // Initial update
    updateNetworkInfo();

    // Online/Offline events
    const handleOnline = () => {
      setNetworkState(prev => ({ ...prev, online: true }));
      updateNetworkInfo();
    };

    const handleOffline = () => {
      setNetworkState(prev => ({ ...prev, online: false }));
      setIsSlow(true);
    };

    // Network change events
    const handleConnectionChange = () => {
      updateNetworkInfo();
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator && navigator.connection) {
      navigator.connection.addEventListener('change', handleConnectionChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator && navigator.connection) {
        navigator.connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkInfo]);

  return {
    ...networkState,
    isSlow,
    isOnline: networkState.online,
    getOptimalImageSource: (imageData) => {
      if (!imageData) return null;
      
      if (isSlow || networkState.saveData) {
        return imageData.thumbnail_url || (imageData.thumbnail ? `/storage/${imageData.thumbnail}` : null);
      }
      return imageData.image_url || (imageData.image ? `/storage/${imageData.image}` : null);
    }
  };
};