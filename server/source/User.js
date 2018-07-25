const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('./Utils.js');


/**
 * A user.
*/
class User {

    constructor(id, jt) {
        this.jt             = jt;
        this.id             = id;
        this.sessionIds     = [];
        this.type           = 'regular';
    }

    static load(folder, filename, jt) {
        var user = new User('', jt);

        // Read fields, if any.
        var fn = path.join(folder, filename);
        if (fs.existsSync(fn)) {
            var json = Utils.readJSON(fn);
            user.id = json.id;
            if (json.type !== undefined) {
                user.type = json.type;
            } else {
                user.type = 'regular';
            }
            if (json.password !== undefined) {
                user.password = json.password;
            }
        }
        return user;
    }

    shell() {
        var out = {}
        out.id              = this.id;
        out.password        = this.password;
        out.type            = this.type;
        return out;
    }

    matches(id, pwd) {
        return (
            this.id === id &&
            (
                this.pwd == null ||
                this.pwd === pwd
            )
        );
    }

    isAdmin() {
        return this.type === 'administrator';
    }

}

var exports = module.exports = {};
exports.new = User;
exports.load = User.load;
