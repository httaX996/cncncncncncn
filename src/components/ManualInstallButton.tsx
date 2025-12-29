import { useEffect, useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { BeforeInstallPromptEvent } from '../types/pwa';

export const ManualInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Debug PWA criteria
    console.log('PWA Install Criteria Check:', {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasBeforeInstallPrompt: 'BeforeInstallPromptEvent' in window,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      isIOSStandalone: (navigator as any).standalone,
      isAndroidInstalled: document.referrer.includes('android-app://'),
      lastPromptTime: localStorage.getItem('pwaPromptDismissed'),
      isInstalled: localStorage.getItem('pwaInstalled') === 'true'
    });

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      console.log('beforeinstallprompt event triggered', e);
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone || localStorage.getItem('pwaInstalled') === 'true') {
      setIsInstallable(false);
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('Manual install button clicked');
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return;
    }

    try {
      console.log('Triggering installation prompt');
      await deferredPrompt.prompt();
      console.log('Installation prompt displayed');
      
      const result = await deferredPrompt.userChoice;
      console.log('User choice:', result.outcome);
      
      if (result.outcome === 'accepted') {
        console.log('Installation accepted');
        localStorage.setItem('pwaInstalled', 'true');
        setIsInstallable(false);
      } else {
        console.log('Installation declined');
      }
      setDeferredPrompt(null);
    } catch (err) {
      const error = err as Error;
      console.error('Error during installation:', error);
      // Log detailed error info
      console.error({
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        deferredPromptState: deferredPrompt ? 'exists' : 'null'
      });
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstallClick}
      className="p-2 hover:text-primary transition-colors rounded-full hover:bg-white/10 relative group"
      aria-label="Install app"
    >
      <FaDownload className="text-xl" />
      <div className="absolute right-0 top-full mt-2 w-32 bg-black/90 text-white text-xs rounded-md py-1 px-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Install Desktop App
      </div>
    </button>
  );
};