import { useState } from 'react';

export const useAvailabilityCheck = () => {
  const [availabilityChecks, setAvailabilityChecks] = useState({
    username: { isChecking: false, isAvailable: null as boolean | null },
    email: { isChecking: false, isAvailable: null as boolean | null },
  });

  const checkAvailability = async (
    field: 'username' | 'email',
    value: string
  ) => {
    if (!value.trim()) return;

    const valueBeingChecked = value.trim();

    setAvailabilityChecks(prev => ({
      ...prev,
      [field]: { isChecking: true, isAvailable: null },
    }));

    try {
      const response = await fetch(`/api/auth/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value: valueBeingChecked }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setAvailabilityChecks(prev => ({
        ...prev,
        [field]: { isChecking: false, isAvailable: data.available },
      }));

      return data.available;
    } catch (error) {
      console.error('Availability check error:', error);
      setAvailabilityChecks(prev => ({
        ...prev,
        [field]: { isChecking: false, isAvailable: null },
      }));
      return null;
    }
  };

  return { availabilityChecks, checkAvailability };
};