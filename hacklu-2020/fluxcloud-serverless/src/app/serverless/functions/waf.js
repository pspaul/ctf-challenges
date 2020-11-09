/**
 * A demo Web Application Firewall (WAF).
 */

const badStrings = [
    /X5O!P%@AP\[4\\PZX54\(P\^\)7CC\)7\}\$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!\$H\+H\*/i,
    /woyouyizhixiaomaol/i,
    /conglaiyebuqi/i,
    /UNION/i,
    /SELECT/i,
    /SLEEP/i,
    /BENCHMARK/i,
    /alert\(1\)/i,
    /<script>/i,
    /onerror/i,
    /flag/i,
];

function checkRecursive(value) {
    // don't get bypassed by double-encoding
    const hasPercentEncoding = /%[a-fA-F0-9]{2}/i.test(value);
    if (hasPercentEncoding) {
        return checkRecursive(decodeURIComponent(value));
    }

    // check for any bad word
    for (const badWord of badStrings) {
        if (badWord.test(value)) {
            return true;
        }
    }
    return false;
}

function isBad(req) {
    const toCheck = ['url', 'body'];
    for (const key of toCheck) {
        const value = req[key];
        if (!value) {
            continue;
        }
        if (checkRecursive(String(value))) {            
            return key;
        }
    }
    return null;
}

// use named function for better logging
module.exports = async function waf(req, res, next) {
    const blockReason = isBad(req);
    if (blockReason !== null) {
        res.status(403);
        res.set('X-WAF-Blocked', blockReason);
        // internal redirect to /blocked so the app can show a custom 403 page
        req.url = '/blocked';
        return;
    }
};
