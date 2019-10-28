const gdpr = () => {
    document.body.innerHTML += `
        <style>
            .gdpr, .cookies {
                position: fixed;
            }
            .gdpr {
                width: 18rem;
                top: 2em;
                left: 6em;
            }
            .cookies {
                width: 25rem;
                bottom: 8em;
                right: 3em;
            }
        </style>
        <div id="dialog" class="card gdpr">
            <h3 class="card-header">We attacc, we detecc, but most importantly we would like to tracc!</h3>
            <div class="card-body">
                <p>Pls agree so we can legally use the data we collecc anyways</p>
                <button class="btn btn-danger btn-sm" onclick="myPpAlwaysLimp()">uuhhhhh no?</button>
                <button class="btn btn-success btn-lg" onclick="accepp(1)">yeah sure</button>
            </div>
        </div>
    `;
};

const cookies = () => {
    document.body.innerHTML += `
        <div id="dialog" class="card cookies">
            <h3 class="card-header">How about some cookies?</h3>
            <div class="card-body">
                <p>They are delicious! :)</p>
                <button class="btn btn-danger btn-sm" onclick="myPpAlwaysLimp()">how about no</button>
                <button class="btn btn-success btn-lg" onclick="accepp(2)">cookieessss! 🥰</button>
            </div>
        </div>
    `;
};

const saveChoice = () => fetch('/tracc.php?tracc-me-pls');

const prompts = [gdpr, cookies, saveChoice];

const myPpAlwaysLimp = () => {
    location = 'about:blank';
};

const accepp = i => {
    document.body.removeChild(document.querySelector('#dialog'));
    if (i < prompts.length) {
        prompts[i]();
    }
};

document.body.onload = () => {
    setTimeout(prompts[0], 1337);
};
