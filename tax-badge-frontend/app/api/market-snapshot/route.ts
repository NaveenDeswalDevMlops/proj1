import { NextResponse } from "next/server";

const YAHOO_QUOTE_URL =
  "https://query1.finance.yahoo.com/v7/finance/quote?symbols=GC%3DF%2CSI%3DF%2C%5EBSESN%2C%5ENSEI%2CINR%3DX";

const FALLBACK_DATA = {
  goldPerGramInr: 8465,
  silverPerKgInr: 97200,
  sensex: 78412.55,
  nifty50: 23906.4,
};

const getPrice = (
  list: Array<{ symbol?: string; regularMarketPrice?: number }>,
  symbol: string,
) => list.find((item) => item.symbol === symbol)?.regularMarketPrice || 0;

export async function GET() {
  try {
    const response = await fetch(YAHOO_QUOTE_URL, {
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo quote request failed (${response.status})`);
    }

    const payload = await response.json();
    const results: Array<{ symbol?: string; regularMarketPrice?: number }> =
      payload?.quoteResponse?.result || [];

    const goldUsdOz = getPrice(results, "GC=F");
    const silverUsdOz = getPrice(results, "SI=F");
    const usdInr = getPrice(results, "INR=X");
    const sensex = getPrice(results, "^BSESN");
    const nifty50 = getPrice(results, "^NSEI");

    const ozToGram = 31.1035;
    const goldPerGramInr = (goldUsdOz * usdInr) / ozToGram;
    const silverPerKgInr = ((silverUsdOz * usdInr) / ozToGram) * 1000;

    return NextResponse.json({
      data: {
        goldPerGramInr,
        silverPerKgInr,
        sensex,
        nifty50,
      },
      source: "Yahoo Finance",
      isFallback: false,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      data: FALLBACK_DATA,
      source: "Indicative fallback",
      isFallback: true,
      message: "Primary market source unavailable. Showing indicative fallback values.",
      details: error instanceof Error ? error.message : "Unknown error",
      fetchedAt: new Date().toISOString(),
    });
  }
}
