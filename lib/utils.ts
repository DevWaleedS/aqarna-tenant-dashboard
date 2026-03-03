import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";

const SECRET_KEY =
	process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || "default_secret";

/* -------------------------
   Tailwind Class Utilities
------------------------- */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/* -------------------------
   Encryption Utilities
------------------------- */
export const encryptData = (data: string) => {
	return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (cipherText: string) => {
	const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
	return bytes.toString(CryptoJS.enc.Utf8);
};
