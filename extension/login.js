//Get Username, Password, URL From Login.html url
//import { decrypt } from "/js/crypto.js";

function getParams() {
  const params = {};
  const search = window.location.search.substring(1);
  const pairs = search.split("&");

  for (const pairString of pairs) {
    const [key, value] = pairString.split("=");
    const decodedValue = decodeURIComponent(value);

    if (params[key] === undefined) {
      params[key] = decodedValue;
    } else if (typeof params[key] === "string") {
      params[key] = [params[key], decodedValue];
    } else {
      params[key].push(decodedValue);
    }
  }
  return params;
}

function decryptItem(data) {
  const encryptionKey = "salesForceManager19032024";
  // eslint-disable-next-line no-undef
  return CryptoJS.AES.decrypt(data, encryptionKey).toString(CryptoJS.enc.Utf8);
}

//submit the form
document.onreadystatechange = function () {
  const item = getParams();
  const form = document.querySelector("form");
  form.action = item.url;
  //document.getElementById("username").value = decrypt(item.un); decrypt(item.pw);
  document.getElementById("username").value = decryptItem(item.un);
  document.getElementById("password").value = decryptItem(item.pw);
  form.submit(); //let the magic happen
};
