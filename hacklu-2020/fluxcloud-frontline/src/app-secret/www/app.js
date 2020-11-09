const socket = io({
    path: '/_meta/socket.io/',
});
socket.on('data', ([public, secret]) => {
    document.querySelector('[data-page=public] .data-load').textContent = public.toFixed(2);
    document.querySelector('[data-page=secret] .data-load').textContent = secret.toFixed(2);
});

const Status = {
    Good: 0,
    Meh: 1,
    Bad: 2,
};
const pages = [
    { id: 'public', hostname: 'public.frontline.cloud.flu.xxx' },
    { id: 'secret', hostname: 'secret.frontline.cloud.flu.xxx' },
];

async function checkHealth(hostname) {
    const r = await fetch(`/_meta/api/check?hostname=${hostname}`, {
        redirect: 'manual',
        cache: 'no-cache',
    });

    if (r.status >= 500) {
        return Status.Bad;
    } else if (r.status >= 400) {
        return Status.Meh;
    } else {
        return Status.Good;
    }
}
async function updateStatus() {
    for (const page of pages) {
        const elem = document.querySelector(`[data-page=${page.id}] > *:nth-child(3)`);
        elem.textContent = 'Checking...';
        elem.classList.remove('text-red-500');
        elem.classList.remove('text-green-500');
        elem.classList.add('text-gray-500');

        const health = await checkHealth(page.hostname);
        if (health === Status.Good) {
            elem.textContent = 'Operational';
            elem.classList.remove('text-gray-500');
            elem.classList.remove('text-yellow-500');
            elem.classList.remove('text-red-500');
            elem.classList.add('text-green-500');
        } else if (health === Status.Meh) {
            elem.textContent = 'Partial Outage';
            elem.classList.remove('text-gray-500');
            elem.classList.remove('text-green-500');
            elem.classList.remove('text-red-500');
            elem.classList.add('text-yellow-500');
        } else {
            elem.textContent = 'Full Outage';
            elem.classList.remove('text-gray-500');
            elem.classList.remove('text-green-500');
            elem.classList.remove('text-yellow-500');
            elem.classList.add('text-red-500');
        }
    }
}

updateStatus();
