'use client';
import { useState, useEffect } from 'react';

export type AgentStatus = 'online' | 'away' | 'offline';
export interface AgentInfo {
  status: AgentStatus;
  name: string;
  responseTime: string; // e.g. "~2 min", "14h00", "Lun–Ven 7h–18h"
}

function computeStatus(): AgentInfo {
  const nowUTC = new Date();
  const hour = (nowUTC.getUTCHours() + 1) % 24; // Cameroon = UTC+1
  const day = nowUTC.getDay(); // 0=Sun, 6=Sat

  if (day === 0 || day === 6) {
    return { status: 'offline', name: 'Équipe AGRIPOINT', responseTime: 'Lun–Ven 7h–18h' };
  }
  if (hour < 7 || hour >= 18) {
    return { status: 'offline', name: 'Équipe AGRIPOINT', responseTime: 'Lun–Ven 7h–18h' };
  }
  if (hour >= 12 && hour < 14) {
    return { status: 'away', name: 'Conseiller Expert', responseTime: 'Retour à 14h' };
  }
  return { status: 'online', name: 'Conseiller Expert', responseTime: '~5 min' };
}

export function useAgentStatus(): AgentInfo {
  const [info, setInfo] = useState<AgentInfo>(() => computeStatus());
  useEffect(() => {
    const id = setInterval(() => setInfo(computeStatus()), 60_000);
    return () => clearInterval(id);
  }, []);
  return info;
}
