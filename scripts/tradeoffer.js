const addItem = new window.Function("elItem", "MoveItemToTrade(elItem)")
const cancelHover = new window.Function("elItem", "CancelItemHover(elItem)")
const clearDrags = new window.Function("for (x of Draggables.drags){x.destroy()}")
const getInventory = new window.Function("user", "return user.getInventory(440, 2).rgItemElements")
const getItemFromElement = new window.Function("element", "return element.rgItem")
const getUser = new window.Function("isThem", "if (isThem){return UserThem} return UserYou")
const removeItem = new window.Function("elItem", "MoveItemToInventory(elItem)")

const countMetal = new Function("items", "return items.ref * 9 + items.rec * 3 + items.scrap")
const plural = new Function("name", "count", "if (count!=1) {return count + ' ' + name+'s'} return count + ' ' + name")
const toRef = new Function("scrap", "return Math.round(((scrap % 9 * 0.11) + (scrap - scrap % 9) / 9) * 100) / 100")

const hotkeys = new window.Function("e", "if ((e.target != document.querySelector('#filter_control')) &&" +
    "(e.target != document.querySelector('#trade_offer_note'))) { " +
    "if (e.key == 'a') {InventoryPreviousPage()}" +
    "else if (e.key == 'd') {InventoryNextPage()}" +
    "else if (e.key == 'c') {ToggleReady(!UserYou.bReady)}" +
    "else if (e.key == 'v') {ConfirmTradeOffer()}" +
    "else if (e.key == 'z') {DeclineTradeOffer()}" +
    "else if (e.key == 't') {DismissTradeOfferWindow()}" +
    "else if (e.key == 'q') {if (g_ActiveUser == UserYou) {" +
    "SelectInventoryFromUser(UserThem, g_ActiveInventory.appid, g_ActiveInventory.contextid)}" +
    "else {SelectInventoryFromUser(UserYou, g_ActiveInventory.appid, g_ActiveInventory.contextid)}" +
    "UpdateDisplayForActiveUser()}}")

function countItems(inventory, inTrade) {
    let result = { keys: 0, ref: 0, rec: 0, scrap: 0, items: 0 }
    for (var item of inventory) {
        if (inTrade == (item.firstChild.style.display == "none")) {
            switch (getItemFromElement(item).name) {
                case "Mann Co. Supply Crate Key":
                    result.keys++
                    break
                case "Refined Metal":
                    result.ref++
                    break
                case "Reclaimed Metal":
                    result.rec++
                    break
                case "Scrap Metal":
                    result.scrap++
                    break
                default:
                    result.items++
                    break
            }
        }
    }
    return result
}

function clickItem(e) {
    let elItem = e.target.parentElement
    let item = getItemFromElement(elItem)
    if (e.buttons == 1 && item) {
        clearDrags()
        if (document.querySelector("#inventory_box").contains(elItem)) {
            addItem(elItem)
        }
        else {
            removeItem(elItem)
        }
        cancelHover(elItem)
    }
}

function itemsChanged(mutationList) {
    if (document.getElementById("your_slots").contains(mutationList[0].target)) {
        let items = countItems(getInventory(getUser()), true)
        document.getElementById("trade_yours").querySelector("h2").innerText = plural("key", items.keys) + ", " + toRef(countMetal(items)) + " ref" + ", " + plural("item", items.items)
    }
    else if (document.getElementById("their_slots").contains(mutationList[0].target)) {
        let items = countItems(getInventory(getUser(1)), true)
        document.getElementById("trade_theirs").querySelectorAll("h2")[1].innerText = plural("key", items.keys) + ", " + toRef(countMetal(items)) + " ref" + ", " + plural("item", items.items)
    }
}

function onLoad() {
    let endTutorial = new window.Function("Tutorial.EndTutorial()")
    let selectGame = new window.Function("SelectInventory(440, 2)")
    let hideInfo = new Function("document.querySelector('.trade_partner_header').remove()")
    let readOnly = new window.Function("return g_bReadOnly")

    let disableWarnings = new window.Function("CModal.DismissActiveModal();" +
        "ToggleReady = function (ready) { UserYou.bReady = ready;" +
        "GTradeStateManager.ToggleReady(ready);" +
        "UpdateReadyButtons();" +
        "document.getElementById('notready_tradechanged_message').style.display = 'none' }")

    endTutorial()
    selectGame()
    hideInfo()
    disableWarnings()

    const observer = new MutationObserver(itemsChanged)
    observer.observe(document.getElementById("trade_area"), { subtree: true, childList: true })

    document.addEventListener("keydown", hotkeys)

    if (!readOnly()) {
        document.querySelector("style").sheet.insertRule("#your_slots .item a.inventory_item_link, " +
            "#inventories .item a.inventory_item_link {cursor: pointer}", 0)
        document.addEventListener("pointerdown", clickItem)
    }
}

document.addEventListener("DOMContentLoaded", onLoad())