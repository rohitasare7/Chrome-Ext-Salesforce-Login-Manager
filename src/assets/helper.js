import CryptoJS from "crypto-js";

const encryptionKey = "salesForceManager19032024";

//Encryption function
export function encrypt(data) {
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
}

export function decrypt(data) {
  return CryptoJS.AES.decrypt(data, encryptionKey).toString(CryptoJS.enc.Utf8);
}
