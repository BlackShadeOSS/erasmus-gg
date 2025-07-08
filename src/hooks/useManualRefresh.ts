import { useState, useCallback } from 'react';

export const useManualRefresh = () => {
    const [isManualRefreshing, setIsManualRefreshing] = useState(false);

    const triggerManualRefresh = useCallback(async (
        refreshCallback: () => Promise<void>,
        minDuration = 1500
    ) => {
        setIsManualRefreshing(true);
        
        try {
            await refreshCallback();
        } catch (error) {
            console.error('Manual refresh error:', error);
        } finally {
            // Ensure minimum duration for visual feedback
            setTimeout(() => {
                setIsManualRefreshing(false);
            }, minDuration);
        }
    }, []);

    return {
        isManualRefreshing,
        triggerManualRefresh
    };
};
