function endTutorial() {
    //Closes the tutorial if it can be found
    if (window.eval("Tutorial")) {
        window.eval("Tutorial.EndTutorial()")
        console.log("Closed the tutorial.")
    }
    else {
        console.log("Could not find Tutorial object.");
    }
}

function selectGame() {
    //Selects Team Fortress 2 from the game inventories
    window.eval("TradePageSelectInventory(UserThem, 440, 2);");
    window.eval("TradePageSelectInventory(UserYou, 440, 2);");
    console.log("Selected and loaded Team Fortress 2 inventory.");
}

function disableWarnings() {
    //Closes any initial warnings and disables future warning flags
    window.eval("CModal.DismissActiveModal();");
    window.eval("g_bWarnedAboutPlaytime = false;");
    window.eval("g_bWarnedAboutUnvettedApp = false;");
    window.eval("g_bWarnOnReady = false;");
    console.log("Disabled trade warnings.");
}

function hideInfo() {
    //Removes the trade partner information at the top of the window
    document.body.getElementsByClassName('trade_partner_header')[0].remove();
    console.log("Removed trade partner info.")
}

function onLoad() {
    //Called when the page is loaded
    endTutorial();
    selectGame();
    disableWarnings();
    hideInfo();
}

document.addEventListener("DOMContentLoaded", onLoad());

const itemName = new window.Function("user", "num", "return user.getInventory(440, 2).rgItemElements[num].rgItem.name")

function countMetalInTrade(user) {
    var userObject = window.eval(user);
    let inventory = window.eval(user + ".getInventory(440, 2).rgItemElements");
    let scraps = 0;
    for (var i = inventory.length-1; i >= 0; i--) {
        if (inventory[i].firstChild) {
            if (inventory[i].firstChild.style.display == "none") {
                switch (itemName(userObject, i)) {
                    case "Refined Metal":
                        scraps += 9;
                        break;
                    case "Reclaimed Metal":
                        scraps += 3;
                        break;
                    case "Scrap Metal":
                        scraps += 1;
                        break;
                }
            }
        }
    }
    return scraps;
}

function toRef(scrap) {
    //let result = scrap % 9;
    //result += Math.round((scrap - result*9)*11)/100;
    let result = scrap;
    let bob = scrap % 9;
    result -= bob;
    result /= 9;
    bob = bob * 0.11;
    return (Math.trunc((result + bob) * 100) / 100);
}

function itemsChanged(mutationList, observer) {
    //When the items in the change trade
    if (document.getElementById("your_slots").contains(mutationList[0].target)) {
        //Count my metal in trade
        document.getElementById("trade_yours").querySelector("h2").innerText = toRef(countMetalInTrade("UserYou")) + " ref";
    }
    else if (document.getElementById("their_slots").contains(mutationList[0].target)){
        //Count their metal in trade
        document.getElementById("trade_theirs").querySelectorAll("h2")[1].innerText = toRef(countMetalInTrade("UserThem")) + " ref";
    }
}

const observer = new MutationObserver(itemsChanged);
observer.observe(document.getElementById("trade_area"), { subtree: true, childList: true });