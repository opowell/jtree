const crypto    = require('crypto');
const session   = require('express-session');

/**
 * Decides who may use the admin interface: its pages, its socket.io connection
 * and the admin-only HTTP routes (session output downloads, /api).
 *
 * - With no admin password set (no {@link Settings#defaultAdminPwd}, no entries
 *   in {@link Settings#admins}, {@link Settings#multipleUsers} off), only the
 *   computer running jtree may, without logging in.
 * - Otherwise everyone, on this computer or another, logs in at /admin/login with
 *   the password (or as a user). The login is kept in a session cookie, which the
 *   admin's socket.io connection carries too.
 *
 * Sessions are kept in memory with a secret made at startup, so restarting jtree
 * logs every admin out.
 */
class AdminAuth {

    constructor(jt) {
        this.jt = jt;

        /** Express (and socket.io engine) middleware that loads req.session. */
        this.sessionMiddleware = session({
            name: 'jtree.sid',
            secret: crypto.randomBytes(32).toString('hex'),
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: jt.basePath === '' ? '/' : jt.basePath,
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            },
        });
    }

    /** Whether any admin password or user account is configured. */
    passwordSet() {
        const s = this.jt.settings;
        return (
            s.multipleUsers === true ||
            nonEmpty(s.defaultAdminPwd) ||
            Object.keys(s.admins || {}).length > 0
        );
    }

    /** Whether a request comes from the computer running jtree. */
    isLocal(req) {
        const address = req.socket && req.socket.remoteAddress;
        return (
            address === '127.0.0.1' ||
            address === '::1' ||
            address === '::ffff:127.0.0.1'
        );
    }

    /** Whether a request (an HTTP request, or a socket's handshake request) may act as admin. */
    isAuthorized(req) {
        if (req.session != null && req.session.jtreeAdmin === true) {
            return true;
        }
        return !this.passwordSet() && this.isLocal(req);
    }

    /**
     * The account matching a login, or null.
     *
     * @return {User|string|null} the user (multiple users mode), the id in settings.admins, 'defaultAdmin', or null.
     */
    findAccount(id, pwd) {
        const s = this.jt.settings;
        if (typeof pwd !== 'string') {
            return null;
        }
        if (s.multipleUsers === true) {
            for (const i in this.jt.data.users) {
                const user = this.jt.data.users[i];
                if (user.matches(id, pwd)) {
                    return user;
                }
            }
        }
        const admin = (s.admins || {})[id];
        if (admin != null && nonEmpty(admin.pwd) && safeEqual(admin.pwd, pwd)) {
            return id;
        }
        if (nonEmpty(s.defaultAdminPwd) && safeEqual(s.defaultAdminPwd, pwd)) {
            return 'defaultAdmin';
        }
        return null;
    }

    /** Express middleware: lets admins through, sends everyone else to the login page. */
    requireAdmin() {
        return (req, res, next) => {
            if (this.isAuthorized(req)) {
                return next();
            }
            if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
                return res.redirect(this.loginUrl(req.originalUrl));
            }
            res.status(401).type('text').send('jtree: admin login required.');
        };
    }

    loginUrl(next) {
        return this.jt.basePath + '/admin/login?next=' + encodeURIComponent(next || '');
    }

    /** Where to go after logging in: a page of this jtree, otherwise the admin. */
    safeNext(next) {
        const base = this.jt.basePath;
        if (
            typeof next === 'string' &&
            next.startsWith(base + '/') &&
            !next.startsWith('//') &&
            !next.includes('\\')
        ) {
            return next;
        }
        return base + '/admin/';
    }

    /** GET /admin/login */
    sendLoginPage(req, res, error) {
        const jt = this.jt;
        const next = this.safeNext(req.query.next || (req.body && req.body.next));
        const askId = jt.settings.multipleUsers === true || Object.keys(jt.settings.admins || {}).length > 0;
        let body;
        if (!this.passwordSet()) {
            body = `
            <p>No admin password is set, so the admin interface only opens on the computer running jtree
            (<a href="http://localhost:${esc(String(jt.settings.port))}${esc(jt.basePath)}/admin/">http://localhost:${esc(String(jt.settings.port))}${esc(jt.basePath)}/admin/</a>).</p>
            <p>To use it from other computers, set <code>"defaultAdminPwd"</code> in <code>client/settings.json</code>
            in the jtree folder, then restart jtree.</p>`;
        } else {
            body = `
            <form method="post" action="${esc(jt.basePath)}/admin/login">
                <input type="hidden" name="next" value="${esc(next)}">
                ${askId ? '<label>User<input name="uId" autocomplete="username" autofocus></label>' : ''}
                <label>Password<input name="pwd" type="password" autocomplete="current-password" ${askId ? '' : 'autofocus'}></label>
                ${error ? `<p class="error">${esc(error)}</p>` : ''}
                <button type="submit">Log in</button>
            </form>`;
        }
        res.status(error ? 401 : 200).type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>jtree admin login</title>
<style>
    :root { color-scheme: light dark; --bg: #f4f4f5; --fg: #18181b; --card: #fff; --line: #d4d4d8; --accent: #2563eb; --err: #b91c1c; }
    @media (prefers-color-scheme: dark) { :root { --bg: #18181b; --fg: #f4f4f5; --card: #27272a; --line: #3f3f46; --accent: #60a5fa; --err: #f87171; } }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, sans-serif; }
    main { width: min(24rem, calc(100vw - 2rem)); background: var(--card); border: 1px solid var(--line); border-radius: 8px; padding: 1.5rem; box-sizing: border-box; }
    h1 { margin: 0 0 1rem; font-size: 1.25rem; }
    label { display: block; margin-bottom: 0.75rem; font-size: 0.875rem; }
    input { display: block; width: 100%; box-sizing: border-box; margin-top: 0.25rem; padding: 0.5rem; font: inherit; border: 1px solid var(--line); border-radius: 4px; background: var(--bg); color: var(--fg); }
    button { padding: 0.5rem 1rem; font: inherit; border: 0; border-radius: 4px; background: var(--accent); color: #fff; cursor: pointer; }
    .error { color: var(--err); margin: 0 0 0.75rem; }
    code { font-size: 0.875em; }
    a { color: var(--accent); }
</style>
</head>
<body>
<main>
    <h1>jtree admin</h1>
    ${body}
</main>
</body>
</html>`);
    }

    /** POST /admin/login */
    login(req, res) {
        const body = req.body || {};
        const account = this.findAccount(body.uId, body.pwd);
        if (account === null) {
            return this.sendLoginPage(req, res, 'Wrong user or password.');
        }
        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).type('text').send('jtree: could not start a session.');
            }
            req.session.jtreeAdmin = true;
            if (typeof account === 'object') {
                account.sessionIds.push(req.session.id);
                req.session.userId = account.id;
                res.cookie('userId', account.id);
            }
            res.redirect(this.safeNext(body.next));
        });
    }

}

function nonEmpty(s) {
    return typeof s === 'string' && s !== '';
}

function safeEqual(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

var exports = module.exports = {};
exports.new = AdminAuth;
