import fetch from 'node-fetch';

const API_BASE_URL = 'https://api.mallow.art';

export async function getAuctionDetails(auctionId) {
  const response = await fetch(`${API_BASE_URL}/artworks/${auctionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch auction details');
  }
  return response.json();
}

export async function placeBid({ auctionId, userAccount, bidAmount }) {
  const response = await fetch(`${API_BASE_URL}/getBidOrBuyTx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auctionHouseAddress: auctionId,
      userPublicKey: userAccount,
      amount: bidAmount,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to place bid');
  }

  return response.json();
}

export default {
  getAuctionDetails,
  placeBid,
};
