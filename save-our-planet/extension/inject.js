class Agent {
    constructor() {
        // send the page's content for analysis
        browser.runtime.sendMessage({
            type: 'page',
            content: document.documentElement.outerHTML,
        });

        browser.runtime.onMessage.addListener(message => this.handleMessage(message));
    }
    log(...args) {
        console.log('[Agent]', `[${origin}]`, ...args);
    }
    async handleMessage(message) {
        const type = message.type;
        if (typeof type !== 'string' || type.length < 1) {
            this.log('invalid message type:', type);
            return;
        }

        const handlerName = `on${type.substring(0, 1).toUpperCase()}${type.substring(1)}`;
        
        if (this[handlerName]) {
            delete message.type;

            try {
                await this[handlerName](message);
            } catch (e) {
                this.log('Error during message handling:', e);
            }
        } else {
            this.log('unknown msg type:', type, message);
        }
    }
    onBad(message) {
        const { category, id } = message;
        
        // look for the bad element
        const badElem = document.getElementById(id);

        if (badElem) {
            // if found, remove it...
            badElem.parentNode.removeChild(badElem);
            // ...report the removal...
            browser.runtime.sendMessage({
                type: 'saved',
                category,
                id,
            });
            // ...and indicate what was removed
            this.addQualitySeal('shield.png', `Saved from ${category}`);
        }
    }
    onGood() {
        // indicate that everything is fine :)
        this.addQualitySeal('earth.png', 'This is already a green website! :)');
    }
    addQualitySeal(img, msg) {
        let seal;
        if (document.querySelector('#planet-saver-quality-seal')) {
            seal = document.querySelector('#planet-saver-quality-seal');
        } else {
            seal = document.createElement('div');
            seal.id = 'planet-saver-quality-seal';
            seal.style.position = 'fixed';
            seal.style.display = 'inline-block';
            seal.style.top = '0px';
            seal.style.left = '0px';
            seal.style.padding = '0.25em';
            document.body.appendChild(seal);
        }

        const imgUrl = browser.runtime.getURL(`web/${img}`);
        seal.innerHTML = `<img src="${imgUrl}" title="${msg}">`;
        seal.children[0].style.width = '24px';
        seal.children[0].style.height = '24px';
        seal.children[0].style.opacity = '0.5';
    }
}

const agent = new Agent();
