const Utils     = require('./Utils.js');

/**
* A Table.
*/
class Table {

    constructor(name, emitFunc, context, cId, session) {
        /**
         * @type {Name}
         */
        this.name = name;

        /**
         * @type {Number}
         * @default 0
         */
        this.idCounter = 0;

        /**
         * @type Array
         * @default []
         */
        this.rows = [];

        /**
         * @type TODO
         */
        this.emitFunc = emitFunc;

        /**
         * @type TODO
         */
        this.context = context;

        /**
         * @type TODO
         */
        this.contextId = cId;

        /**
         * @type {Session}
         */
        this.session = session;

        /**
         * @type {String[]}
         */
        this.outputHide = ['id'];
    }

    /**
     * @static load - description
     *
     * CALLED FROM:
     * - {@link Session#load}
     *
     * @param  {type} json    description
     * @param  {type} session description
     * @return {type}         description
     */
    static load(json, session) {
        var context = Utils.loadContext(session, json.contextId);
        var newTable = new Table(json.name, json.emitFunc, context, json.contextId, session);
        newTable.idCounter = json.idCounter;
        newTable.rows = json.rows;
        context[newTable.name] = newTable;
    }

    new(data) {
        data.id = this.idCounter;
        this.rows.push(data);
        this.idCounter++;
        eval(this.emitFunc + '("' + this.name + 'Add", data)');
        this.save();
    }

    getRow(id) {
        return Utils.findByIdWOJQ(this.rows, id);
    }

    shell() {
        return this.rows;
    }

    outputFields() {
        var fields = [];
        for (var r=0; r<this.rows.length; r++) {
            var row = this.rows[r];
            for (var prop in row) {
                if (!fields.includes(prop) && !this.outputHide.includes(prop)) {
                    fields.push(prop);
                }
            }
        }
        return fields;
    }

    save() {
        try {
            this.session.jt.log('Table.save: ' + this.name);
            var toSave = {};
            toSave.name = this.name;
            toSave.idCounter = this.idCounter;
            toSave.rows = this.rows;
            toSave.emitFunc = this.emitFunc;
            toSave.contextId = this.contextId;
            this.session.saveDataFS(toSave, 'TABLE');
        } catch (err) {
            console.log('Error saving table ' + this.name + ': ' + err + '\n' + err.stack);
        }
    }

}

var exports = module.exports = {};
exports.new = Table;
exports.load = Table.load;
