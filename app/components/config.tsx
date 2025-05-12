import { useCallback, useEffect, useState } from "react";
import { ConfigType } from "../page";
import { CURRENCIES, Currency, Token, TOKENS } from "../utils/contants";
import { shortAddress } from "../utils/shortAddress";
import Modal from "./modal";
import Dropdown from "./dropdown";

export type ConfigProps = {
  config: ConfigType | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (
    account: string,
    currency: Currency,
    token: Token,
    buffer: string
  ) => void;
};

export const pasteIcon = (
  <svg
    data-slot="icon"
    fill="none"
    strokeWidth="1.5"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
    ></path>
  </svg>
);

export default function Config({
  config,
  open,
  setOpen,
  onSubmit,
}: ConfigProps) {
  const [account, setAccount] = useState("");
  const [buffer, setBuffer] = useState("");
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [token, setToken] = useState<Token>(TOKENS[0]);

  const onPaste = useCallback(async () => {
    const value = await navigator.clipboard.readText();
    setAccount(value);
  }, [setAccount]);

  const onInputChange = useCallback(
    (value: string) => {
      const re = new RegExp("^[+]?([0-9]+([.][0-9]*)?|[.][0-9]+)$");
      if (value === "" || re.test(value)) {
        setBuffer(value);
      }
      return false;
    },
    [setBuffer]
  );

  useEffect(() => {
    if (config) {
      setAccount(config.account);
      setBuffer(config.buffer);
      setCurrency(
        CURRENCIES.find((currency) => currency.name === config.currency.name) ||
          CURRENCIES[0]
      );
    }
  }, [config, setAccount, setBuffer, setCurrency]);

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">
          Preview purchase card configuration
        </h2>
        <p className="text-sm text-gray-400">
          You can review the details before proceeding with previews.
        </p>
        <div className="flex flex-col gap-1 mt-4">
          <div className="flex items-center gap-2">
            <label htmlFor="amount" className="text-white/70">
              Account Address
            </label>
            <button
              onClick={onPaste}
              className="flex items-center justify-center w-8 h-full text-white/70 text-sm transition-all hover:scale-105 hover:text-white"
            >
              {pasteIcon}
            </button>
          </div>
          <span>
            {shortAddress(
              account || "0x00000000000000000000000000000000000000000"
            )}
          </span>
          <div className="w-full relative"></div>
        </div>
        <div className="flex items-center gap-4">
          <Dropdown
            title="USD Quote For"
            items={CURRENCIES}
            selected={currency.option}
            onSelect={(e) => {
              setCurrency(
                CURRENCIES.find((currency) => currency.name === e) ||
                  CURRENCIES[0]
              );
            }}
          />

          <Dropdown
            title="Token Balance"
            items={TOKENS}
            selected={token.option}
            onSelect={(e) => {
              setToken(TOKENS.find((token) => token.name === e) || TOKENS[0]);
            }}
          />
        </div>
        <div className="flex flex-col gap-2 mt-4 w-full">
          <label htmlFor="amount" className="text-white/70">
            Conservative Buffer
          </label>
          <div className="w-full relative">
            <input
              type="text"
              id="amount"
              className="border rounded-md p-2 w-full outline-none text-white border-white/70 h-[40px]  focus:bg-black/10"
              placeholder="e.g $10.00"
              value={buffer}
              onChange={(e) => onInputChange(e.target.value)}
              autoComplete="off"
            />
            <span className="absolute top-0 right-2 flex items-center justify-center w-8 h-full text-white/70 text-sm">
              USD
            </span>
          </div>
        </div>

        <button
          onClick={() => onSubmit(account, currency, token, buffer)}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
