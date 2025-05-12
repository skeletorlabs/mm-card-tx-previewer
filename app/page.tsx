"use client";
import { useCallback, useEffect, useState } from "react";
import { balanceOf } from "./blockchain/balanceOf";
import Config from "./components/config";
import Card from "./components/card";
import { Currency, Token, TOKENS } from "./utils/contants";
import Link from "next/link";

import { Cog8ToothIcon } from "@heroicons/react/24/outline";

export type ConfigType = {
  account: string;
  currency: Currency;
  token: Token;
  buffer: string;
};

export type TokenPrice = {
  asset: string;
  price: number;
};

export default function Home() {
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [marketRate, setMarketRate] = useState("0");
  const [effectiveRate, setEffectiveRate] = useState(0); // i.e., * 0.98
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [requiredTokenAmount, setRequiredTokenAmount] = useState(0);
  const [open, setOpen] = useState(true);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);

  const onCheckConfig = useCallback(async () => {
    const storedConfig = localStorage.getItem("config");

    if (storedConfig) {
      const jsonConfig = JSON.parse(storedConfig);
      if (!jsonConfig) return setOpen(true);

      setConfig(jsonConfig);
      setOpen(false);
    }
  }, [setConfig, setOpen]);

  const onSubmit = useCallback(
    async (
      account: string,
      currency: Currency,
      token: Token,
      buffer: string
    ) => {
      localStorage.setItem(
        "config",
        JSON.stringify({
          account: account,
          currency: currency,
          token: token,
          buffer: buffer,
        })
      );

      await onCheckConfig();
      setOpen(false);
    },
    [onCheckConfig, setOpen]
  );

  const setMax = useCallback(() => {
    if (!config || effectiveRate === 0) return;

    const buffer = parseFloat(config.buffer || "0");
    const maxSpendableFiat = (balance - buffer) * effectiveRate;

    setAmount(maxSpendableFiat.toFixed(21));
  }, [balance, effectiveRate, config]);

  const onInputChange = useCallback(
    (value: string) => {
      const re = new RegExp("^[+]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
      if (value === "" || re.test(value)) {
        setAmount(value);
      }
      return false;
    },
    [setAmount]
  );

  const onSetRequiredTokenAmount = useCallback(() => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      const token = parsedAmount / effectiveRate;
      const tokenWithBuffer = token + parseFloat(config?.buffer || "0");
      return setRequiredTokenAmount(tokenWithBuffer);
    }
    setRequiredTokenAmount(0);
  }, [amount, effectiveRate, config, setRequiredTokenAmount]);

  const getBalance = useCallback(async () => {
    if (!config) return setBalance(0);
    const data = await balanceOf(config.account, config.token.address);
    if (data) return setBalance(data);
    setBalance(0);
  }, [config, setBalance]);

  const onGetRate = useCallback(async () => {
    if (!config) return;
    const data = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${config.currency.name}`
    );
    const json = await data.json();
    const rate = json.rates[config.currency.name];
    setMarketRate(rate);
    console.log("Rate", marketRate);
    setEffectiveRate(parseFloat(rate) * (1 - 0.02));
  }, [config, marketRate, setMarketRate]);

  type Assets = {
    peggedAssets: {
      symbol: string;
      price: number;
    }[];
  };

  const onGetTokesPrices = useCallback(async () => {
    const url = "https://stablecoins.llama.fi/stablecoins?includePrices=true";
    const data = await fetch(url);
    const json: Assets = await data.json();

    const prices = json.peggedAssets
      .filter((asset) => TOKENS.find((token) => token.symbol === asset.symbol))
      .map((asset) => ({
        asset: asset.symbol,
        price: asset.price,
      }));

    setTokenPrices(prices);
  }, [setTokenPrices]);

  useEffect(() => {
    onSetRequiredTokenAmount();
  }, [amount, effectiveRate, onSetRequiredTokenAmount]);

  // Load config once on mount
  useEffect(() => {
    onCheckConfig();
    // intentionally NOT including onGetRate to avoid unnecessary re-renders
  }, [onCheckConfig]);

  // Then, when config is ready, get the rate
  useEffect(() => {
    if (config) {
      onGetRate();
      onGetTokesPrices();
      getBalance();
    }
  }, [config, onGetRate, getBalance, onGetTokesPrices]);

  return (
    <div className="flex flex-col items-center pt-[10%] relative">
      <main className="flex flex-col gap-16 items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-between w-full mb-10 text-center">
            <div className="w-max h-max">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 127 63"
                width={60}
              >
                <path
                  fill="currentColor"
                  d="M71.554 48.607v13.81h-7.072v-9.568l-8.059.945c-1.77.205-2.548.79-2.548 1.864 0 1.575 1.478 2.239 4.648 2.239 1.932 0 4.073-.29 5.963-.79l-3.66 5.225c-1.479.332-2.92.496-4.44.496-6.414 0-10.074-2.57-10.074-7.132 0-4.023 2.877-6.136 9.416-6.884l8.638-1.012c-.467-2.532-2.362-3.633-6.13-3.633-3.537 0-7.443.912-10.937 2.613l1.111-6.18c3.248-1.369 6.95-2.074 10.69-2.074 8.226 0 12.461 3.444 12.461 10.075l-.008.005ZM7.938 31.315.208 62.416h7.73l3.836-15.628 6.65 8.039h8.06l6.65-8.039 3.836 15.628h7.73l-7.73-31.105-14.518 17.388L7.934 31.311zM36.97.21 22.452 17.598 7.938.21.208 31.315h7.73l3.836-15.628 6.65 8.039h8.06l6.65-8.039 3.836 15.628h7.73zm53.17 48.107-6.25-.912c-1.562-.247-2.178-.747-2.178-1.617 0-1.41 1.52-2.032 4.647-2.032 3.62 0 6.868.747 10.283 2.364l-.862-6.094c-2.757-.995-5.922-1.491-9.212-1.491-7.688 0-11.886 2.696-11.886 7.547 0 3.776 2.303 5.889 7.196 6.636l6.335.954c1.603.248 2.261.87 2.261 1.865 0 1.41-1.478 2.074-4.481 2.074-3.948 0-8.225-.953-11.72-2.654l.7 6.094c3.003 1.122 6.91 1.785 10.57 1.785 7.896 0 12.007-2.78 12.007-7.715 0-3.94-2.303-6.057-7.4-6.8zM100.3 34.09v28.325h7.071V34.091zm15.334 15.595 9.833-10.744h-8.8l-9.296 11.114 9.912 12.356h8.925l-10.574-12.73zm-16.321-25.09c0 4.56 3.66 7.13 10.074 7.13 1.52 0 2.961-.167 4.44-.495l3.66-5.225c-1.89.496-4.031.79-5.963.79-3.166 0-4.648-.664-4.648-2.239 0-1.079.783-1.659 2.549-1.864l8.058-.945v9.567h7.072v-13.81c0-6.635-4.236-10.075-12.461-10.075-3.744 0-7.442.705-10.691 2.075l-1.112 6.178c3.495-1.701 7.401-2.613 10.937-2.613 3.769 0 5.664 1.1 6.13 3.633l-8.637 1.013c-6.539.747-9.417 2.86-9.417 6.883l.009-.004Zm-19.779-1.492c0 5.725 3.29 8.627 9.787 8.627 2.59 0 4.732-.416 6.785-1.37l.903-6.261c-1.974 1.2-3.99 1.822-6.005 1.822-3.044 0-4.402-1.243-4.402-4.023v-8.295h10.732V7.84H86.601V2.948l-13.448 7.174v3.482h6.372V23.1l.008.004Zm-6.95-2.612v1.411H53.47c.862 2.873 3.423 4.187 7.97 4.187 3.62 0 6.993-.747 9.992-2.196l-.862 6.056c-2.757 1.16-6.251 1.785-9.829 1.785-9.5 0-14.68-4.23-14.68-12.066 0-7.838 5.264-12.235 13.406-12.235s13.119 4.771 13.119 13.062l-.005-.004ZM53.378 17.09h12.086c-.637-2.751-2.732-4.188-6.08-4.188-3.349 0-5.335 1.399-6.006 4.188"
                ></path>
              </svg>
              <span className="font-bold font-mono text-xs">Preview</span>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="w-8 h-8 rounded-full text-white/70 shadow-md flex items-center justify-center transition-all hover:scale-105 hover:text-white hover:cursor-pointer"
            >
              <Cog8ToothIcon className="w-8 h-8" />
            </button>
          </div>
          <Card
            symbol={config?.token.symbol || "$"}
            account={
              config?.account || "0x00000000000000000000000000000000000000000"
            }
            balance={balance}
          />
          <div className="flex items-center justify-between w-full text-sm font-semibold">
            <span className="">
              1 {config?.token.symbol || "USDC"} ~{" "}
              {tokenPrices
                .find((e) => e.asset === config?.token.symbol)
                ?.price.toLocaleString("en-us", { maximumFractionDigits: 5 }) ||
                0}{" "}
              USD
            </span>
            <span className="">
              1 {config?.currency.name || "FIAT"} ~{" "}
              {effectiveRate.toLocaleString("en-us", {
                maximumFractionDigits: 5,
              })}{" "}
              USD
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="amount" className="text-white/70">
            Amount to spend in {config?.currency.name || "FIAT"}
          </label>
          <div className="w-full relative">
            <input
              type="text"
              id="amount"
              className={`border border-white/70 rounded-md p-2 w-full outline-none ${
                requiredTokenAmount > balance ? "text-red-500" : "text-white"
              }`}
              placeholder={`e.g. ${config?.currency.symbol || "$"} 100.00`}
              value={amount}
              onChange={(e) => onInputChange(e.target.value)}
              autoComplete="off"
            />
            {balance > 0 && (
              <div className="absolute top-0 right-2 flex items-center justify-center w-14 h-full text-white/70 text-sm">
                <button
                  onClick={setMax}
                  className="bg-blue-500 rounded-full border-none outline-none text-white p-[2px] px-3"
                >
                  Max
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${
            requiredTokenAmount > 0 ? "block" : "hidden"
          } max-w-xs text-center`}
        >
          Your transaction amount of{" "}
          <span className="font-bold">
            {Number(amount || 0).toLocaleString("en-us")}{" "}
            {config?.currency.symbol}
          </span>{" "}
          is{" "}
          <span className="font-bold">
            {requiredTokenAmount.toLocaleString("en-us")} USD
          </span>{" "}
          in your card currency
        </div>
      </main>
      <footer className="fixed bottom-10 w-full p-4 text-center text-white/70">
        <div className="flex items-center justify-center gap-1 text-sm">
          <span>Quotes from</span>
          <Link
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-all hover:underline"
          >
            Frankfuter
          </Link>
          <span>&</span>
          <Link
            href="https://defillama.com/docs/api"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-all hover:underline"
          >
            Defillama
          </Link>
        </div>
      </footer>

      {/* Modal */}
      <Config
        config={config}
        open={open}
        setOpen={setOpen}
        onSubmit={onSubmit}
      />
    </div>
  );
}
