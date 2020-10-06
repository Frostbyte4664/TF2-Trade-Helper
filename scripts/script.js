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
    window.eval("TradePageSelectInventory(g_ActiveUser, 440, '2');");
    console.log("Selected Team Fortress 2 inventory.");
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