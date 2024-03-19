import CryptoJS from "crypto-js";

// Encryption function
export function encrypt(data, secretKey) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Decryption function
export function decrypt(encryptedData, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
