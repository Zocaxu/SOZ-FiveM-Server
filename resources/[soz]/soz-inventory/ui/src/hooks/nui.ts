function closeNUI(cb: any, data: any = {}) {
    fetch(`https://soz-inventory/closeNUI`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    }).then(cb());
}
function askForAmount(cb: any, data: any = {}) {
    fetch(`https://soz-inventory/askForAmount`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    }).then(cb());
}
export { closeNUI, askForAmount }



