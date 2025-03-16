"use client"; // Retain client-side directive for your presale UI

import { useRouter } from 'next/navigation'; // Correct import
import DefaultErrorPage from 'next/error';
import Head from 'next/head';
import builderConfig from '@config/builder';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WalletAdapterNetwork, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { TOKEN_PROGRAM_ID, createTransferInstruction } from "@solana/spl-token";
import '@builder.io/widgets/dist/lib/builder-widgets-async';
import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react';
import type { InferGetStaticPropsType } from 'next';

builder.init(builderConfig.apiKey);

// Replace with your program and token details
const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");
const TOKEN_MINT = new PublicKey("YOUR_TOKEN_MINT");
const PRESALE_WALLET = new PublicKey("YOUR_PRESALE_WALLET");
const RPC_ENDPOINT = "YOUR_RPC_ENDPOINT";

// Client-side Presale UI Component
function PresaleUI() {
  const TOTAL_SUPPLY = 1_000_000_000;
  const PRESALE_SUPPLY = 200_000_000;

  const [tokensSold, setTokensSold] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // State for wallet modal

  const { connection } = useConnection();
  const { wallet, publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    const fetchSaleProgress = async () => {
      try {
        setLoading(true);
        // Replace with your program's method to get tokens sold
        setTokensSold(50_000_000); // Placeholder
      } catch (error) {
        console.error("Failed to fetch sale progress:", error);
        setErrorMessage("Failed to fetch sale progress. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (connection) {
      fetchSaleProgress();
    }
  }, [connection]);

  const saleProgress = ((tokensSold / PRESALE_SUPPLY) * 100).toFixed(2);
  const tokensRemaining = PRESALE_SUPPLY - tokensSold;

  const handlePurchase = async () => {
    if (!publicKey || !wallet) {
      setErrorMessage("Please connect your wallet.");
      setIsWalletModalOpen(true); // Open wallet modal
      return;
    }

    if (!purchaseAmount || Number(purchaseAmount) <= 0) {
      setErrorMessage("Enter a valid purchase amount.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const transaction = new Transaction();
      const lamports = Number(purchaseAmount) * LAMPORTS_PER_SOL;

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PRESALE_WALLET,
          lamports: lamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      alert(`Successfully purchased ${purchaseAmount} SYNC tokens!`);
    } catch (error) {
      console.error("Purchase failed:", error);
      setErrorMessage("Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg bg-gradient-to-br from-purple-800 to-indigo-900 p-8 rounded-2xl shadow-lg"
    >
      <h3 className="text-2xl font-semibold mb-4 text-purple-200">Presale Information</h3>
      {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
      {loading && <p className="text-yellow-400 text-center mt-4">Loading...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-300">Total Supply: <span className="text-pink-400">{TOTAL_SUPPLY.toLocaleString()}</span></p>
          <p className="text-gray-300">Presale Supply: <span className="text-pink-400">{PRESALE_SUPPLY.toLocaleString()}</span></p>
        </div>
        <div>
          <p className="text-gray-300">Tokens Sold: <span className="text-pink-400">{tokensSold.toLocaleString()}</span></p>
          <p className="text-gray-300">Remaining: <span className="text-pink-400">{tokensRemaining.toLocaleString()}</span></p>
        </div>
      </div>
      <div className="mt-6">
        <div className="bg-indigo-800 rounded-full h-6 relative">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-400 h-6 rounded-full"
            style={{ width: `${saleProgress}%` }}
          ></div>
          <span className="absolute top-1/2 transform -translate-y-1/2 right-4 text-sm text-gray-200">{saleProgress}% Sold</span>
        </div>
      </div>
      <div className="mt-8">
        <h4 className="text-xl font-semibold mb-4 text-purple-200">Purchase Tokens</h4>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="number"
            placeholder="Amount"
            className="bg-indigo-900 text-white p-3 rounded-lg flex-grow"
            value={purchaseAmount}
            onChange={(e) => setPurchaseAmount(e.target.value.replace(/[^0-9]/g, ""))}
            min="1"
          />
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full"
            onClick={handlePurchase}
          >
            Buy Now
          </button>
        </div>
      </div>
      <div className="mt-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-lg font-bold transition-all"
          onClick={openWalletModal}
        >
          Connect Wallet
        </button>
      </div>
      {/* Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8">
            <h4 className="text-xl font-semibold mb-4 text-purple-600">Connect Your Wallet</h4>
            <WalletMultiButton />
            <button
              className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg text-lg font-bold transition-all"
              onClick={closeWalletModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Server Component for Builder.io and static paths
async function Page({
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const isPreviewingInBuilder = useIsPreviewing();
  const show404 = !page && !isPreviewingInBuilder;

  if (router.isFallback) {
    return <h1>Loading...</h1>;
