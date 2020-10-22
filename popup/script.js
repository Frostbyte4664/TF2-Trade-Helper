var in1, in2, out, oper = '+';

function onBlur(e) {
    //e should be an event with e.target == <input type="number">
    //Rounds the value in the target to the nearest hundredth
    //If the value x.y, will change it to x.yy, unless y is 9, in which case it's set to x+1
    let value = Math.round(e.target.value * 100);
    if (value % 10) {
        e.target.value = value / 100;
    }
    else {
        if (value % 100 == 90) {
            e.target.value = Math.round(value / 100);
        }
        else {
            e.target.value = ((value - value % 100) + value % 100 * 1.1) / 100;
        }
    }
}

function onClick(e) {
    oper = e.target.value;
}

function toScrap(ref) {
    let result = Math.trunc(ref) * 9;
    result += Math.round((ref * 100) % 100) / 11;
    return result;
}

function toRef(scrap) {
    //let result = scrap % 9;
    //result += Math.round((scrap - result*9)*11)/100;
    let result = scrap;
    let bob = scrap % 9;
    result -= bob;
    result /= 9;
    bob = bob * 0.11;
    return (Math.trunc((result + bob)*100)/100);
}

function calc() {
    /*
    if (in1 && in2 && out) {
        let vals = [ in1.value, in2.value ];
        console.log(vals);
    }
    val1 = Math.trunc(in1.value) * 9;
    val2 = Math.round((in1.value * 100) % 100);
    result = 1010;
    if (!(val2 % 11)) {
        result = 1000 + val1 + val2 / 11;
    }
    else {
        result = val1 + val2 / 11;
    }
    */
    let result = 0;
    switch (oper) {
        case '+':
            result = toRef(toScrap(in1.value) + toScrap(in2.value));
            break;
        case '-':
            result = toRef(toScrap(in1.value) - toScrap(in2.value));
            break;
        case '*':
            result = toRef(toScrap(in1.value) * in2.value);
            break;
        case '/':
            result = toRef(toScrap(in1.value) / in2.value);
    }
    return result;
}

function onLoad() {
    //Fires when the document loads
    for (var i of document.getElementsByTagName("input")) {
        switch (i.type) {
            case "radio":
                i.addEventListener("click", onClick);
                break;
            case "number":
                i.addEventListener("blur", onBlur);
                if (!in1) in1 = i;
                else in2 = i;
                break;
            case "text":
                out = i;
                break;
        }
    }
}

document.addEventListener("DOMContentLoaded", onLoad());


document.body.addEventListener("input", function () {
    out.value = calc();
});