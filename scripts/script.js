function endTutorial() {
    if (window.eval("Tutorial")) {
        window.eval("Tutorial.EndTutorial()")
        console.log("Closed the tutorial.")
    }
    else {
        console.log("Could not find Tutorial object.");
    }
}

function selectGame() {
    window.eval("TradePageSelectInventory(g_ActiveUser, 440, '2');");
    console.log("Selected Team Fortress 2 inventory");
}

function onLoad() {
    endTutorial();
    selectGame();
}

document.addEventListener("DOMContentLoaded", onLoad());