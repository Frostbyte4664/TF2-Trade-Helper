const parser = new DOMParser();

/*
For scrap.tf. Will not be finished/updated.

function classifieds(item) {
    let url = "https://backpack.tf/classifieds?item=";
    //Item Name
    if (item.classList.contains("quality3") || item.classList.contains("quality11")) {
        url += item.dataset.title.replace(/<.*'>|<\S*|Strange |Vintage |Australium /g, "");
    }
    else {
        url += item.dataset.title.replace("Australium ","");
    }
    //Tradable
    url += "&tradable=1";
    //Craftable
    if (item.classList.contains("uncraft")) {
        url += "&craftable=-1";
    }
    else {
        url += "&craftable=1";
    }
    //Australium
    if (item.dataset.title.includes("Australium") && item.dataset.title != "Australium Gold") {
        url += "&australium=1";
    }
    else {
        url += "&australium=-1";
    }
    //Quality
    url += "&quality=" + item.classList[2].substr(7);
    //Killstreak
    if (item.classList.contains("killstreak1")) {
        url += "&killstreak_tier=1";
    }
    else if (item.classList.contains("killstreak2")) {
        url += "&killstreak_tier=2";
    }
    else if (item.classList.contains("killstreak3")) {
        url += "&killstreak_tier=3";
    }
    else {
        url += "&killstreak_tier=0";
    }
    return encodeURI(url);
}
*/
function classifieds(item) {
    //For stntrading.eu
    let url = "https://backpack.tf/classifieds?item=";
    //Item Name
    url += item.name;
    //Tradable
    url += "&tradable=1";
    //Craftable
    if (item.attributes.itemname.value.includes("Non-Craftable")) {
        url += "&craftable=-1";
    }
    else {
        url += "&craftable=1";
    }
    //Australium
    if (item.attributes.itemname.value.includes("Australium") && item.name != "Australium Gold") {
        url += "&australium=1";
    }
    else {
        url += "&australium=-1";
    }
    //Quality
    url += "&quality=" + item.attributes.quality.value;
    //Killstreak
    if (item.attributes.itemname.value.includes("Professional Killstreak")) {
        url += "&killstreak_tier=3";
    }
    else if (item.attributes.itemname.value.includes("Specialized Killstreak")) {
        url += "&killstreak_tier=2";
    }
    else if (item.attributes.itemname.value.includes("Killstreak")) {
        url += "&killstreak_tier=1";
    }
    else {
        url += "&killstreak_tier=0";
    }
    return encodeURI(url);
}
browser.menus.onShown.addListener((info, tab) => {
    let target = browser.tabs.executeScript(tab.id, {
        /* For scrap.tf
        code: `var elem=browser.menus.getTargetElement(${info.targetElementId});if(elem.classList.contains("item"))elem.outerHTML`
        */
        //stntrading.eu
        code: `var elem=browser.menus.getTargetElement(${info.targetElementId}).parentElement.parentElement;if(elem.classList.contains("inventoryItem"))elem.outerHTML`
    });

    target.then(value => {
        let item = parser.parseFromString(value[0], "text/html").body.firstElementChild;
        console.log(item);
        if (item) {
            browser.menus.create({
                title: "Classifieds for this item",
                onclick: () => {
                    //console.log(classifieds(item));
                    browser.tabs.create({
                        url: classifieds(item)
                    });
                }
            }, () => { browser.menus.refresh() });
        }
    });
    /*
    browser.menus.create({
        title: Date()
    });

    browser.menus.refresh();
    */
});

browser.menus.onHidden.addListener(() => {
    //Remove all context menu items when the context menu is hidden.
    browser.menus.removeAll();
});