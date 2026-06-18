// Phase 9 verification: end-to-end API flow the React FE depends on.
// Mirrors the frontend's calls: signup brand-new users, GET /users,
// create a conversation (no hardcoded ids), activity sorting, lastMessage
// updates, and cross-user access -> 403.
// Run against a server started on BASE (default http://localhost:3099).
const BASE = process.env.BASE ?? 'http://localhost:3099';

async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { status: res.status, json };
}

function assert(cond, msg) {
  if (!cond) throw new Error('ASSERT FAILED: ' + msg);
}

const ok = (r, msg) => {
  assert(r.status >= 200 && r.status < 300, `${msg} (status ${r.status})`);
  return r.json;
};

const stamp = Date.now();
const signup = (n) =>
  api('/auth/signup', {
    method: 'POST',
    body: {
      email: `e2e_${stamp}_${n}@example.com`,
      password: 'password123',
      name: `E2E ${n}`,
    },
  });

const noMongoInternals = (obj) =>
  obj && typeof obj === 'object' && !('_id' in obj) && !('__v' in obj);

// --- 1. brand-new signups (no seed) ---
const a = ok(await signup('a'), 'signup a');
const b = ok(await signup('b'), 'signup b');
const c = ok(await signup('c'), 'signup c');
assert(a.token && a.user?.id, 'signup returns token + user');
assert(noMongoInternals(a.user), 'signup user has no _id/__v');
assert(
  a.user.passwordHash === undefined && a.user.password === undefined,
  'signup user must not leak password fields',
);
console.log('PASS: brand-new signups return clean PublicUser + token.');

// --- 2. GET /me ---
const me = ok(await api('/me', { token: a.token }), 'GET /me');
assert(me.id === a.user.id, 'GET /me returns the authenticated user');
assert(noMongoInternals(me), '/me has no _id/__v');
console.log('PASS: GET /me returns the authenticated user.');

// --- 3. GET /users lists the new users ---
const usersRes = ok(await api('/users', { token: a.token }), 'GET /users');
const userIds = new Set(usersRes.users.map((u) => u.id));
assert(
  userIds.has(a.user.id) && userIds.has(b.user.id) && userIds.has(c.user.id),
  'GET /users lists all brand-new users',
);
assert(usersRes.users.every(noMongoInternals), '/users entries clean');
assert(
  usersRes.users.every((u) => u.passwordHash === undefined),
  '/users must not leak passwordHash',
);
console.log('PASS: GET /users lists brand-new users (no hardcoded ids).');

// --- 4. create conversation A<->B using a discovered id (no hardcoding) ---
const conv1 = ok(
  await api('/conversations', {
    method: 'POST',
    token: a.token,
    body: { title: 'A and B', participantIds: [b.user.id] },
  }),
  'POST /conversations A-B',
).conversation;
assert(noMongoInternals(conv1), 'conversation has no _id/__v');
assert(
  conv1.participantIds.includes(a.user.id) &&
    conv1.participantIds.includes(b.user.id),
  'creator auto-added; both participants present',
);
console.log('PASS: conversation created from discovered user id.');

// --- 5. activity sorting: newest activity first ---
const conv2 = ok(
  await api('/conversations', {
    method: 'POST',
    token: a.token,
    body: { title: 'A and C', participantIds: [c.user.id] },
  }),
  'POST /conversations A-C',
).conversation;

// Touch conv1 last so it should sort ahead of conv2.
await api(`/conversations/${conv2.id}/messages`, {
  method: 'POST',
  token: a.token,
  body: { body: 'hello C' },
});
const sent = ok(
  await api(`/conversations/${conv1.id}/messages`, {
    method: 'POST',
    token: a.token,
    body: { body: 'hello B' },
  }),
  'POST message conv1',
).message;
assert(sent.status === 'sent', 'created message status is "sent"');
assert(noMongoInternals(sent), 'message has no _id/__v');

const list = ok(await api('/conversations', { token: a.token }), 'GET /conversations');
const order = list.conversations.map((cv) => cv.id);
const i1 = order.indexOf(conv1.id);
const i2 = order.indexOf(conv2.id);
assert(i1 !== -1 && i2 !== -1, 'both conversations listed');
assert(i1 < i2, 'most recently active conversation sorts first');
for (let i = 1; i < list.conversations.length; i++) {
  assert(
    list.conversations[i - 1].updatedAt >= list.conversations[i].updatedAt,
    'conversations sorted by updatedAt desc',
  );
}
console.log('PASS: conversations sorted by last activity (updatedAt desc).');

// --- 6. send updates lastMessage ---
const conv1After = list.conversations.find((cv) => cv.id === conv1.id);
assert(conv1After.lastMessage?.body === 'hello B', 'lastMessage reflects newest send');
console.log('PASS: sending a message updates the parent conversation lastMessage.');

// --- 7. cross-user access -> 403 (never the data) ---
const forbiddenGet = await api(`/conversations/${conv1.id}/messages`, {
  token: c.token,
});
assert(forbiddenGet.status === 403, `non-participant GET should be 403, got ${forbiddenGet.status}`);
assert(
  forbiddenGet.json?.error?.code === 'FORBIDDEN',
  'forbidden error uses nested { error: { code: FORBIDDEN } } shape',
);
assert(forbiddenGet.json?.messages === undefined, 'forbidden response leaks no messages');

const forbiddenPost = await api(`/conversations/${conv1.id}/messages`, {
  method: 'POST',
  token: c.token,
  body: { body: 'i should not be here' },
});
assert(forbiddenPost.status === 403, `non-participant POST should be 403, got ${forbiddenPost.status}`);
console.log('PASS: cross-user access returns 403 with no data leak.');

// --- 8. auth required ---
const noAuth = await api('/conversations');
assert(noAuth.status === 401, `missing token should be 401, got ${noAuth.status}`);
assert(noAuth.json?.error?.code === 'UNAUTHORIZED', '401 uses UNAUTHORIZED code');
console.log('PASS: missing token returns 401 UNAUTHORIZED.');

console.log('\nE2E PASS: signup, /me, /users, conversation create, sorting, lastMessage, 403, 401.');
