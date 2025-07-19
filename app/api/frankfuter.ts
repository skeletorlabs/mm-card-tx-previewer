export async function fiatPrice(currencyName: string) {
  const data = await fetch(
    `https://api.frankfurter.app/latest?from=USD&to=${currencyName}`
  );
  const json = await data.json();
  const fiatPriceInUSD = Number(json.rates[currencyName]);

  return fiatPriceInUSD;
}
