const getInventory = new window.Function("user", "return user.getInventory(440, 2).rgItemElements")
const getItemFromElement = new window.Function("element", "return element.rgItem")
const getUser = new window.Function("isThem", "if (isThem){return UserThem} return UserYou")

const countMetal = new Function("items", "return items.ref * 9 + items.rec * 3 + items.scrap")
const plural = new Function("name", "count", "if (count!=1) {return count + ' ' + name+'s'} return count + ' ' + name")
const toRef = new Function("scrap", "return Math.round(((scrap % 9 * 0.11) + (scrap - scrap % 9) / 9) * 100) / 100")

const inventoryScroll = new window.Function("e", "if (e.target == document.body) {" +
    "if (e.key == 'a') {InventoryPreviousPage()}" +
    "else if (e.key == 'd') {InventoryNextPage()}}")

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

    document.addEventListener("keydown", inventoryScroll)
}

document.addEventListener("DOMContentLoaded", onLoad())