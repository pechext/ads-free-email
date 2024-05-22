import { CrossBrowserAPI, IStorage, SessionStorage } from '@pechext/extension-essentials-lib';
import { Stats } from './stats';

class _BadgeManager {
  private stats: Stats;

  constructor(storage: IStorage) {
    this.stats = Stats.get(storage);
  }

  increment = async (tabId: number) => {
    await this.stats.load();
    if (tabId in this.stats.tabs) {
      this.stats.tabs[tabId].blockedAds++;
    } else {
      this.stats.tabs[tabId] = { blockedAds: 1 };
    }
    await this.stats.save();
    this.updateBadge(tabId);
  }

  private updateBadge = (tabId: number) => {
    CrossBrowserAPI.action.setBadgeBackgroundColor({ tabId: tabId, color: '#FFC55A' });
    CrossBrowserAPI.action.setBadgeTextColor({ tabId: tabId, color: '#FFF' });
    CrossBrowserAPI.action.setBadgeText({ tabId: tabId, text: this.stats.tabs[tabId].blockedAds.toString() });
  }
}

export const BadgeManager = new _BadgeManager(new SessionStorage());