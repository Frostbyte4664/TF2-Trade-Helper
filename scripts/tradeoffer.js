/**
 * Returns a content script function redefined as a window function. This allows the function to access variables defined by page scripts.
 * @param {Function} func The content script function to be redefined in the window.
 * @returns {window.Function} The new function that can interact with the window's variables.
 */
function w(func) {
    fstr = func.toString();
    //Get arguments from the function in string form
    argstr = (fstr.substring(
        fstr.indexOf("(") + 1,
        fstr.indexOf(")")));
    //Remove whitespace from the result
    argstr = argstr.replace(/\s/g, "");
    //Make array of the function's arguments
    args = [];
    while (argstr.length > 0) {
        if (argstr.includes(",")) {
            args.push(argstr.substring(0, argstr.indexOf(",")));
            argstr = argstr.substring(argstr.indexOf(",") + 1);
        }
        else {
            args.push(argstr);
            argstr = "";
        }
    }
    //Get a string of the function body
    fstr = fstr.substring(
        fstr.indexOf("{") + 1,
        fstr.lastIndexOf("}"));
    return window.Function(...args, fstr);
}
/**
 * Counts the metal in an inventory and returns the total as scrap.
 * @param {object} inv The inventory object with ref, rec, and scrap values.
 * @returns {number} Total metal count of the inventory object in scrap.
 */
function countMetal(inv) {
    return inv.ref * 9 + inv.rec * 3 + inv.scrap;
}
/**
 * Returns a count of scrap as ref. (e.g. 15 -> 1.44)
 * @param {number} scrap The scrap count to convert to ref.
 * @returns {number} The scrap count expressed as ref.
 */
function toRef(scrap) {
    return Math.trunc(scrap / 9 * 100) / 100;
}
/**
 * Returns a pluralized item name and count. (e.g. plural("item", 10) -> "10 items")
 * @param {string} name The name of the item to pluralize.
 * @param {number} count The number of items there are.
 * @returns {string} The number of item(s) and its pluralized form concatenated.
 */
function plural(name, count) {
    if (count != 1) {
        return count + ' ' + name + 's';
    }
    return count + ' ' + name;
}
/**
 * Updates the displayed count of keys, ref, and items of a user's trade slots.
 * @param {string} user The user whose count should be updated. Should be "you" or "them".
 */
function updateItemCount(user) {
    let inv = countItems(user, true);
    text = plural("key", inv.keys) + ", " + toRef(countMetal(inv)) + " ref" + ", " + plural("item", inv.items);
    if (user == "you") {
        document.getElementById("trade_yours").querySelector("h2").innerText = text;
    }
    else {
        document.getElementById("trade_theirs").querySelectorAll("h2")[1].innerText = text;
    }
}
/**
 * Updates the displayed item count of the respective user if the trade slots have changed.
 * @param {mutationList} mutationList The mutation to check for changed trade slots.
 */
function itemsChanged(mutationList) {
    if (document.getElementById("your_slots").contains(mutationList[0].target)) { //If items changed in your inventory
        updateItemCount("you");
    }
    else if (document.getElementById("their_slots").contains(mutationList[0].target)) { //If items changed in their inventory
        updateItemCount("them");
    }
}
/**
 * Counts items in the specified user's inventory.
 * @params {string} user Whose inventory to evaluate. Should be "you" or "them".
 * @params {boolean} inTrade Count items inside (true) or outside (false) of the current trade.
 * @returns {object} inv Object with numerical keys, ref, rec, scrap, and items properties.
 */
const countItems = w(function (user, inTrade) {
    let inventory;
    if (user == "you") {
        inventory = UserYou.getInventory(440, 2).rgItemElements;
    }
    else {
        inventory = UserThem.getInventory(440, 2).rgItemElements;
    }
    let inv = { keys: 0, ref: 0, rec: 0, scrap: 0, items: 0 }
    for (var elItem of inventory) {
        if (inTrade == (elItem.firstChild.style.display == "none")) { //If looking looking for items in trade and item is in trade
            //Or if looking for items NOT in trade and item is NOT in trade
            switch (elItem.rgItem.name) {
                case "Mann Co. Supply Crate Key":
                    inv.keys++;
                    break;
                case "Refined Metal":
                    inv.ref++;
                    break;
                case "Reclaimed Metal":
                    inv.rec++;
                    break;
                case "Scrap Metal":
                    inv.scrap++;
                    break;
                default:
                    inv.items++;
                    break;
            }
        }
    }
    return inv;
});
function onLoad() { //This would be an anonymous function in the following addEventListener, but that doesn't seem to work.
    let wOnLoad = w(function () { //For operations that use window variables
        Tutorial.EndTutorial(); //Close tutorial
        SelectInventory(440, 2); //Select TF2 Inventory
        document.querySelector('.trade_partner_header').remove(); //Hides trade parter info at the top of the screen
        //.remove() is redefined for some reason and must be called in the window
        //Disable trade warnings
        CModal.DismissActiveModal();
        ToggleReady = function (ready) {
            UserYou.bReady = ready;
            GTradeStateManager.ToggleReady(ready);
            UpdateReadyButtons();
            document.getElementById('notready_tradechanged_message').style.display = 'none';
        }
    });
    wOnLoad();
    //Initiate hotkeys
    const hotkeys = w(function (e) { //This would be an anonymous function, but that doesn't seem to work.
        if (e.target.tagName != "INPUT") {
            if (e.key == "a") { InventoryPreviousPage(); }
            else if (e.key == "d") { InventoryNextPage(); }
            else if (e.key == "c") { ToggleReady(!UserYou.bReady); }
            else if (e.key == "v") { ConfirmTradeOffer(); }
            else if (e.key == "z") { DeclineTradeOffer(); }
            else if (e.key == "t") { DismissTradeOfferWindow(); }
            else if (e.key == "q") {
                if (g_ActiveUser == UserYou) { //Switches between your inventory and their inventory
                    SelectInventoryFromUser(UserThem, g_ActiveInventory.appid, g_ActiveInventory.contextid);
                }
                else {
                    SelectInventoryFromUser(UserYou, g_ActiveInventory.appid, g_ActiveInventory.contextid);
                }
                UpdateDisplayForActiveUser();
            }
        }
    });
    document.addEventListener("keydown", hotkeys);
    //Set up single click item add/remove
    const itemClick = w(function (e) { //This would be an anonymous function, but that doesn't seem to work.
        if (!g_bReadOnly) {
            let elItem = e.target.parentElement;
            if (e.buttons == 1 && elItem && elItem.rgItem) {
                for (x of Draggables.drags) {
                    x.destroy();
                }
                if (document.querySelector("#inventory_box").contains(elItem)) {
                    MoveItemToTrade(elItem);
                }
                else {
                    MoveItemToInventory(elItem);
                }
                CancelItemHover(elItem);
            }
        }
    });
    document.addEventListener("pointerdown", itemClick);
    document.querySelector("style").sheet.insertRule("#your_slots .item a.inventory_item_link, " +
        "#inventories .item a.inventory_item_link {cursor: pointer}", 0); //Change cursor to pointer when hovering item
    //Create observer to watch for item changes in the trade
    new MutationObserver(itemsChanged).observe(document.getElementById("trade_area"), { subtree: true, childList: true });
    //Make sure the metal/item counter updates after loading
    setTimeout(function () {
        updateItemCount("you");
        updateItemCount("them");
    }, 3000);
}
document.addEventListener("DOMContentLoaded", onLoad());


//EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
getActiveSlots = w(function () {
    let slots;
    if (g_ActiveUser == UserYou) {
        slots = document.querySelector("#your_slots");
    }
    else {
        slots = document.querySelector("#their_slots");
    }
    return slots;
});

getItemName = w(function (elItem) {
    return elItem.rgItem.name;
});

itemToInv = w(function (elItem) {
    MoveItemToInventory(elItem);
});

function removeFromTrade(slots, index, names, match) {
    /*Removes items (With a delay because removing too many items at once breaks the page)...
     Within the specified trade slots (slots)
     Starting at the specified slot index (index)
     Look for items whose item names are in string array names (names)
     Remove items with (true) or without (false) matching names (match)*/
    setTimeout(function () {
        if (slots.children[index].classList.contains("has_item")) {
            if (match == names.includes(getItemName(slots.children[index].firstChild.firstChild))) {
                itemToInv(slots.children[index].firstChild.firstChild);
                removeFromTrade(slots, index, names, match);
            }
            else {
                removeFromTrade(slots, index + 1, names, match);
            }
        }
    }, 75);
}

document.querySelector("#inventory_displaycontrols").innerHTML = "<h3>Add or Remove Items:</h3><br/>" +
    "<div class='mom'>" +
    "Keys: <input id='addKeys' type='number' min='0' placeholder='1' step='1' class='filter_search_box'/>" +
    "Ref: <input id='addMetal' type='number' min='0' placeholder='1.11' step='0.01' class='filter_search_box'/>" +
    "<button id='addItems' class='pagecontrol_element pagebtn'>+</button><br/>" +
    "</div><div class='mom'>" +
    "Remove:<button id='removeAll' class='pagecontrol_element pagebtn'>All</button>" +
    "<button id='removeKeys' class='pagecontrol_element pagebtn'>Keys</button>" +
    "<button id='removeMetal' class='pagecontrol_element pagebtn'>Metal</button>" +
    "<button id='removeItems' class='pagecontrol_element pagebtn'>Items</button>"
"</div>"
document.querySelector("style").sheet.insertRule(".mom{display:flex;align-items:center}", 0);
document.querySelector("style").sheet.insertRule(".mom *{flex-grow:1;margin:5px}", 0);


document.getElementById("addItems").onclick = function () {
    addItems();
};
document.getElementById("removeAll").onclick = function () {
    removeFromTrade(getActiveSlots(), 0, [], false)
};
document.getElementById("removeKeys").onclick = function () {
    removeFromTrade(getActiveSlots(), 0, ["Mann Co. Supply Crate Key"], true)
};
document.getElementById("removeMetal").onclick = function () {
    removeFromTrade(getActiveSlots(), 0, ["Refined Metal", "Reclaimed Metal", "Scrap Metal"], true);
};
document.getElementById("removeItems").onclick = function () {
    removeFromTrade(getActiveSlots(), 0, ["Mann Co. Supply Crate Key", "Refined Metal", "Reclaimed Metal", "Scrap Metal"], false);
}




function addItems() {
    let keys = document.getElementById("addKeys").value;
    let metal = document.getElementById("addMetal").value;
    if (keys == "") {
        document.getElementById("addKeys").value = 0;
        keys = 0;
    }
    else {
        keys = Math.trunc(keys);
        document.getElementById("addKeys").value = keys;
    }
    if (metal == "") {
        document.getElementById("addMetal").value = 0;
        metal = 0;
    }
    else { //Ignore any digit after the tenths place and then write that number twice (24.795 -> 24.77) .99 is rounded up
        metal = Math.trunc(metal * 100 + 0.1);
        let x = (metal % 100);
        metal -= x;
        x = (x - x % 10) / 10 * 11;
        if (x == 99) {
            x++
        };
        metal = (x + metal) / 100;
        document.getElementById("addMetal").value = metal;
    }
    //Convert ref into scrap
    let x = Math.trunc(metal);
    metal = x * 9 + Math.trunc((metal - x) * 10);
    //Get active inventory
    let bob = w(function () {
        if (g_ActiveUser == UserYou) {
            return "you";
        }
        else {
            return "them";
        }
    });
    inv = countItems(bob(), false);
    //See if the inventory has enough keys/metal
    console.log(keys, metal);
    console.log(inv.keys, countMetal(inv));
    if (keys > inv.keys || metal > countMetal(inv)) {
        console.log("Not enough keys/metal in inventory");
    }
    //Figure out what combination of metal to add
    let metalToAdd = { ref: 0, rec: 0, scrap: 0 };
    if ((metal - (metal % 9)) / 9 > inv.ref) {
        metalToAdd.ref = inv.ref;
    }
    else {
        metalToAdd.ref = (metal - (metal % 9)) / 9;
    }
    metal -= metalToAdd.ref * 9;
    console.log(metalToAdd, countMetal(metalToAdd), metal);
    if ((metal - (metal % 3)) / 3 > inv.rec) {
        metalToAdd.rec = inv.rec;
    }
    else {
        metalToAdd.rec = (metal - (metal % 3)) / 3;
    }
    metal -= metalToAdd.rec * 3;
    console.log(metalToAdd, countMetal(metalToAdd), metal);
    if (metal > inv.scrap) {
        metalToAdd.scrap = inv.scrap;
    }
    else {
        metalToAdd.scrap = metal;
    }
    metal -= metalToAdd.scrap;
    console.log(metalToAdd, countMetal(metalToAdd), metal);
    if (metal > 0) {
        console.log("Could not make exact change.");
        /*
        if (metal < 3 && inv.rec > metalToAdd.rec) {
            metalToAdd.rec++;
            metal -= 3;
        }
        else {
            metalToAdd.ref++;
            metal -= 9;
            if (metal < -3) {
                mteal
                metalToAdd.rec = 0;
            }
        }
        */
    }
    //console.log(metalToAdd, countMetal(metalToAdd), metal);
    let joe = w(function (count, itemName) {
        let rgItems = g_ActiveUser.getInventory(440, 2).rgItemElements;
        console.log(rgItems);
        console.log(count);
        while (count > 0) {
            console.log(count);
            let index = rgItems.length - 1;
            while (rgItems[index].rgItem.name != itemName || rgItems[index].firstChild.style.display == "none") {
                index--;
            }
            MoveItemToTrade(rgItems[index]);
            count--;
        }
    });
    if (metal == 0) {
        joe(keys, "Mann Co. Supply Crate Key");
        joe(metalToAdd.ref, "Refined Metal");
        joe(metalToAdd.rec, "Reclaimed Metal");
        joe(metalToAdd.scrap, "Scrap Metal");
    }
}