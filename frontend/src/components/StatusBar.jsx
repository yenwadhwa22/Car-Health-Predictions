import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Server, Activity, Database } from 'lucide-react';

const StatusBar = ({ apiStatus, setApiStatus }) => {
  useEffect(() => {
    const checkApi = async () => {
      const { data, error } = await apiService.checkHealth();
      if (data && data.api_status === 'healthy') {
        setApiStatus({
          online: true,
          modelLoaded: data.model_loaded,
          scalerLoaded: data.scaler_loaded
        });
      } else {
        setApiStatus(prev => ({ ...prev, online: false }));
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [setApiStatus]);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(17, 17, 26, 0.8)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(0, 245, 255, 0.2)',
      padding: '0.5rem 1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className={`pulse-dot ${apiStatus.online ? 'online' : 'offline'}`}></div>
          <span>API: {apiStatus.online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        
        {apiStatus.online && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: apiStatus.modelLoaded ? 'var(--green-success)' : 'var(--amber-warning)' }}>
              <Server size={14} />
              <span>Model: {apiStatus.modelLoaded ? 'LOADED' : 'PENDING'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: apiStatus.scalerLoaded ? 'var(--green-success)' : 'var(--amber-warning)' }}>
              <Database size={14} />
              <span>Scaler: {apiStatus.scalerLoaded ? 'LOADED' : 'PENDING'}</span>
            </div>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan-primary)' }}>
        <Activity size={14} />
        <span>SYSTEM DIAGNOSTICS v2.0</span>
      </div>
    </div>
  );
};

export default StatusBar;
