"use client";
import { useCallback, useEffect, useState } from "react";
import { balanceOf } from "./blockchain/balanceOf";
import Modal from "./components/modal";

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

export const pastedIcon = (
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
      d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
    ></path>
  </svg>
);

export default function Home() {
  const [account, setAccount] = useState(
    "0xcDe00Be56479F95b5e33De136AD820FfaE996009"
  );
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [marketRate, setMarketRate] = useState("5.75");
  const [buffer, setBuffer] = useState("10");
  const [effectiveRate, setEffectiveRate] = useState(0); // i.e., * 0.98
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [requiredUSDC, setRequiredUSDC] = useState(0);
  const [open, setOpen] = useState(false);

  enum InputType {
    MARKETRATE,
    BUFFER,
    AMOUNT,
  }
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
  }, [marketRate, setBalance]);

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
          <svg
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 343 215"
            xmlns="http://www.w3.org/2000/svg"
            width="360"
            // height="251"
          >
            <mask
              id="mask0_1275_4324"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="343"
              height="215"
            >
              <path
                d="M12.8217 0H330.178C337.275 0 343 5.6537 343 12.6611V202.339C343 209.346 337.275 215 330.178 215H12.8217C5.7254 215 0 209.346 0 202.339V12.6611C0 5.6537 5.7254 0 12.8217 0Z"
                fill="#FFFFFF"
              ></path>
            </mask>
            <g mask="url(#mask0_1275_4324)">
              <path
                d="M12.8217 -0.000976562H330.178C337.275 -0.000976562 343 5.65273 343 12.6601V202.338C343 209.345 337.275 214.999 330.178 214.999H12.8217C5.7254 214.999 0 209.345 0 202.338V12.6601C0 5.65273 5.7254 -0.000976562 12.8217 -0.000976562Z"
                fill="#FF5C16"
              ></path>
              <path d="M137 123H234V39H137V123Z" fill="#FFA680"></path>
              <path d="M188 215H273V-6H188V215Z" fill="#FFA680"></path>
              <path d="M272 215H332V168H272V215Z" fill="#FFA680"></path>
              <path d="M328 215H343V168H328V215Z" fill="#FFA680"></path>
              <path d="M272 168H343V77.1525L272 48V168Z" fill="#FFA680"></path>
              <path
                d="M137.047 38.978L188.092 -6.37109L217 87L137.047 38.978Z"
                fill="#FFA680"
              ></path>
              <path
                d="M137.047 122.947L188.092 168.296L217 87.5L137.047 122.947Z"
                fill="#FFA680"
              ></path>
              <path
                d="M280.343 137.998L252.885 129.955L232.201 142.139H217.767L197.043 129.955L169.625 137.998L161.279 110.247L169.625 79.4303L161.279 53.3914L169.625 21.1016L212.485 46.3442H237.483L280.343 21.1016L288.689 53.3914L280.343 79.4303L288.689 110.247L280.343 137.998Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M169.625 21.1016L212.485 46.3442L210.792 63.6636L169.625 21.1016Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M197.042 110.247L215.912 124.421L197.042 129.955V110.247Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M214.42 86.8355L210.792 63.7031L187.608 79.43L187.688 95.6346L197.083 86.8355H214.42Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M280.343 21.1016L237.483 46.3442L239.177 63.6636L280.343 21.1016Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M252.926 110.247L234.056 124.421L252.926 129.955V110.247Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M262.401 79.43L239.177 63.7031L235.548 86.8355H252.885L262.32 95.6346L262.401 79.43Z"
                fill="#FF5C16"
              ></path>
              <path
                d="M197.043 129.955L169.625 137.998L161.279 110.247H197.043V129.955Z"
                fill="#E34807"
              ></path>
              <path
                d="M214.42 86.835L219.662 120.279L212.404 101.686L187.648 95.634L197.083 86.835H214.42Z"
                fill="#E34807"
              ></path>
              <path
                d="M252.926 129.955L280.343 137.998L288.689 110.247H252.926V129.955Z"
                fill="#E34807"
              ></path>
              <path
                d="M235.548 86.835L230.306 120.279L237.564 101.686L262.32 95.634L252.885 86.835H235.548Z"
                fill="#E34807"
              ></path>
              <path
                d="M161.279 110.246L169.625 79.4297H187.567L187.648 95.6343L212.404 101.686L219.662 120.28L215.912 124.381L197.043 110.207L161.279 110.246Z"
                fill="#FF8D5D"
              ></path>
              <path
                d="M288.689 110.246L280.343 79.4297H262.401L262.32 95.6343L237.564 101.686L230.306 120.28L234.056 124.381L252.926 110.207L288.689 110.246Z"
                fill="#FF8D5D"
              ></path>
              <path
                d="M237.483 46.3438H224.984H212.485L210.792 63.6632L219.662 120.28H230.347L239.217 63.6632L237.483 46.3438Z"
                fill="#FF8D5D"
              ></path>
              <path
                d="M169.625 21.1016L161.279 53.3914L169.625 79.4303H187.567L210.792 63.7034L169.625 21.1016Z"
                fill="#661800"
              ></path>
              <path
                d="M209.219 93.5645H201.074L196.639 97.8246L212.364 101.687L209.219 93.5645Z"
                fill="#661800"
              ></path>
              <path
                d="M280.343 21.1016L288.689 53.3914L280.343 79.4303H262.401L239.177 63.7034L280.343 21.1016Z"
                fill="#661800"
              ></path>
              <path
                d="M240.749 93.5645H248.894L253.329 97.8645L237.604 101.726L240.749 93.5645Z"
                fill="#661800"
              ></path>
              <path
                d="M232.201 131.069L234.056 124.38L230.306 120.279H219.622L215.872 124.38L217.727 131.069"
                fill="#661800"
              ></path>
              <path
                d="M232.201 131.069V142.138H217.767V131.069H232.201Z"
                fill="#C0C4CD"
              ></path>
              <path
                d="M197.042 129.915L217.767 142.098V131.03L215.912 124.341L197.042 129.915Z"
                fill="#E7EBF6"
              ></path>
              <path
                d="M252.926 129.915L232.201 142.138V131.07L234.056 124.381L252.926 129.915Z"
                fill="#E7EBF6"
              ></path>
            </g>
            <mask
              id="mask0_1275_4277"
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="343"
              height="215"
            >
              <path
                d="M12.8217 0H330.178C337.275 0 343 5.6537 343 12.6611V202.339C343 209.346 337.275 215 330.178 215H12.8217C5.7254 215 0 209.346 0 202.339V12.6611C0 5.6537 5.7254 0 12.8217 0Z"
                fill="#FFFFFF"
              ></path>
            </mask>
            <g mask="url(#mask0_1275_4277)">
              <path
                d="M57.3277 43.3139V51.0778H53.2151V45.7028L48.538 46.2204C47.53 46.3399 47.0462 46.6584 47.0462 47.2556C47.0462 48.1315 47.8929 48.5297 49.7476 48.5297C50.8766 48.5297 52.1265 48.3704 53.2151 48.0917L51.0782 51.038C50.2315 51.2371 49.3847 51.3167 48.4977 51.3167C44.7883 51.3167 42.6513 49.8834 42.6513 47.2954C42.6513 45.026 44.3045 43.8315 48.0945 43.4334L53.0942 42.876C52.8119 41.4426 51.7233 40.8454 49.546 40.8454C47.4897 40.8454 45.2318 41.363 43.2158 42.3186L43.8609 38.8547C45.756 38.0982 47.8929 37.7001 50.0702 37.7001C54.8682 37.6204 57.3277 39.5713 57.3277 43.3139ZM20.4755 33.5593L16 51.0778H20.4755L22.6931 42.2788L26.5638 46.8176H31.2409L35.1116 42.2788L37.3291 51.0778H41.8046L37.2888 33.5593L28.9023 43.3538L20.4755 33.5593ZM37.2888 16.001L28.9023 25.8352L20.4755 16.001L16 33.5593H20.4755L22.6931 24.7602L26.5638 29.2991H31.2409L35.1116 24.7602L37.2888 33.5593H41.7643L37.2888 16.001ZM68.0931 43.1149L64.4643 42.5973C63.5773 42.438 63.2144 42.1593 63.2144 41.6815C63.2144 40.8852 64.1014 40.5269 65.9158 40.5269C68.0125 40.5269 69.9075 40.9649 71.8832 41.8408L71.3993 38.4167C69.7865 37.8593 67.9721 37.5806 66.0771 37.5806C61.6419 37.5806 59.1824 39.0936 59.1824 41.8408C59.1824 43.951 60.513 45.1454 63.3354 45.5834L67.0045 46.101C67.9318 46.2602 68.2947 46.5788 68.2947 47.1362C68.2947 47.9325 67.448 48.2908 65.7142 48.2908C63.416 48.2908 60.9565 47.7732 58.9405 46.7778L59.3437 50.2019C61.0775 50.8389 63.3354 51.1973 65.4723 51.1973C70.0284 51.1973 72.4073 49.6445 72.4073 46.8575C72.367 44.7473 71.0364 43.5528 68.0931 43.1149ZM73.9798 35.1121V51.0778H78.0924V35.1121H73.9798ZM82.8501 43.9112L88.5352 37.8593H83.4549L78.0521 44.1102L83.7775 51.0778H88.9787L82.8501 43.9112ZM73.4153 29.7769C73.4153 32.3649 75.5522 33.7982 79.2617 33.7982C80.1487 33.7982 80.9954 33.7186 81.8421 33.5195L83.9791 30.5732C82.8904 30.8519 81.6405 31.0112 80.5116 31.0112C78.6972 31.0112 77.8102 30.6528 77.8102 29.7371C77.8102 29.1399 78.2537 28.8213 79.302 28.7019L83.9791 28.1843V33.5593H88.0917V25.7556C88.0917 22.013 85.6322 20.0621 80.8745 20.0621C78.6972 20.0621 76.5602 20.4602 74.6652 21.2167L74.0201 24.6806C76.0361 23.7251 78.294 23.2075 80.3503 23.2075C82.5276 23.2075 83.6162 23.8445 83.8984 25.238L78.8988 25.7954C75.0684 26.313 73.4153 27.5075 73.4153 29.7769ZM61.9645 28.9408C61.9645 32.1658 63.8595 33.7982 67.6496 33.7982C69.1414 33.7982 70.3913 33.5593 71.5606 33.0417L72.0848 29.4982C70.9558 30.1751 69.7865 30.5334 68.6173 30.5334C66.8432 30.5334 66.0771 29.8167 66.0771 28.2639V23.5658H72.2864V20.301H66.0771V17.5538L58.2551 21.6149V23.5658H61.9645V28.9408ZM57.9325 27.4676V28.2639H46.8446C47.3284 29.8963 48.8203 30.613 51.4814 30.613C53.578 30.613 55.5133 30.175 57.2874 29.3788L56.8036 32.8028C55.1908 33.4399 53.1748 33.7982 51.1185 33.7982C45.635 33.7982 42.611 31.4093 42.611 26.9899C42.611 22.5704 45.6753 20.1019 50.3927 20.1019C55.0295 20.1019 57.9325 22.7695 57.9325 27.4676ZM46.8043 25.5167H53.8199C53.457 23.9639 52.2474 23.1676 50.3121 23.1676C48.3364 23.1676 47.1672 23.9639 46.8043 25.5167Z"
                fill="#661800"
              ></path>
            </g>
            <g>
              <text
                textAnchor="start"
                x="16"
                y="173"
                fontSize="32px"
                fontWeight="700"
                fill="#262833"
              >
                {balance.toLocaleString("en-us", { maximumFractionDigits: 2 })}
                <tspan dx="4" fontSize="16px" fontWeight="400" fill="#262833">
                  USDC
                </tspan>
              </text>
            </g>
            <g>
              <g>
                <text
                  x="16"
                  y="199"
                  fontSize="12px"
                  fontWeight="400"
                  fill="#262833"
                  fillOpacity="0.698"
                >
                  0xcd******6009
                </text>
              </g>
            </g>
            <path
              d="M276.571 152.431H304.392C317.979 152.431 328.987 163.3 328.987 176.718C328.987 190.135 317.979 201.005 304.392 201.005H276.571C262.983 201.005 251.976 190.135 251.976 176.718C251.976 163.3 262.983 152.431 276.571 152.431Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="10px"
            ></path>
            <path
              d="M300.319 159.199H280.563V194.236H300.319V159.199Z"
              fill="#FF5F00"
            ></path>
            <path
              d="M281.813 176.717C281.813 169.909 284.998 163.419 290.401 159.199C280.603 151.594 266.37 153.266 258.669 162.981C251.008 172.656 252.702 186.631 262.54 194.236C270.765 200.606 282.216 200.606 290.441 194.236C285.038 190.015 281.813 183.525 281.813 176.717Z"
              fill="#EB001B"
            ></path>
            <path
              d="M326.971 176.717C326.971 189.02 316.891 199.013 304.392 199.013C299.311 199.013 294.433 197.341 290.481 194.236C300.279 186.631 301.972 172.616 294.231 162.901C293.102 161.548 291.852 160.234 290.481 159.199C300.279 151.594 314.512 153.266 322.132 162.981C325.277 166.843 326.971 171.7 326.971 176.717Z"
              fill="#F79E1B"
            ></path>
            <defs></defs>
          </svg>
          <span className="flex items-center justify-end w-full text-sm font-semibold">
            1 BRL / {effectiveRate} USD
          </span>
        </div>

        <div className="flex flex-col justify-center w-full">
          <label htmlFor="amount" className="text-white/70">
            Amount to spend in BRL
          </label>
          <input
            type="text"
            id="amount"
            className={`border border-white/70 rounded-md p-2 w-full outline-none ${
              requiredUSDC > balance ? "text-red-500" : "text-white"
            }`}
            placeholder="100.00"
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
      <Modal onSubmit={() => {}} open={open} setOpen={setOpen}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold">
            Preview purchase card configuration
          </h2>
          <p className="text-sm text-gray-400">
            You can review the details before proceeding with the purchase.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <label htmlFor="amount" className="text-white/70">
              Metamask account
            </label>
            <div className="w-full relative">
              <input
                type="text"
                id="amount"
                className="border rounded-md p-2 w-full outline-none text-white border-white/70 h-[40px] text-sm"
                placeholder="0x..."
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                autoComplete="off"
              />
              <button
                onClick={onPaste}
                className="absolute top-0 right-2 flex items-center justify-center w-8 h-full text-white/70 text-sm transition-all hover:scale-105 hover:text-white"
              >
                {pasteIcon}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 mt-4">
              <label htmlFor="amount" className="text-white/70">
                USD Quote
              </label>
              <div className="w-full relative">
                <input
                  type="text"
                  id="amount"
                  className="border rounded-md p-2 w-full outline-none text-white border-white/70 h-[40px]"
                  placeholder="100.00"
                  value={marketRate}
                  onChange={(e) =>
                    onInputChange(e.target.value, InputType.MARKETRATE)
                  }
                  autoComplete="off"
                />
                <span className="absolute top-0 right-2 flex items-center justify-center w-8 h-full text-white/70 text-sm">
                  BRL
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <label htmlFor="amount" className="text-white/70">
                Conservative Buffer
              </label>
              <div className="w-full relative">
                <input
                  type="text"
                  id="amount"
                  className="border rounded-md p-2 w-full outline-none text-white border-white/70 h-[40px]"
                  placeholder="100.00"
                  value={buffer}
                  onChange={(e) =>
                    onInputChange(e.target.value, InputType.BUFFER)
                  }
                  autoComplete="off"
                />
                <span className="absolute top-0 right-2 flex items-center justify-center w-8 h-full text-white/70 text-sm">
                  USD
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
