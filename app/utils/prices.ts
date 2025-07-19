import { tokensPrices } from "../api/defillama";
import { fiatPrice } from "../api/frankfuter";
import { Asset } from "./types";

enum FeeOperation {
  add,
  deduct,
}
export function manageFees(
  amount: number,
  buffer: number,
  operation: FeeOperation
) {
  // Deduct the swap fee of 0.875%
  const swapFee = amount * 0.00875;
  // Deduct the Linea gas fee, which is typically $0.02
  const gasFee = 0.02;

  // Return the amount after deducting fees
  return operation === FeeOperation.add
    ? amount + swapFee + gasFee + buffer
    : amount - swapFee - gasFee - buffer;
}

// Find the token in the assets array by its symbol
export function tokenPriceInUSD(assets: Asset[], symbol: string) {
  const token = assets.find((asset) => asset.symbol === symbol);
  return token ? token.price : 0;
}

// Get the fiat price of a token amount in a specific currency
export async function tokenToFiat(amount: number, tokenPriceInFiat: number) {
  if (tokenPriceInFiat === 0) return 0;

  // Return calculation of the price in fiat currency
  const fiatPrice = amount * tokenPriceInFiat;
  return fiatPrice;
}

export async function fiatToToken(
  amount: number,
  tokenPriceInFiat: number,
  buffer: number,
  applyFees: boolean
) {
  if (tokenPriceInFiat === 0) return 0;

  // Return calculation of the price in token amount
  const tokenAmount = amount / tokenPriceInFiat;
  return applyFees
    ? manageFees(tokenAmount, buffer, FeeOperation.add)
    : tokenAmount;
}

export async function getPrices(currencyName: string, currencySymbol: string) {
  const fiatPriceInUSD = await fiatPrice(currencyName);
  const { prices } = await tokensPrices();
  const _tokenPriceInUSD = tokenPriceInUSD(prices, currencySymbol);
  const tokenPriceInFiat = _tokenPriceInUSD * fiatPriceInUSD;

  return {
    fiatPriceInUSD,
    tokenPriceInUSD: _tokenPriceInUSD,
    tokenPriceInFiat: tokenPriceInFiat,
    fiatPriceInToken: _tokenPriceInUSD / fiatPriceInUSD,
  };
}

export async function maxFiat(
  balance: number,
  tokenPriceInFiat: number,
  buffer: number,
  applyFees: boolean
) {
  console.log(balance, tokenPriceInFiat, buffer, applyFees);
  const tokenAmount = applyFees
    ? manageFees(balance, buffer, FeeOperation.deduct)
    : balance;

  const fiatAmount = await tokenToFiat(tokenAmount, tokenPriceInFiat);
  return fiatAmount;
}
