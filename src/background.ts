import { CrossBrowserAPI } from '@pechext/extension-essentials-lib';
import { MESSAGES } from './constants';
import { BadgeManager } from './badge';

function onMessage(message: Message, sender: any, sendResponse: (response?: any) => void) {
  if (message.name === MESSAGES.ON_AD_REMOVED) {
    BadgeManager.increment(sender.tab.id as number);
  }
  return false;
};

CrossBrowserAPI.runtime.onMessage.addListener(onMessage);