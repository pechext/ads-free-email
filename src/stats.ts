import { IStorage, StorageItem } from '@pechext/extension-essentials-lib';

interface TabStats {
  blockedAds: number;
}

export class Stats extends StorageItem {
  tabs: { [id: number]: TabStats } = {};

  protected getKey(): string {
    return 'stats';
  }

  protected getVersion(): number {
    return 1;
  }

  static get(storage: IStorage): Stats {
    return new Stats(storage);
  }
}
