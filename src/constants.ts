export const SECOND_MILLIS = 1000;
export const MINUTE_MILLIS = 60 * SECOND_MILLIS;

export const CHAINS = {
  SHIDEN: 336,
  SHIBUYA: 81,
  LOCALNET: 4369,
};

export const EXPLORERS = {
  [CHAINS.SHIBUYA]: 'https://shibuya.subscan.io/',
  [CHAINS.SHIDEN]: 'https://shiden.subscan.io/',
};
