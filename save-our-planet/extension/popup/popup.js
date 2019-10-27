async function longPoll() {
    return browser.runtime.sendMessage({
        type: 'poll',
    });
}

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

async function messageLoop() {
    while (true) {
        const message = await longPoll();
        onMessage(message);
        await sleep(10);
    }
}

function onMessage(message) {
    const { category, id } = message;
    const categoryContainer = document.querySelector(`#stats > .${category}`) || document.querySelector(`#stats > .other`)
    categoryContainer.innerHTML += `#${id}<br>`;
}

messageLoop();
