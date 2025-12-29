/// <reference lib="webworker" />

declare global {
  interface ServiceWorkerGlobalScope {
    __WB_MANIFEST: Array<{
      revision: string | null;
      url: string;
    }>;
  }
}

export {};