const fs        = require('fs-extra');
const path      = require('path');
const jsonfile  = require('jsonfile');

/**
 * Set of utility functions.
 * */
class Utils {

    /**
    * isDirectory - description
    *
    * @param  {type} pathToCheck description
    * @return {type}             description
    */
    static isDirectory(pathToCheck) {
        if (fs.existsSync(pathToCheck)) {
            return fs.lstatSync(pathToCheck).isDirectory();
        } else {
            return false;
        }
    }

    static count(elements, condition) {
        var count = 0;
        for (var i in elements) {
            var element = elements[i];
            if (eval(condition) == true) {
                count++;
            }
        }
        return count;
    }

    static sum(elements, field) {
        var sum = 0;
        for (var i in elements) {
            var element = this.parseFloat(elements[i]);
            sum = sum + element[field];
        }
        return sum;
    }

    static values(els, field) {
        var out = [];
        for (var i=0; i<els.length; i++) {
            out.push(els[i][field]);
        }
        return out;
    }

    static writeJSON(filename, contents) {
        fs.writeJSONSync(filename, contents, {spaces: 4});
    }

    /**
     * CALLED FROM:
     * - {@link Session#addApp}
     *
     * @param  {type} sourceDir description
     * @param  {type} destDir description
     * @return {type}           description
     */
    static copyFiles(sourceDir, destDir) {
        fs.ensureDirSync(destDir);
        try {
          fs.copySync(sourceDir, destDir);
        } catch (err) {
          console.error(err);
        }
    }

    /**
     * CALLED FROM:
     * - {@link Session#addApp}
     *
     * @param  {type} sourceDir description
     * @param  {type} destDir description
     * @return {type}           description
     */
    static copyFile(fn, sourceDir, destDir) {
        fs.ensureDirSync(destDir);
        try {
          fs.copySync(path.join(sourceDir, fn), path.join(destDir, fn));
        } catch (err) {
          console.error(err);
        }
    }

    // http://www.davekoelle.com/files/alphanum.js
    // Sort alphanumerically in place.
    static alphanumSort(ids) {
        let caseInsensitive = true;
        for (var z = 0, t; t = ids[z]; z++) {
            ids[z] = new Array();
            var x = 0, y = -1, n = 0, i, j;
        
            while (i = (j = t.charAt(x++)).charCodeAt(0)) {
            var m = (i == 46 || (i >=48 && i <= 57));
            if (m !== n) {
                ids[z][++y] = "";
                n = m;
            }
            ids[z][y] += j;
            }
        }
        
        ids.sort(function(a, b) {
            for (var x = 0, aa, bb; (aa = a[x]) && (bb = b[x]); x++) {
            if (caseInsensitive) {
                aa = aa.toLowerCase();
                bb = bb.toLowerCase();
            }
            if (aa !== bb) {
                var c = Number(aa), d = Number(bb);
                if (c == aa && d == bb) {
                return c - d;
                } else return (aa > bb) ? 1 : -1;
            }
            }
            return a.length - b.length;
        });
        
        for (var z = 0; z < ids.length; z++)
            ids[z] = ids[z].join("");
    }        

    static shells(list) {
        var out = [];
        for (var p in list) {
            out.push(list[p].shell());
        }
        return out;
    }

    static readJS(file) {
        // Empty white space to force conversion to UTF-8.
        return fs.readFileSync(file) + '';
    }

    static readTextFile(file) {
        // Empty white space to force conversion to UTF-8.
        return fs.readFileSync(file) + '';
    }

    /**
    *
    * @param  {type} file description
    * @return {type}      description
    */
    static readJSON(file) {
        try {
            return jsonfile.readFileSync(file);
        } catch(err) {
            return 'JSON error';
        }
    }

    static getHeaders(fields, skipFields, headers) {
        for (var f in fields) {
            var prop = fields[f];
            if (!skipFields.includes(prop) && !headers.includes(prop)) {
                headers.push(prop);
            }
        }
    }

    // Returns groups of size 'groupSize'. Last group may not be full.
    static getRandomGroups(objects, groupSize) {
        var groups = [];
        var numGroups = Math.ceil(objects.length / groupSize);
        var keys = Object.keys(objects);
        for (var i=0; i<numGroups; i++) {
            var group = [];
            for (var j=0; j<groupSize; j++) {
                if (keys.length < 1) {
                    break;
                }
                var ind = Utils.randomInt(0, keys.length);
                var obj = objects[keys[ind]];
                keys.splice(ind, 1);
                group.push(obj);
            }
            groups.push(group);
        }
        return groups;
    }

    /**
    * Is the given object a function?
    *
    * @param  {type} obj The object to check.
    * @return {boolean}     true if the object is a function, false otherwise.
    */
    static isFunction(obj) {
        return typeof obj == 'function';
    }

    /**
    * This function generates random integer between two numbers low (inclusive) and high (exclusive) ([low, high))<br>
    * Reference: <a target='_blank' href='https://blog.tompawlak.org/generate-random-values-nodejs-javascript'>https://blog.tompawlak.org/generate-random-values-nodejs-javascript</a>
    * @param  {type} low  the lower bound.
    * @param  {type} high the upper bound.
    * @return {number}      A random number from [low, high).
    */
    static randomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }

    /**
     * randomEl - description
     *
     * @param  {type} array description
     * @return {type}       description
     */
    static randomEl(array) {
        return Utils.randomEls(array, 1)[0];
    }

    // https://stackoverflow.com/questions/9960908/permutations-in-javascript
    static permutations(inputArr) {
      let result = [];
      const permute = function(arr, m, result) {
        if (arr.length === 0) {
          result.push(m);
        } else {
          for (let i = 0; i < arr.length; i++) {
            let curr = arr.slice();
            let next = curr.splice(i, 1);
            permute(curr.slice(), m.concat(next), result);
         }
       }
     }
     permute(inputArr, [], result);
     return result;
    }

    static drawRandomly(data, options) {
        let out = [];
        let elementsLeft = [];
        for (let i in data) {
            elementsLeft.push(data[i]);
        }
        for (let i=0; i<options.numDraws; i++) {
            if (options.withReplacement) {
                out.push(this.randomEl(data));
            } else {
                // let el = this.ran
                // TODO.
            }
        }
        return out;
    }

    static shuffle(array) {

        // https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = this.randomInt(0, counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    /**
    * Random draws without replacement
    */
    static randomEls(array, num) {
        var out = [];
        var indices = [];
        for (var i=0; i<array.length; i++) {
            indices.push(i);
        }
        for (var i=0; i<num; i++) {
            var ind = Utils.randomInt(0, indices.length);
            out.push(array[indices[ind]]);
            indices.splice(ind, 1);
            if (indices.length === 0) {
                break;
            }
        }
        return out;
    }

    /**
    *  sum - description
    *
    * @param  {type} items description
    * @param  {type} prop  description
    * @return {type}       description
    */
    static sum(items, prop) {
        return items.reduce( function(a, b){
            return a + b[prop];
        }, 0);
    };

    //

    /**
    * Returns date in YYYYMMDD-HHmmss-SSS
    * Reference: https://stackoverflow.com/questions/42862729/convert-date-object-in-dd-mm-yyyy-hhmmss-format
    *
    * @return {type}  The formatted date.
    */
    static getDate() {
        var date = this.getDateObject();
        return date.year + date.formattedMonth + date.formattedDay + "-" +  date.formattedHour + date.formattedMinute + date.formattedSecond + '-' + date.formattedMS;
    }

    static diffDates(d1, d2) {
        let d1Obj = this.getDateObj(d1).getTime();
        let d2Obj = this.getDateObj(d2).getTime();
        let diff = d2Obj - d1Obj;
        return diff;
    }

    static getDateObj(dateString) {
        let year = dateString.substring(0, 4) - 0;
        let month = dateString.substring(4, 6) - 0;
        let day = dateString.substring(6, 8) - 0;
        let hour = dateString.substring(9, 11) - 0;
        let minute = dateString.substring(11, 13) - 0;
        let sec = dateString.substring(13, 15) - 0;
        let millisecond = dateString.substring(16) - 0;
        return new Date(
            year,
            month,
            day,
            hour,
            minute,
            sec,
            millisecond
        );
    }

    static dateFromStr(str) {
        str = 
            str.substring(0, 4) + '-' + 
            str.substring(4, 6) + '-' + 
            str.substring(6, 8) + 'T' + 
            str.substring(9, 11) + ':' + 
            str.substring(11, 13) + ':' + 
            str.substring(13, 15) + '.' + 
            str.substring(16, 19);
        return new Date(str);
    }

    static min(array, field) {
        var out = null;
        for (var i=0; i<array.length; i++) {
            if (out === null || out > array[i][field]) {
                out = array[i][field];
            }
        }
        return out;
    }

    static getDateObject() {
        var out = {};
        var date = new Date();
        out.year = date.getFullYear();
        out.month = (date.getMonth() + 1).toString();
        out.formattedMonth = (out.month.length === 1) ? ("0" + out.month) : out.month;
        out.day = date.getDate().toString();
        out.formattedDay = (out.day.length === 1) ? ("0" + out.day) : out.day;
        out.hour = date.getHours().toString();
        out.formattedHour = (out.hour.length === 1) ? ("0" + out.hour) : out.hour;
        out.minute = date.getMinutes().toString();
        out.formattedMinute = (out.minute.length === 1) ? ("0" + out.minute) : out.minute;
        out.second = date.getSeconds().toString();
        out.formattedSecond = (out.second.length === 1) ? ("0" + out.second) : out.second;
        out.ms = date.getMilliseconds().toString();
        out.formattedMS = out.ms;
        if (out.ms.length === 1) {
            out.formattedMS = '00' + out.ms;
        } else if (out.ms.length === 2) {
            out.formattedMS = '0' + out.ms;
        }
        return out;
    }

    static getStageContents(app, stage) {
        var fn = path.join(app.session.jt.path, 'apps/' + app + '/' + stage + '.html')
        var html = fs.readFileSync(fn, 'utf8');
        return html;
    }

    static outputFields(self) {
        var fields = [];
        for (var prop in self) {
            if (
                !isFunction(self[prop]) &&
                !self.outputHide.includes(prop) &&
                !self.outputHideAuto.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    // http://stackoverflow.com/questions/7364150/find-object-by-id-in-an-array-of-javascript-objects
    static findById(array, id) {
        if (array === null || array === undefined) {
            return null;
        }
        var out = $.grep(array, function(e) {
            return e !== undefined && e.id === id;
        });
        if (out.length > 0) {
            return out[0];
        }
        else {
            return null;
        }
    }

    // Find by ID without JQuery ($)
    static findByIdWOJQ(array, id) {
        for (let i in array) {
            if (array[i] !== undefined && array[i].id === id) {
                return array[i];
            }
        }
        return null;
    }

    // http://stackoverflow.com/questions/5767325/how-to-remove-a-particular-element-from-an-array-in-javascript
    static deleteById(array, id) {
        for (var i = array.length-1; i>=0; i--) {
            if(array[i].id === id) {
                array.splice(i, 1);
            }
        }
    }

    static objLength(obj) {
        return Object.keys(obj).length;
    }

    static createFile(fn) {
        fs.closeSync(fs.openSync(fn, 'w'));
    }

    // Recursively parse data fields as float numbers.
    static parseFloatRec(data, parsedObjs) {
        if (parsedObjs == null) {
            parsedObjs = [];
        }
        try {
            if (Utils.isNumeric(data)) {
                data = parseFloat(data, 10);
            } else if (typeof data === 'object') {
                parsedObjs.push(data);
                for (var i in data) {
                    if (!parsedObjs.includes(data[i])) {
                        data[i] = Utils.parseFloatRec(data[i], parsedObjs);
                    }
                }
            }
            return data;
        } catch (err) {
            return data;
        }
    }

    static decomposeId(id) {
        var out = {};
        var sesI = id.indexOf('session_');
        var sesInd = sesI + 'session_'.length;
        var appI = id.indexOf('_app_');
        if (appI === -1) {
            out.sessionId = id.substring(sesInd);
        } else {
            out.sessionId = id.substring(sesInd, appI);
            var appInd = appI + '_app_'.length;
            var prdI = id.indexOf('_period_');
            if (prdI === -1) {
                out.appId = id.substring(appInd);
            } else {
                out.appId = id.substring(appInd, prdI);
                var prdInd = prdI + '_period_'.length;
                var grpI = id.indexOf('_group_');
                if (grpI === -1) {
                    out.periodId = parseInt(id.substring(prdInd));
                } else {
                    out.periodId = parseInt(id.substring(prdInd, grpI));
                    var grpInd = grpI + '_group_'.length;
                    var plyI = id.indexOf('_player_');
                    if (plyI === -1) {
                        out.groupId = parseInt(id.substring(grpInd));
                    } else {
                        out.groupId = parseInt(id.substring(grpInd, plyI));
                        var plyInd = plyI + '_player_'.length;
                        out.playerId = id.substring(plyInd);
                    }
                }
            }
        }
        return out;
    }

    /**
     * loadContext - loads an object based on an id.
     * TODO: Add check for participant
     *
     * @param  {type} session description
     * @param  {type} id      description
     * @return {type}         description
     */
    static loadContext(session, id) {
        var ids = Utils.decomposeId(id);
        var out = null;
        if (ids.appId === null || ids.appId === undefined) {
            return session;
        } else {
            if (ids.periodId === null || ids.periodId === undefined) {
                return Utils.findByIdWOJQ(session.apps, ids.appId);
            } else {
                var app = Utils.findByIdWOJQ(session.apps, ids.appId);
                if (ids.groupId === null || ids.groupId === undefined) {
                    return Utils.findByIdWOJQ(app.periods, ids.periodId);
                } else {
                    var period = Utils.findByIdWOJQ(app.periods, ids.periodId);
                    if (ids.playerId === null || ids.playerId === undefined) {
                        return Utils.findByIdWOJQ(period.groups, ids.groupId);
                    } else {
                        var group = Utils.findByIdWOJQ(period.groups, ids.groupId);
                        return Utils.findByIdWOJQ(group.players, ids.playerId);
                    }
                }
            }
        }
    }

    static isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
}

module.exports = Utils;
