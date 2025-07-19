import { TOKENS } from "../utils/contants";
import { Asset } from "../utils/types";

export async function tokensPrices() {
  const url = "https://stablecoins.llama.fi/stablecoins?includePrices=true";
  const data = await fetch(url);
  const json = await data.json();
  const assets: Asset[] = json.peggedAssets;

  const prices: Asset[] = assets
    .filter((asset) => TOKENS.find((token) => token.symbol === asset.symbol))
    .map((asset) => ({
      symbol: asset.symbol,
      price: asset.price,
    }));

  return { prices: prices };
}
