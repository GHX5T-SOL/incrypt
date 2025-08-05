import { PublicKey } from '@solana/web3.js';

// Format SOL balance
export const formatSOL = (lamports, decimals = 4) => {
  const sol = lamports / 1e9;
  return sol.toFixed(decimals);
};

// Format USD amounts
export const formatUSD = (amount, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Format wallet address
export const formatAddress = (address, length = 4) => {
  if (!address) return '';
  if (address.length <= length * 2 + 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

// Format large numbers
export const formatNumber = (num, decimals = 2) => {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
};

// Format TVL (Total Value Locked)
export const formatTVL = (tvl) => {
  return formatUSD(tvl);
};

// Format APR (Annual Percentage Rate)
export const formatAPR = (apr) => {
  return formatPercentage(apr);
};

// Format time ago
export const formatTimeAgo = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
};

// Validate Solana address
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Format pool name
export const formatPoolName = (tokenA, tokenB) => {
  return `${tokenA}/${tokenB}`;
};

// Format pool type
export const formatPoolType = (type) => {
  switch (type) {
    case 'dlmm':
      return 'DLMM';
    case 'damm-v2':
      return 'DAMM V2';
    default:
      return type.toUpperCase();
  }
};

// Format risk level
export const formatRiskLevel = (risk) => {
  switch (risk) {
    case 'low':
      return 'Low Risk';
    case 'medium':
      return 'Medium Risk';
    case 'high':
      return 'High Risk';
    default:
      return 'Unknown Risk';
  }
};

// Format safety score
export const formatSafetyScore = (score) => {
  if (score >= 80) return 'Safe';
  if (score >= 60) return 'Moderate';
  if (score >= 40) return 'Risky';
  return 'High Risk';
};

// Get color for safety score
export const getSafetyColor = (score) => {
  if (score >= 80) return '#00FF9F'; // Green
  if (score >= 60) return '#FF9500'; // Orange
  if (score >= 40) return '#FF3B30'; // Red
  return '#FF3B30'; // Red
};