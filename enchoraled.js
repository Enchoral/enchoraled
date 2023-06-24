// ==UserScript==
// @name         enchoraled
// @description  Snipe limiteds in your browser
// @author       3030ms
// @version      0.0.1
// @downloadURL  https://greasyfork.org/scripts/469373-enchoraled/code/enchoraled.user.js
// @updateURL    https://greasyfork.org/scripts/469373-enchoraled/code/enchoraled.user.js
// @match        *.roblox.com/catalog/*
// @grant        GM_notification
// ==/UserScript==

Notification.requestPermission();

var notificationTitle = "enchoraled";
var userId = 0;
var xtoken = "";

let currentUrl = window.location.href;
let id = currentUrl.split("/").slice(-2, -1)[0];

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

fetch("https://users.roblox.com/v1/users/authenticated", {credentials: "include"})
    .then(response => {
    userId = response.json().id;
})

fetch("https://catalog.roblox.com/", {credentials: "include", method: "POST"})
    .then(response => {
    xtoken = response.headers.get('X-Csrf-Token');
})

function run() {
    fetch(`https://economy.roblox.com/v2/assets/${id}/details`, {credentials: "include"})
        .then(response => response.json())
        .then(data => {
        console.log(data);
        if (data.Remaining !== null && data.Remaining !== 0 && data.PriceInRobux === 0) {
            let postData = JSON.stringify({
                collectibleItemId: data.CollectibleItemId,
                expectedCurrency: 1,
                expectedPrice: 0,
                expectedPurchaserId: userId,
                expectedPurchaserType: "User",
                expectedSellerId: data.Creator.CreatorTargetId,
                expectedSellerType: data.Creator.CreatorType,
                idempotencyKey: uuidv4(),
                collectibleProductId: data.CollectibleProductId});
            fetch(`https://apis.roblox.com/marketplace-sales/v1/item/${data.CollectibleItemId}/purchase-item`, {
                method: "POST", credentials: "include", body: postData, headers: {"X-Csrf-Token": xtoken, "Content-type": "application/json"}
            })
                .then(response => response.status)
                .then(dataaa => {
                if (dataaa != 200) {
                    var notificationOptions = {body: `Error: ${dataaa}, Item: ${data.Name}`, icon: "http://files.enchoral.me/r/enchoraled.jpg"};
                    new Notification(notificationTitle, notificationOptions);
                }
                clearInterval(myInterval);
            })
                .then(response => response.json())
                .then(dataa => {
                if (dataa.Success === true) {
                    var notificationOptions = {body: `Bought ${data.Name}`, icon: "http://files.enchoral.me/r/enchoraled.jpg"};
                    new Notification(notificationTitle, notificationOptions);
                } else {
                    var notificationOptions1 = {body: `Missed ${data.Name}, Error: ${dataa}`, icon: "http://files.enchoral.me/r/enchoraled.jpg"};
                    new Notification(notificationTitle, notificationOptions1);
                }
                clearInterval(myInterval);
            })
                .catch(error => console.log(error));
        } else if (data.PriceInRobux !== null && data.PriceInRobux !== 0) {clearInterval(myInterval);};
    })
        .catch(error => console.log(error));
}

var myInterval = setInterval(run, 150);
