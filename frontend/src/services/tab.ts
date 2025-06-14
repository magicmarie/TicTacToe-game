export const getTabId = (): string => {
  let tabId = sessionStorage.getItem('ttt-tab-id');

  if (!tabId) {
    tabId = crypto.randomUUID();
    sessionStorage.setItem('ttt-tab-id', tabId);
  }

  return tabId;
};
