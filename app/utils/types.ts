export type Asset = {
  symbol: string;
  price: number;
};

export type Assets = {
  peggedAssets: Asset[];
};
