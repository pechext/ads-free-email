import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Stats } from '../stats';
import { SessionStorage, StorageItem } from '@pechext/extension-essentials-lib';

const rootElement = document.getElementById('popuproot');
const root = createRoot(rootElement!);

export default function Popup() {
  const [numOfAdsRemoved, setNumOfAdsRemoved] = useState<number>();

  useEffect(() => {
    const stats = Stats.get(new SessionStorage());
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs: chrome.tabs.Tab[]) => {
      if (!tabs || tabs.length === 0 || !tabs[0].id) return;

      const currentTabId = tabs[0].id;

      stats.load().then(async (stats: Stats) => {
        setNumOfAdsRemoved(stats.tabs[currentTabId].blockedAds);
      });

      stats.registerListener((storageItem: StorageItem) => {
        setNumOfAdsRemoved((storageItem as Stats).tabs[currentTabId].blockedAds);
      });
    });

    return () => {
      stats.unregisterListener();
    };
  }, []);

  return (
    <div>
      <h1>Ads Free Email (Like god intended)</h1>
      <h4>{numOfAdsRemoved} Ads Removed!</h4>
    </div>
  );
};

root.render(
  <Popup/>
);