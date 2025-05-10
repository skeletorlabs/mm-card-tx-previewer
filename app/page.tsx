"use client";
import { useCallback, useEffect, useState } from "react";
import { balanceOf } from "./blockchain/balanceOf";
import { InputType } from "./utils/enums";
import Config from "./components/config";
import Card from "./components/card";
import { CURRENCIES, Currency } from "./utils/contants";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [account, setAccount] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  // const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [marketRate, setMarketRate] = useState("0");
  const [buffer, setBuffer] = useState("10");
  const [effectiveRate, setEffectiveRate] = useState(0); // i.e., * 0.98
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [requiredUSDC, setRequiredUSDC] = useState(0);
  const [open, setOpen] = useState(true);

  const onPaste = async () => {
    const value = await navigator.clipboard.readText();
    setAccount(value);
  };

  const onInputChange = useCallback(
    (value: string, type: InputType) => {
      const re = new RegExp("^[+]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");

      if (value === "" || re.test(value)) {
        if (type === InputType.MARKETRATE) setMarketRate(value);
        else if (type === InputType.BUFFER) setBuffer(value);
        else if (type === InputType.AMOUNT) setAmount(value);
      }

      return false;
    },
    [setMarketRate, setBuffer, setAmount]
  );

  const onGetRate = useCallback(async () => {
    const data = await fetch(
      `https://api.frankfurter.app/latest?from=USD&to=${currency.name}`
    );
    const json = await data.json();
    const rate = json.rates[currency.name];
    setMarketRate(rate);
  }, [currency, setMarketRate]);

  useEffect(() => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0) {
      const usdc = parsedAmount / effectiveRate;
      const usdcWithBuffer = usdc + parseFloat(buffer);

      return setRequiredUSDC(usdcWithBuffer);
    }

    setRequiredUSDC(0);
  }, [amount, buffer, effectiveRate, , setRequiredUSDC]);

  const onSetRate = useCallback(async () => {
    setEffectiveRate(parseFloat(marketRate) * (1 - 0.02));
  }, [marketRate, setEffectiveRate]);

  useEffect(() => {
    onSetRate();
  }, [marketRate, buffer, onSetRate]);

  const getBalance = useCallback(async () => {
    if (account === "") return setBalance(0);

    const data = await balanceOf(account);
    if (data) return setBalance(data);
    setBalance(0);
  }, [account, setBalance]);

  useEffect(() => {
    getBalance();
  }, [account, getBalance]);

  useEffect(() => {
    onGetRate();
  }, [currency, onGetRate]);

  useEffect(() => {
    onGetRate();
  }, [onGetRate]);

  return (
    <div className="flex flex-col items-center pt-[10%] relative">
      <main className="flex flex-col gap-6 items-center">
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
              className="w-8 h-8 rounded-full text-white/70 shadow-md flex items-center justify-center transition-all hover:scale-105 hover:text-white"
            >
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                ></path>
              </svg>
            </button>
          </div>
          <Card account={account} balance={balance} />
          <span className="flex items-center justify-end w-full text-sm font-semibold">
            1 {currency.name} / {effectiveRate} USD
          </span>
        </div>

        <div className="flex flex-col justify-center w-full">
          <label htmlFor="amount" className="text-white/70">
            Amount to spend in {currency.name}
          </label>
          <input
            type="text"
            id="amount"
            className={`border border-white/70 rounded-md p-2 w-full outline-none ${
              requiredUSDC > balance ? "text-red-500" : "text-white"
            }`}
            placeholder={`e.g. ${currency.symbol} 100.00`}
            value={amount}
            onChange={(e) => onInputChange(e.target.value, InputType.AMOUNT)}
            autoComplete="off"
          />
        </div>

        <div
          className={`${
            requiredUSDC > 0 ? "block" : "hidden"
          } max-w-xs text-center`}
        >
          Your transaction amount of{" "}
          <span className="font-bold">
            {Number(amount || 0).toLocaleString("en-us")} BRL
          </span>{" "}
          is{" "}
          <span className="font-bold">
            {requiredUSDC.toLocaleString("en-us")} USD
          </span>{" "}
          in your card currency
        </div>
      </main>
      <footer className="fixed bottom-0 w-full p-4 text-center text-white/70">
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">Powered by</span>
          <Link
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all hover:scale-105"
          >
            <Image
              src="/frankfurt.png"
              alt="Frankfurter"
              width={24}
              height={24}
            />
          </Link>
        </div>
      </footer>
      <Config
        account={account}
        currency={currency}
        setCurrency={setCurrency}
        buffer={buffer}
        marketRate={marketRate}
        onInputChange={onInputChange}
        onPaste={onPaste}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
}
