"use client";
import { useCallback, useEffect, useState } from "react";
import { balanceOf } from "./blockchain/balanceOf";
import Config from "./components/config";
import Card from "./components/card";
import { Currency, Token } from "./utils/contants";
import Link from "next/link";
import Image from "next/image";
import { Switch } from "@headlessui/react";
import classNames from "classnames";
import { CogIcon } from "@heroicons/react/16/solid";
import { fiatToToken, getPrices, maxFiat, tokenToFiat } from "./utils/prices";

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

export type Assets = {
  peggedAssets: {
    symbol: string;
    price: number;
  }[];
};

export type Prices = {
  balance: number;
  fiatPriceInUSD: number;
  tokenPriceInUSD: number;
  tokenPriceInFiat: number;
  fiatPriceInToken: number;
};

export default function Home() {
  const [config, setConfig] = useState<ConfigType | null>(null);
  const [prices, setPrices] = useState<Prices>({
    balance: 0,
    fiatPriceInUSD: 0,
    tokenPriceInUSD: 0,
    tokenPriceInFiat: 0,
    fiatPriceInToken: 0,
  });
  const [balanceInFiat, setBalanceInFiat] = useState(0);

  const [amount, setAmount] = useState("");
  const [requiredTokenAmount, setRequiredTokenAmount] = useState(0);
  const [open, setOpen] = useState(true);
  const [isEffectiveRate, setIsEffectiveRate] = useState(false);
  const [toggleFiatPrice, setToggleFiatPrice] = useState(false);
  const [isMax, setIsMax] = useState(false);

  const onCheckConfig = useCallback(async () => {
    const storedConfig = localStorage.getItem("config");

    if (storedConfig) {
      const jsonConfig = JSON.parse(storedConfig);
      if (!jsonConfig) return setOpen(true);

      setConfig(jsonConfig);
      setOpen(false);

      return;
    }

    setConfig(null);
    setOpen(true);
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

  const onDelete = useCallback(async () => {
    localStorage.removeItem("config");

    await onCheckConfig();
  }, [onCheckConfig]);

  const onInputChange = useCallback(
    (value: string) => {
      console.log("onInputChange", value);
      const re = new RegExp("^[+]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
      if (value === "" || re.test(value)) {
        setAmount(value);
      }
      return false;
    },
    [setAmount]
  );

  const fetchPrices = useCallback(async () => {
    if (!config) return;
    const balance = await balanceOf(config.account, config.token.address);
    const {
      fiatPriceInUSD,
      tokenPriceInUSD,
      tokenPriceInFiat,
      fiatPriceInToken,
    } = await getPrices(config.currency.name, config.token.symbol);

    setPrices({
      balance: balance,
      fiatPriceInUSD: fiatPriceInUSD,
      tokenPriceInUSD: tokenPriceInUSD,
      tokenPriceInFiat: tokenPriceInFiat,
      fiatPriceInToken: fiatPriceInToken,
    });
  }, [config, setPrices]);

  const setMax = useCallback(async () => {
    setIsMax(true);
    const maxAmount = await maxFiat(
      prices.balance,
      prices.tokenPriceInFiat,
      Number(config?.buffer),
      isEffectiveRate
    );

    console.log(maxAmount);

    setAmount(maxAmount.toString());
    setIsMax(false);
  }, [config, isEffectiveRate, prices, maxFiat, setAmount, setIsMax]);

  const onSetRequiredTokenAmount = useCallback(async () => {
    if (Number(amount) === 0) return setRequiredTokenAmount(0);

    const _amount = await fiatToToken(
      Number(amount),
      prices.tokenPriceInFiat,
      Number(config?.buffer || "0"),
      isEffectiveRate
    );
    setRequiredTokenAmount(_amount);
  }, [amount, prices, isEffectiveRate, tokenToFiat, setRequiredTokenAmount]);

  useEffect(() => {
    if (!isMax) onSetRequiredTokenAmount();
  }, [amount, isMax, onSetRequiredTokenAmount]);

  const fetchBalanceInFiat = useCallback(async () => {
    if (!config) return;
    const _balanceInFiat = await tokenToFiat(
      prices.balance,
      prices.tokenPriceInFiat
    );

    setBalanceInFiat(_balanceInFiat);
  }, [config, prices, tokenToFiat, setBalanceInFiat]);

  useEffect(() => {
    fetchBalanceInFiat();
  }, [prices.fiatPriceInUSD > 0]);

  useEffect(() => {
    setAmount("");
  }, [isEffectiveRate, setAmount]);

  // Load config once on mount
  useEffect(() => {
    onCheckConfig();
    // intentionally NOT including onGetFiatPrice to avoid unnecessary re-renders
  }, [onCheckConfig]);

  // Then, when config is ready, get the rate
  useEffect(() => {
    if (config) {
      fetchPrices();
    }
  }, [config, fetchPrices]);

  console.log("requiredTokenAmount", requiredTokenAmount);

  return (
    <div className="flex flex-col items-center justify-between pt-[5%] xl:pt-[2%] relative min-h-screen">
      <main className="flex flex-col gap-10 items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col gap-2 justify-center items-center w-full mb-12 relative">
            <div className="flex items-center justify-center bg-gray-900 border border-white/10 rounded-full shadow-xl shadow-black p-2 xl:p-1 w-24 h-24 xl:w-30 xl:h-30">
              <Image
                src="/icons/maskable2.png"
                width={90}
                height={90}
                alt="logo"
                className="rounded-full xl:w-[100px] xl:h-[100px]"
              />
            </div>

            <div className="flex flex-col text-center">
              <span className="font-bold text-2xl xl:text-3xl">
                Purchase Previewer
              </span>
              <span className="text-sm xl:text-lg text-white/90 mt-[-2px]">
                Your Metamask purchasing previewer
              </span>
            </div>
          </div>
          <div className="relative">
            <Card
              symbol={config?.token.symbol || "$"}
              account={
                config?.account || "0x00000000000000000000000000000000000000000"
              }
              balance={prices.balance}
              fiatBalance={balanceInFiat}
              fiatSymbol={config?.currency.symbol || "USD"}
              displayFiat={toggleFiatPrice}
              setDisplayFiat={setToggleFiatPrice}
            />
            <button
              onClick={() => setOpen(true)}
              className="absolute top-1 xl:top-2 right-1 xl:right-2 w-8 h-8 rounded-full text-white/70 flex items-center justify-center transition-all hover:scale-105 hover:text-white hover:cursor-pointer"
            >
              <CogIcon className="w-6 h-6 xl:w-8 xl:h-8 transition-colors text-black/70 hover:text-black/60 drop-shadow-lg " />
            </button>
          </div>

          <div className="flex items-center justify-between w-full text-xs xl:text-sm font-thin tracking-tighter">
            <button onClick={() => setToggleFiatPrice(!toggleFiatPrice)}>
              1 {toggleFiatPrice ? config?.currency.name : config?.token.symbol}{" "}
              ~{" "}
              {Number(
                toggleFiatPrice
                  ? prices.fiatPriceInToken
                  : prices.tokenPriceInFiat
              ).toLocaleString("en-us", {
                maximumFractionDigits: 4,
              })}{" "}
              {toggleFiatPrice ? config?.token.symbol : config?.currency.name}
            </button>

            <div className="flex items-center gap-2 text-neutral-400">
              <span>
                {isEffectiveRate ? "With Fees & Buffer" : "Raw Values"}
              </span>
              <Switch
                checked={isEffectiveRate}
                onChange={setIsEffectiveRate}
                className="group relative flex h-[19px] w-9 items-center cursor-pointer rounded-full bg-white/10 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-white/10 border border-white/10 data-focus:outline data-focus:outline-white"
              >
                <span
                  aria-hidden="true"
                  className={classNames({
                    "pointer-events-none inline-block size-[14px] translate-x-0 rounded-full shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-[14px]":
                      true,
                    "bg-white": !isEffectiveRate,
                    "bg-blue-400": isEffectiveRate,
                  })}
                />
              </Switch>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full font-thin text-sm xl:text-lg">
          <label htmlFor="amount" className="text-neutral-400">
            Amount to spend in {config?.currency.name || "FIAT"}
          </label>

          <div className="w-full relative">
            <input
              type="text"
              id="amount"
              className={`border border-white/10 bg-white/10 rounded-md p-2 w-full outline-none ${
                requiredTokenAmount > prices.balance
                  ? "text-red-500"
                  : "text-white"
              }`}
              placeholder={`e.g. ${config?.currency.symbol || "$"} 100.00`}
              value={amount}
              onChange={(e) => onInputChange(e.target.value)}
              autoComplete="off"
            />
            {prices.balance > 0 && (
              <div className="absolute top-0 right-2 flex items-center justify-center w-14 h-full text-white/70 text-sm xl:text-lg">
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
          } max-w-[360px] text-center mt-[-20px]`}
        >
          <div className="flex justify-center items-center gap-2 text-2xl xl:text-3xl">
            <div className="flex items-center gap-1">
              <span>{config?.currency.symbol || "USD"}</span>
              <span>
                {Number(amount || 0).toLocaleString("en-us", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {" ~ "}
            <div
              className={classNames({
                "flex items-center gap-1 font-bold": true,
                "text-red-500": requiredTokenAmount > prices.balance,
              })}
            >
              <span>{requiredTokenAmount.toLocaleString("en-us")}</span>
              <span>{config?.token.symbol || "USD"}</span>
            </div>
          </div>
          <p className="text-xs xl:text-sm mb-1 text-neutral-400">
            {isEffectiveRate && Number(config?.buffer || 0) > 0
              ? "**Important: You are using " +
                Number(config?.buffer).toLocaleString("en-us", {
                  maximumFractionDigits: 4,
                }) +
                " USD as buffer**"
              : "**Important: This is just the raw rate**"}
          </p>
        </div>
      </main>
      <footer className="flex flex-col w-full p-4 text-center text-white/70">
        <div className="flex items-center justify-center gap-1 text-xs xl:text-sm font-thin">
          <span>Quotes from</span>
          <Link
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/90 transition-all hover:underline"
          >
            Frankfuter
          </Link>
          <span>&</span>
          <Link
            href="https://defillama.com/docs/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/90 transition-all hover:underline"
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
        onDelete={onDelete}
      />
    </div>
  );
}
