const { Builder, Browser, By } = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/firefox');
const { sleep } = require('./util');

const [BASE_URL, IGNORE_HTTPS_ERRORS] = process.env.BASE_URL
    ? [process.env.BASE_URL, false]
    : ['https://localhost:3443', true];
const FLAG = process.env.FLAG ?? 'flag{test}';
const TIMEOUT = parseInt(process.env.TIMEOUT ?? '30') * 1000;

async function visit(url, username, password) {
    let ff;
    try {
        ff = await new Builder()
            .forBrowser(Browser.FIREFOX)
            .setFirefoxOptions(new Options()
                .setAcceptInsecureCerts(IGNORE_HTTPS_ERRORS)
                .addArguments('--headless'))
            .build();

        console.log('[bot] Visiting:', BASE_URL);
        await ff.get(BASE_URL);
        await ff.executeScript(`window.localStorage.flag = ${JSON.stringify(FLAG)};`);

        await ff.findElement(By.id('login-toggle')).click();
        await ff.findElement(By.css('#dialog-login input[name="username"]')).sendKeys(username);
        await ff.findElement(By.css('#dialog-login input[name="password"]')).sendKeys(password);
        await ff.findElement(By.id('login-button')).click();
        await sleep(1_000);

        await newTab(ff);
        console.log('[bot] Visiting:', url);
        await ff.get(url);
        await sleep(TIMEOUT);
    } catch(error) {
        console.error('[bot] err:', error);
    } finally {
        if (ff) {
            await ff.quit();
        }
    }
}

async function newTab(driver) {
    // why is this so annoying?
    const oldTab = await driver.getWindowHandle();
    await driver.switchTo().newWindow('tab');
    const newTab = await driver.getWindowHandle();
    await driver.switchTo().window(oldTab);
    await driver.close();
    await driver.switchTo().window(newTab);
}

module.exports = { visit };
