function endTutorial() {
    if (window.eval("Tutorial")) {
        window.eval("Tutorial.EndTutorial()")
        console.log("Closed the tutorial.")
    }
    else {
        console.log("Could not find Tutorial object.");
    }
}

function onLoad() {
    endTutorial();
}

document.addEventListener("DOMContentLoaded", onLoad());