# Purchase Preview

<p>
  <img src="https://previewer.skeletorlabs.xyz/icons/maskable2.png" alt="Purchase Preview Logo" width="120" style="border-radius: 50%;" />
</p>

**Purchase Preview** is a utility dApp designed to help MetaMask Card users estimate the real cost of crypto purchases before confirming them.  
It calculates real-time fiat totals by factoring in:

- 🔁 Exchange rates
- ⛽ Network gas fees
- 🧾 On-chain transaction costs

No more surprises at checkout — just transparency and peace of mind when spending your USDC or other tokens.

## 🌍 Use Case

If you've ever used your MetaMask Card (or another crypto debit card) and ended up paying more than expected due to exchange rate shifts or gas costs, this tool gives you clarity and confidence **before you approve** a transaction.

## 🔧 Features

- 🧾 **Token-to-Fiat cost estimation**
- ⚖️ **Live exchange rate tracking**
- ⛽ **Network gas fee calculation**
- 📉 **Slippage-aware previews**
- 🌐 Support for multiple Linea EVM network
- 💳 Focused on MetaMask Card but can be extended to other crypto cards

## 🛠️ Tech Stack

- **Frontend**: Next.js + React + TailwindCSS
- **Blockchain**: Ethers.js v6 for on-chain data and gas estimations
- **Pricing API**: Frankfuter & Defillama
- **Deployment**: Vercel

## ⚠️ Disclaimer

**Purchase Preview** is a standalone estimation tool created by Skeletor Labs. It does not initiate, approve, or process any transactions, nor does it interact directly with the MetaMask Card or any third-party payment provider.

This tool is intended solely for informational purposes — to help users preview estimated costs before making a purchase. Always verify values at the point of transaction with your wallet or card provider.

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/skeletorlabs/purchase-preview.git
cd purchase-preview
```

### 2. Install dependencies

```bash
yarn install
```

### 3. Create `.env.local`

You'll need API keys for price data if using an external pricing API. Create a `.env.local` file with:

```env
NEXT_PUBLIC_LINEA_NODE_RPC_URL=https://linea-mainnet.public.blastapi.io
NEXT_PUBLIC_LINEA_USDC_ADDRESS=0x176211869cA2b568f2A7D4EE941E073a821EE1ff
```

Adjust based on your pricing source or network.

### 4. Run locally

```bash
yarn dev
```

App will be available at `http://localhost:3000`

## 📦 Build & Deploy

```bash
yarn build
```

Deploy using Vercel, Netlify, or your preferred static hosting.

## 🧪 Roadmap & Ideas

- ✅ USDC price estimation
- 🔄 Real-time gas tracker per chain
- 🌍 Multilingual UI
- 🧩 Plugin architecture for supporting other wallets or cards
- 📱 PWA support

## 🤝 Contributing

PRs and issues are welcome! Help us make crypto payments smoother for everyone.

## 🧠 Credits

Made with ❤️ by [Skeletor Labs](https://skeletorlabs.xyz)
Inspired by real-world MetaMask Card confusion.

## 📜 License

MIT
