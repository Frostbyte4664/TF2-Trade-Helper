function onLoad() { //This would be an anonymous function in the following addEventListener, but that doesn't seem to work.
    let item = document.querySelector(".item");
    let sellers = document.querySelector(".col-md-6");
    let buyers = document.querySelectorAll(".col-md-6")[1];

    if (item && sellers && buyers) {
        item = item.dataset.p_bptf;
        let text = "<h3 style='margin-right:25%;margin-bottom:0'>This Page:</h3><h1 style='margin-top:0'>";
        let itemsmatch = true;
        for (var x of document.querySelectorAll(".item")) {
            if (x.dataset.p_bptf != item) {
                itemsmatch = false;
            }
        }
        if (itemsmatch == true) {
            text += (item ? "bp.tf Price: <b>" + item + "</b>" : "<b>Unpriced</b>") + "<br/>";
        }
        if (sellers.querySelector(".item")) {
            item = sellers.querySelector(".item").dataset
            text += "<a href='" + item.listing_offers_url + "'>"
                + "Lowest Seller: <b>" + item.listing_price + "</b></a><br/>";
            if (sellers.querySelector(".fa-flash")) {
                item = sellers.querySelector(".fa-flash").parentElement.parentElement.parentElement.parentElement.parentElement
                    .firstElementChild.firstElementChild.dataset;
                text += "<a href='" + item.listing_offers_url + "'>"
                    + "Lowest Bot Seller: <b>" + item.listing_price + "</b></a><br/>";
            }
            else {
                text += "No Bot Sellers<br/>";
            }
        }
        else {
            text += "No Sellers<br/>";
        }
        if (buyers.querySelector(".item")) {
            item = buyers.querySelector(".item").dataset
            text += "<a href='" + item.listing_offers_url + "'>"
                + "Highest Buyer: <b>" + item.listing_price + "</b></a><br/>";
            if (buyers.querySelector(".fa-flash")) {
                item = buyers.querySelector(".fa-flash").parentElement.parentElement.parentElement.parentElement.parentElement
                    .firstElementChild.firstElementChild.dataset;
                text += "<a href='" + item.listing_offers_url + "'>"
                    + "Highest Bot Buyer: <b>" + item.listing_price + "</b></a>";
            }
            else {
                text += "No Bot Buyers";
            }
        }
        else {
            text += "No Buyers";
        }
        text += "</h1>"
        let div = document.createElement("div");
        div.innerHTML = text;
        div.style = "margin:auto;text-align:end;width:max-content";
        document.querySelector(".panel-body").appendChild(div);
    }
}
document.addEventListener("DOMContentLoaded", onLoad());