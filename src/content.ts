import { AdsConfig } from './config';
import { MESSAGES } from './constants';
import { isVisibleInViewport } from './utils';
import Config from '../public/config.json';

function getFirstElementsBySelectors(root: Document | Element, selectors: string[]): Element[] {
  for (const selector of selectors) {
    const elements = Array.from(root.querySelectorAll(selector));
    if (elements && elements.length > 0) {
      return elements;
    }
  }
  return [];
};

function getFirstElementBySelectors(root: Document | Element, selectors: string[]): Element | null {
  const elements = selectors.map(selector => root.querySelector(selector));
  return elements && elements.length > 0 ? elements[0] : null;
};

function* adElements(config: AdsConfig): Generator<Element, void, unknown> {
  const rows: Element[] = getFirstElementsBySelectors(document, config.selectors.inboxRow);
  for (const row of rows) {
    const spans = getFirstElementsBySelectors(row, config.selectors.inboxRowAdIndicator);
    const isAdFound = spans.some(s => s.textContent && config.texts.inboxRowAdIndicatorText.includes(s.textContent));
    if (!isAdFound) continue;
    yield row;
  }
};

function removeAdElement(element: HTMLElement) {
  if (!isVisibleInViewport(element)) return;
  if (element.hasAttribute('ad-removed')) return;

  element.style.display = 'none';
  element.setAttribute('ad-removed', 'true');

  chrome.runtime.sendMessage({ name: MESSAGES.ON_AD_REMOVED });
};

function isPageRelevant(): boolean {
  const patterns = [
    'mail.google.com'
  ];

  const host = document.location.host;

  for (const pattern of patterns) {
    const regExp = new RegExp(pattern, 'i');
    if (regExp.test(host)) return true;
  }

  return false;
};

function tryRemoveAds(config: AdsConfig) {
  const elements = adElements(config);
  let adElement = elements.next();
  while (!adElement.done) {
    removeAdElement(adElement.value as HTMLElement);
    adElement = elements.next();
  }
};

function initObserver(config: AdsConfig): boolean {
  const mainContainer: Element | null = getFirstElementBySelectors(document, config.selectors.inboxContainer);
  if (!mainContainer) return false;

  const callback = (mutations: MutationRecord[], observer: MutationObserver) => {
    for (const mutation of mutations) {
      tryRemoveAds(config);
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(mainContainer, config.mutationObserverConfig);
  // observer.disconnect(); @TODO: When leaving the page / visibility hidden

  return true;
};

function onPageLoad() {
  if (!isPageRelevant()) return;
  let initInterval: NodeJS.Timeout | undefined = undefined;
  initInterval = setInterval(() => {
    if (!initObserver(Config.adsConfig)) return;
    initInterval && clearInterval(initInterval);
  }, 1000);
};

if (window === top) {
  onPageLoad();
};