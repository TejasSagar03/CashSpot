import { useEffect, useRef } from 'react';

export function useProximityHaptics(distanceInMeters) {
  // useRef keeps track of the last vibration zone WITHOUT triggering re-renders
  const lastVibratedZone = useRef(null);

  useEffect(() => {
    // 1. Safety check: Ensure distance exists and hardware supports vibration
    if (distanceInMeters === null || distanceInMeters === undefined || !('vibrate' in navigator)) {
      return;
    }

    // 2. Define the trigger thresholds
    if (distanceInMeters <= 5 && lastVibratedZone.current !== 'arrival') {
      // ARRIVAL (Under 5 meters): One long, solid pulse
      navigator.vibrate([800]); 
      lastVibratedZone.current = 'arrival';
      console.log('[HAPTIC] Zone: Arrival');
    } 
    else if (distanceInMeters <= 20 && distanceInMeters > 5 && lastVibratedZone.current !== '20m') {
      // CLOSE (20 meters out): Double quick pulse (vibrate, pause, vibrate)
      navigator.vibrate([100, 50, 100]); 
      lastVibratedZone.current = '20m';
      console.log('[HAPTIC] Zone: 20m Close');
    } 
    else if (distanceInMeters <= 50 && distanceInMeters > 20 && lastVibratedZone.current !== '50m') {
      // APPROACHING (50 meters out): Single short pulse
      navigator.vibrate([100]); 
      lastVibratedZone.current = '50m';
      console.log('[HAPTIC] Zone: 50m Approach');
    }
    else if (distanceInMeters > 50) {
      // RESET: If the user walks away, clear the zone so it can trigger again later
      lastVibratedZone.current = null;
    }
  }, [distanceInMeters]); // This effect only runs when the distance number changes
}