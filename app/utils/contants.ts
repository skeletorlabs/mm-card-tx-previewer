export type Currency = {
  name: string;
  symbol: string;
  option: string;
};

export const CURRENCIES: Currency[] = [
  {
    name: "EUR",
    symbol: "€",
    option: "EUR - €",
  },
  {
    name: "GBP",
    symbol: "£",
    option: "GBP - £",
  },
  {
    name: "JPY",
    symbol: "¥",
    option: "JPY - ¥",
  },
  {
    name: "AUD",
    symbol: "A$",
    option: "AUD - A$",
  },
  {
    name: "BRL",
    symbol: "R$",
    option: "BRL - R$",
  },
];

export type Token = {
  name: string;
  symbol: string;
  option: string;
  address: string;
};

export const TOKENS: Token[] = [
  {
    name: "USD Coin",
    symbol: "USDC",
    option: "USD Coin - USDC",
    address: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff",
  },
  {
    name: "Thether",
    symbol: "USDT",
    option: "Thether - USDT",
    address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93",
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    option: "Wrapped Ether - WETH",
    address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
  },
];
