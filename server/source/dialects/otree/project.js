const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const runtime = require('./runtime.js');

/*
 * oTree projects: a folder with a settings.py, whose SESSION_CONFIGS list app sequences. jtree
 * shows each session config as a queue (see Queue.js), <folder>/settings.py#<name>, which adds
 * the config's apps to a session and sets session.otreeConfig (what the apps read as
 * session.config), its participation fee and exchange rate.
 */

/** Whether settings.py at settingsPath is an oTree project's. */
function isProject(settingsPath) {
    try {
        return path.basename(settingsPath) === 'settings.py' && /\bSESSION_CONFIGS\b/.test(fs.readFileSync(settingsPath, 'utf8'));
    } catch (err) {
        return false;
    }
}

/** The project's session configs, read by Python (throws PythonStarting while it starts). */
function sessionConfigs(settingsPath) {
    const bridge = runtime.getBridge();
    const dir = '/projects/' + crypto.createHash('sha1').update(path.resolve(settingsPath)).digest('hex').substring(0, 12);
    runtime.py.FS.mkdirTree(dir);
    runtime.py.FS.writeFile(dir + '/settings.py', fs.readFileSync(settingsPath));
    return JSON.parse(bridge.session_configs(dir));
}

/** The queue id of session config name in the project of settingsPath. */
function queueId(settingsPath, name) {
    return settingsPath + '#' + name;
}

/** If id is a session config's queue id, {settingsPath, name}; else null. */
function parseQueueId(id) {
    const m = /^(.*[\\/]settings\.py)#(.+)$/.exec(String(id));
    return m ? { settingsPath: m[1], name: m[2] } : null;
}

/** The script of the queue for a session config (see Queue#run): sets the session's config, then adds its apps. */
function queueScript(settingsPath, name) {
    const config = sessionConfigs(settingsPath).find((c) => c.name === name);
    if (config == null) {
        throw new Error('no session config ' + JSON.stringify(name) + ' in ' + settingsPath);
    }
    const dir = path.dirname(settingsPath);
    const lines = ['session.otreeConfig = ' + JSON.stringify(config) + ';'];
    if (config.participation_fee != null) lines.push('session.showUpFee = ' + JSON.stringify(config.participation_fee) + ';');
    if (config.real_world_currency_per_point != null) lines.push('session.exchangeRate = ' + JSON.stringify(config.real_world_currency_per_point) + ';');
    if (config.num_demo_participants != null) lines.push('session.suggestedNumParticipants = ' + JSON.stringify(config.num_demo_participants) + ';');
    for (const app of config.app_sequence || []) {
        lines.push('session.addApp(' + JSON.stringify(path.join(dir, app, '__init__.py')) + ');');
    }
    return { script: lines.join('\n') + '\n', config };
}

module.exports = { isProject, sessionConfigs, queueId, parseQueueId, queueScript };
