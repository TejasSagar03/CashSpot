import { useState, useEffect } from 'react';

export const useBattery = () => {
  const [batteryState, setBatteryState] = useState({
    level: 100,
    charging: true,
    isCriticalPower: false
  });

  useEffect(() => {
    let batteryPromise;
    let battery;

    const updateBattery = (b) => {
      setBatteryState({
        level: Math.round(b.level * 100),
        charging: b.charging,
        isCriticalPower: !b.charging && b.level <= 0.20 // 20% threshold
      });
    };

    if ('getBattery' in navigator) {
      batteryPromise = navigator.getBattery();
      batteryPromise.then((b) => {
        battery = b;
        updateBattery(b);
        b.addEventListener('levelchange', () => updateBattery(b));
        b.addEventListener('chargingchange', () => updateBattery(b));
      });
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  return batteryState;
};