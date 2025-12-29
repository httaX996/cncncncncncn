import { useState, useEffect, FC } from 'react';
import { BeforeInstallPromptEvent } from '../types/pwa';

const InstallPWA: FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isFirefox, setIsFirefox] = useState(false);

  // Function to check browser type
  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes('firefox');
  };

  // Function to check PWA install criteria
  const checkInstallCriteria = () => {
    // Check if running in a compatible browser
    const isCompatibleBrowser = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

    // Check if not already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as any).standalone
      || document.referrer.includes('android-app://');

    // Check if not recently dismissed
    const lastPromptTime = localStorage.getItem('pwaPromptDismissed');
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const isRecentlyDismissed = lastPromptTime && (Date.now() - parseInt(lastPromptTime) <= thirtyDaysInMs);

    // Check if not already installed
    const isInstalled = localStorage.getItem('pwaInstalled') === 'true';

    return isCompatibleBrowser && !isStandalone && !isRecentlyDismissed && !isInstalled;
  };

  useEffect(() => {
    setIsFirefox(detectBrowser());

    // Track user engagement
    const startTime = Date.now();
    let interactionCount = 0;

    const trackEngagement = () => {
      interactionCount++;
      const timeSpent = Date.now() - startTime;

      if (timeSpent > 30000 && interactionCount > 0) {
        console.log('Engagement criteria met:', { timeSpent, interactionCount });
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage('USER_INTERACTION');
        }
      }
    };

    // Listen for engagement criteria met message
    const handleEngagementMessage = (event: MessageEvent) => {
      if (event.data === 'ENGAGEMENT_CRITERIA_MET') {
        console.log('Engagement criteria met, showing install prompt');
        if (checkInstallCriteria()) {
          setShowInstallButton(true);
        }
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleEngagementMessage);

    // Track interactions
    document.addEventListener('click', trackEngagement);
    document.addEventListener('touchstart', trackEngagement);
    window.addEventListener('scroll', trackEngagement);

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('Received beforeinstallprompt event', e);
      e.preventDefault();
      setDeferredPrompt(e);
      if (checkInstallCriteria()) {
        setShowInstallButton(true);
      }
    };

    // Force trigger the beforeinstallprompt event check
    if ('getInstalledRelatedApps' in navigator) {
      (navigator as any).getInstalledRelatedApps().then((apps: any[]) => {
        console.log('Installed related apps:', apps);
      }).catch((error: Error) => {
        console.log('Error checking installed apps:', error);
      });
    }

    console.log('Adding beforeinstallprompt event listener');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    // Listen for successful installation
    window.addEventListener('appinstalled', (e) => {
      console.log('App was successfully installed', e);
      localStorage.setItem('pwaInstalled', 'true');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    });

    // Check if display-mode changes to standalone
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        console.log('App is running in standalone mode');
        localStorage.setItem('pwaInstalled', 'true');
        setShowInstallButton(false);
        setDeferredPrompt(null);
      }
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      console.log('Cleaning up PWA install prompt listener');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', () => { });
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      document.removeEventListener('click', trackEngagement);
      document.removeEventListener('touchstart', trackEngagement);
      window.removeEventListener('scroll', trackEngagement);
      navigator.serviceWorker?.removeEventListener('message', handleEngagementMessage);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      console.log(`Install prompt result: ${result.outcome}`);

      if (result.outcome === 'accepted') {
        localStorage.setItem('pwaInstalled', 'true');
      }

      // Store the timestamp regardless of the outcome
      localStorage.setItem('pwaPromptDismissed', Date.now().toString());
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error during installation:', error);
      setShowInstallButton(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', Date.now().toString());
    setShowInstallButton(false);
  };

  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-black/80 backdrop-blur-md p-4 rounded-lg shadow-lg border border-gray-700 z-50">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {isFirefox ? (
            <>
              <h3 className="text-lg font-semibold mb-1">Install SanuFlix</h3>
              <p className="text-sm text-gray-300 mb-3">
                To install SanuFlix as a desktop app, please use Chrome, Edge, or another Chromium-based browser. Firefox doesn't currently support PWA installation.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://www.google.com/chrome/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  Get Chrome
                </a>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Not now
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-1">Install SanuFlix</h3>
              <p className="text-sm text-gray-300 mb-3">
                Install SanuFlix for a better experience with offline support and quick access from your home screen.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  Install
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;