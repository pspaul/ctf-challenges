const BAD_STUFF_SELECTORS = [
    ':empty:not(:empty)',
    '#this+is:not(.very)~hard.to#understand[but=also]+not>.very.easy',
    'nth-child:nth-child(2n):nth-child(2n+1)',
];

class HQ {
    constructor() {
        browser.runtime.onMessage.addListener(message => this.handleMessage(message));
    }
    log(...args) {
        console.log('[HQ]', ...args);
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
                return await this[handlerName](message);
            } catch (e) {
                this.log('Error during message handling:', e);
            }
        } else {
            this.log('unknown msg type:', type, message);
        }
    }
    async onPage({ content }) {
        const doc = new DOMParser().parseFromString(content, 'text/html');

        // find all the bad elements
        const badThings = BAD_STUFF_SELECTORS
            .map(selector => doc.querySelectorAll(selector))
            .map(nodes => Array.from(nodes))
            .flat();

        const sendToActiveTab = message => this.onSendToTabs({
            message,
            tabQuery: {
                currentWindow: true,
                active: true,
            },
        });

        if (badThings.length > 0) {
            // there were bad things, report them back for removal
            badThings.forEach(badThing => {
                if (badThing.id == null || badThing.id === '') {
                    return;
                }
                
                sendToActiveTab({
                    type: 'bad',
                    category: badThing.tagName.toLowerCase(),
                    id: badThing.id,
                    badContent: content,
                });
            });
        } else {
            // report back that it is a nice website
            sendToActiveTab({
                type: 'good',
                goodContent: content,
            });
        }
    }
    async onSendToTabs({ tabQuery, message }) {
        const tabs = await browser.tabs.query(tabQuery);
        tabs.forEach(tab => {
            browser.tabs.sendMessage(tab.id, message);
        });
    }
    async onSaved({ category, id }) {
        // send statistics to popup window
        this.send({ category, id });
    }

    // helper methods to have a connection to the popup window
    async onPoll() {
        return new Promise(resolve => {
            this.respond = resolve;
        });
    }
    async send(message) {
        while (this.respond == null) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        this.respond(message);
        this.respond = null;
    }
}

const hq = new HQ();
