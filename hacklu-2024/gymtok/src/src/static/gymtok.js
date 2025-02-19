const postTemplate = document.getElementById('post-template').content.querySelector('.post');
const usertagTemplate = postTemplate.querySelector('.usertag');
const hashtagTemplate = postTemplate.querySelector('.hashtag');

function renderPost(post) {
    const view = postTemplate.cloneNode(true);
    view.querySelector('.post-data-avatar').src = post.avatar;
    view.querySelector('.post-data-user').textContent = post.user;
    view.querySelector('.post-data-description').textContent = post.description;
    const tags = view.querySelector('.post-data-tags');
    tags.replaceChildren();
    for (const tag of post.tags) {
        const tagView = tag.startsWith('@') ? usertagTemplate.cloneNode(true) : hashtagTemplate.cloneNode(true);
        tagView.textContent = tag;
        tags.append(tagView, ' ');
    }
    view.querySelector('.post-data-sound').textContent = post.sound;
    view.querySelector('.post-data-embed').src = post.embed;
    view.querySelector('.post-data-likes').textContent = post.likes;
    view.querySelector('.post-data-comments').textContent = post.comments;
    view.querySelector('.post-data-bookmarks').textContent = post.bookmarks;
    view.querySelector('.post-data-shares').textContent = post.shares;
    view.querySelector('.post-action-report').addEventListener('click', () => report(post));
    return view;
}

async function report(post) {
    try {
        const r = await fetch('/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: new URL(`/@${encodeURIComponent(post.user)}/video/${encodeURIComponent(post.id)}`, location.href).href,
            }),
        });
        const { success } = await r.json();
        if (success) {
            alert('Reported');
        } else {
            alert('Failed to report');
        }
    } catch (err) {
        console.error(err);
        alert(`Failed to report: ${err}`);
    }
}


const loginDialog = document.getElementById('dialog-login');
document.getElementById('login-toggle').addEventListener('click', () => loginDialog.showModal());
loginDialog.querySelector('.dialog-close').addEventListener('click', () => loginDialog.close());
document.getElementById('login-button').addEventListener('click', async () => login(
    loginDialog.querySelector('input[name="username"]').value,
    loginDialog.querySelector('input[name="password"]').value,
));

async function login(username, password) {
    try {
        const r = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });
        const { success, error } = await r.json();
        if (success) {
            location.reload();
        } else {
            alert(error);
        }
    } catch (err) {
        console.error(err);
        alert(`Failed to login: ${err}`);
    }
}


const uploadDialog = document.getElementById('dialog-upload');
document.getElementById('upload').addEventListener('click', upload);
uploadDialog.querySelector('.dialog-close').addEventListener('click', () => uploadDialog.close());
document.getElementById('dialog-upload-ok').addEventListener('click', () => uploadDialog.close());

async function upload() {
    const r = await fetch('/upload-config', { credentials: 'include' });
    const uploadConfig = await r.json();
    if ('error' in uploadConfig) {
        alert(uploadConfig.error);
        return;
    }

    const { port, creds, file } = uploadConfig;
    document.getElementById('upload-url').textContent = `ftp://${location.hostname}:${port}`;
    document.getElementById('upload-creds').textContent = creds;
    document.getElementById('upload-file').textContent = file;
    uploadDialog.showModal();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

window.onload = async () => {
    const feed = await fetch('/feed').then(r => r.json());
    if (feed.loggedIn) {
        document.getElementById('login-toggle').style.display = 'none';
    } else {
        document.getElementById('upload').disabled = true;
    }
    const forYou = document.getElementById('for-you');
    const showFeed = () => {
        forYou.classList.add('active');
        const feedView = document.getElementById('feed');
        feedView.replaceChildren();
        shuffle(feed.posts);
        feed.posts.forEach(post => feedView.appendChild(renderPost(post)));
    };
    forYou.addEventListener('click', showFeed);
    document.getElementById('goto-for-you').addEventListener('click', showFeed);
};
