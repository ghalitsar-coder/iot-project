/**
 * Feed Settings Helper
 * Utilities for managing default feed amount settings
 */

const DEFAULT_FEED_AMOUNT = 10;
const STORAGE_KEY = "defaultFeedAmount";

/**
 * Get the default feed amount from localStorage
 * @returns The default feed amount in grams
 */
export function getDefaultFeedAmount(): number {
  if (typeof window === "undefined") return DEFAULT_FEED_AMOUNT;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const amount = parseInt(saved);
    if (!isNaN(amount) && amount > 0) {
      return amount;
    }
  }
  return DEFAULT_FEED_AMOUNT;
}

/**
 * Set the default feed amount in localStorage
 * @param amount - The feed amount in grams
 * @returns true if saved successfully
 */
export function setDefaultFeedAmount(amount: number): boolean {
  if (typeof window === "undefined") return false;
  if (isNaN(amount) || amount <= 0) return false;
  
  localStorage.setItem(STORAGE_KEY, amount.toString());
  return true;
}

/**
 * Predefined feed amount options
 */
export const FEED_AMOUNT_OPTIONS = [5, 8, 10, 12, 15, 20, 25, 30];
