async function encrypt() {
    const key = await importRsaKey(document.getElementById("key").value);
    let data = document.getElementById("data").value;

    const enc = new TextEncoder();
    data = enc.encode(data);

    window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        key,
        data
    ).then((res) => document.getElementById("result").textContent = window.btoa(convertBuffer(res)));
}

async function decrypt() {
    const key = await importPrivateKey(document.getElementById("key").value);
    console.debug(key);
    let data = document.getElementById("data").value;
    console.debug("unec", data);

    const enc = new TextEncoder();
    let dec = new TextDecoder();
    data = enc.encode(window.atob(data));

    window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        key,
        data
    ).then((res) => document.getElementById("result").textContent = dec.decode(res)).catch(e => console.error(e));
}

function convertBuffer(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

async function digest() {
    let data = document.getElementById("data").value;
    const encoder = new TextEncoder();
    data = encoder.encode(data);
    const hash = await crypto.subtle.digest('SHA-256', data);
    document.getElementById("result").textContent = convertBuffer(hash);
}

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/importKey

function importRsaKey(pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );
}

/*
Import a PEM encoded RSA private key, to use for RSA-PSS signing.
Takes a string containing the PEM encoded key, and returns a Promise
that will resolve to a CryptoKey representing the private key.
*/
async function importPrivateKey(pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = str2ab(binaryDerString);

    try {
        const key = await window.crypto.subtle.importKey(
            "pkcs8",
            binaryDer,
            {
                name: "RSA-OAEP",
                modulusLength: 4096,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
            },
            false,
            ["decrypt"]
        );
        return key;
    } catch (e) {
        console.error(e);
    }
}

// from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
