// talk to the GraphQL endpoint
const gql = async (query, variables={}) => {
    let response = await fetch('/graphql', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            operationName: null,
            query,
            variables,
        }),
    });
    let json = await response.json();
    if (json.errors && json.errors.length) {
        throw json.errors;
    } else {
        return json.data;
    }
};

// some queries/mutations
const getConfession = async hash => gql('query Q($hash: String) { confession(hash: $hash) { title, hash } }', { hash }).then(d => d.confession);
const getConfessionWithMessage = async id => gql('mutation Q($id: String) { confessionWithMessage(id: $id) { title, hash, message } }', { id }).then(d => d.confessionWithMessage);
const addConfession = async (title, message) => gql('mutation M($title: String, $message: String) { addConfession(title: $title, message: $message) { id } }', { title, message }).then(d => d.addConfession);
const previewHash = async (title, message) => gql('mutation M($title: String, $message: String) { addConfession(title: $title, message: $message) { hash } }', { title, message }).then(d => d.addConfession);

// the important elements
const title = document.querySelector('#title');
const message = document.querySelector('#message');
const publish = document.querySelector('#publish');
const preview = document.querySelector('#preview');

// render a confession
const show = async confession => {
    if (confession) {
        preview.querySelector('.title').textContent = confession.title || '<title>';
        preview.querySelector('.hash').textContent = confession.hash || '<hash>';
        preview.querySelector('.message').textContent = confession.message || '<message>';
        preview.querySelector('.how-to-verify').textContent = `sha256(${JSON.stringify(confession.message || '')})`;
    } else {
        preview.innerHTML = '<em>Not found :(</em>';
    }
};

// update the confession preview
const update = async () => {
    let { hash } = await previewHash(title.value, message.value);
    let confession = await getConfession(hash);
    await show({
        ...confession,
        message: message.value,
    });
};
title.oninput = update;
message.oninput = update;

// publish a confession
publish.onclick = async () => {
    title.disabled = true;
    message.disabled = true;
    publish.disabled = true;

    let { id } = await addConfession(title.value, message.value);
    location.href = `#${id}`;
    location.reload();
};

// show a confession when one is given in the location hash
if (location.hash) {
    let id = location.hash.slice(1);
    document.querySelector('#input').remove();
    getConfessionWithMessage(id).then(show).catch(() => document.write('F'));
}
