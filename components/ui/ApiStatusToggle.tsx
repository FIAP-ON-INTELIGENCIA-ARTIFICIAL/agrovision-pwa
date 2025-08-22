'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function ApiStatusToggle() {
  const [isApiMode, setIsApiMode] = useState(false);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    const useMock = process.env.USE_MOCK !== 'false';
    setApiUrl(url || '');
    setIsApiMode(!!url && !useMock);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isApiMode 
          ? 'bg-emerald-600 text-white' 
          : 'bg-amber-600 text-white'
      }`}>
        {isApiMode ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>API Real</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Modo Mock</span>
          </>
        )}
      </div>
    </div>
  );
}