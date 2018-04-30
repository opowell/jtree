const Utils     = require('./Utils.js');

/**
* A Table.
*/
class Table {

    constructor(name, emitFunc, context, cId, session) {
        this.name = name;
        this.idCounter = 0;
        this.rows = [];
        this.emitFunc = emitFunc;
        this.context = context;
        this.contextId = cId;
        this.session = session;
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
