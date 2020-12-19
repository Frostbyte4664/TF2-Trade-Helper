function w(func) {
    //w(function) returns the same function redefined with a window.Function constructor.
    //This allows functions to access variable defined in the window.
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
const hotkeys = w(function (e) {
    if (e.target != document.querySelector("#filter_control") && e.target != document.querySelector("trade_offer_note")) {
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
const itemClick = w(function (e) {
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
function countMetal(inv) { return inv.ref * 9 + inv.rec * 3 + inv.scrap }
function toRef(scrap) { return Math.trunc(scrap / 9 * 100) / 100 }
function plural(name, count) { if (count != 1) { return count + ' ' + name + 's' } return count + ' ' + name }
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
function itemsChanged(mutationList) {
    if (document.getElementById("your_slots").contains(mutationList[0].target)) { //If items changed in your inventory
        updateItemCount("you");
    }
    else if (document.getElementById("their_slots").contains(mutationList[0].target)) { //If items changed in their inventory
        updateItemCount("them");
    }
}
function onLoad() {
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
    document.addEventListener("keydown", hotkeys); //Initiate hotkeys
    //Set up single click item add/remove
    document.querySelector("style").sheet.insertRule("#your_slots .item a.inventory_item_link, " +
        "#inventories .item a.inventory_item_link {cursor: pointer}", 0); //Change cursor to pointer when hovering item
    document.addEventListener("pointerdown", itemClick);
    //Create observer to watch for item changes in the trade
    new MutationObserver(itemsChanged).observe(document.getElementById("trade_area"), { subtree: true, childList: true });
    //Make sure the metal/item counter updates after loading
    setTimeout(function () {
        updateItemCount("you");
        updateItemCount("them");
    }, 3000);
}
document.addEventListener("DOMContentLoaded", onLoad());