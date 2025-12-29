import React, { useEffect, useState } from 'react';
import { useMobileDetection } from '../hooks/useMobileDetection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWAPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const isMobile = useMobileDetection();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowPrompt(false);
    }

    // Check if user previously dismissed
    const dismissedTimestamp = localStorage.getItem('pwaPromptDismissedTime');
    if (dismissedTimestamp) {
      const dismissedTime = parseInt(dismissedTimestamp, 10);
      const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;
      const now = Date.now();

      if (now - dismissedTime < tenDaysInMs) {
        setDismissed(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwaPromptDismissedTime', Date.now().toString());
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gray-900 rounded-lg p-4 shadow-lg z-50 border border-gray-700">
      <h3 className="text-xl font-semibold mb-2 text-white">
        {isMobile ? 'Install SanuFlix Lite on your mobile' : 'Install SanuFlix on your desktop'}
      </h3>
      <p className="text-gray-300 mb-4">
        {isMobile ? (
          'Install SanuFlix on your home screen for quick and easy access to your favorite content.'
        ) : (
          'Get the best streaming experience by installing SanuFlix as a desktop app.'
        )}
      </p>
      <div className="text-sm text-gray-400 mb-4">
        <h4 className="font-semibold mb-2">How to install:</h4>
        {isMobile ? (
          <ol className="list-decimal pl-4">
            <li>Tap the share button in your browser</li>
            <li>Select "Add to Home Screen" or "Install App"</li>
            <li>Follow the prompts to install</li>
          </ol>
        ) : (
          <ol className="list-decimal pl-4">
            <li>Click the install button below</li>
            <li>Click "Install" in the browser prompt</li>
          </ol>
        )}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
};