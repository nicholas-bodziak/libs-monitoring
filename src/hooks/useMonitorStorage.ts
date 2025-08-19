import { useState, useEffect, useCallback } from 'react';

export interface MonitorData {
  id: string;
  user_email: string;
  tool: string;
  service_name: string;
  impact_description?: string;
  monitor_types: string[];
  monitor_links: { type: string; url: string }[];
  created_at: string;
  // Campos específicos do Zabbix
  hostGroup?: string;
  condition?: string;
  conditionName?: string;
  // Campos específicos do Datadog
  org?: string; // DEV, UAT, PRD
  technology?: string;
}

const STORAGE_KEY = 'monitors_data';

export const useMonitorStorage = () => {
  const [monitors, setMonitors] = useState<MonitorData[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMonitors(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored monitors:', error);
        setMonitors([]);
      }
    }
  }, []);

  const saveMonitor = useCallback((monitor: Omit<MonitorData, 'id' | 'created_at'>) => {
    const newMonitor: MonitorData = {
      ...monitor,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    setMonitors(currentMonitors => {
      // Check if monitor already exists to prevent duplicates
      const exists = currentMonitors.some(m => 
        m.service_name === monitor.service_name && 
        m.tool === monitor.tool &&
        Math.abs(new Date().getTime() - new Date(m.created_at).getTime()) < 5000 // within 5 seconds
      );
      
      if (exists) {
        return currentMonitors;
      }

      const updatedMonitors = [newMonitor, ...currentMonitors];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMonitors));
      return updatedMonitors;
    });
    
    return newMonitor;
  }, []);

  const clearMonitors = useCallback(() => {
    setMonitors([]);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    monitors,
    saveMonitor,
    clearMonitors,
  };
};