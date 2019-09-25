import path from 'path'
import fs from 'fs-extra'

function isFunction(obj) {
    return typeof obj == 'function';
}

// https://blog.tompawlak.org/generate-random-values-nodejs-javascript
// This function generates random integer between two numbers low (inclusive) and high (exclusive) ([low, high))
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function randomEl(array) {
    var i = randomInt(0, array.length);
    return array[i];
}

// https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function drawRandomly(data, options) {
    let out = [];

    for (let i=0; i<options.numDraws; i++) {
        if (options.withReplacement) {
            out.push(randomEl(data));
        } else {
            // Todo.
        }
    }
    return out;
}

function shuffle(array) {

    var currentIndex = array.length,
     temporaryValue,
     randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

// eslint-disable-next-line no-unused-vars
function evalInContext(x, player, clock) {
    let group = player.group;
    let period = group.period;
    let app = period.app;
    // eslint-disable-next-line no-unused-vars
    let session = app.session;
    // eslint-disable-next-line no-unused-vars
    let stage = player.stage;
    // eslint-disable-next-line no-unused-vars
    let participant = player.participant;
    try {
        return eval(x);
    } catch (err) {
        return 'error';
    }
}

function sum(items, prop) {
    return items.reduce(function(a, b){
        if (isNumeric(b[prop])) {
            return a + b[prop];
        } else {
            return a;
        }
    }, 0);
}

function getStageContents(app, stage) {
    var fn = path.join(__dirname, 'apps/' + app + '/' + stage + '.html')
    var html = fs.readFileSync(fn, 'utf8');
    return html;
}

// https://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

// https://stackoverflow.com/questions/1726630/formatting-a-number-with-exactly-two-decimals-in-javascript
function round(value, exp) {
  if (typeof exp === 'undefined' || +exp === 0)
    return Math.round(value);

  value = +value;
  exp = +exp;

  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0))
    return NaN;

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp)));

  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp));
}

function outputFields(self) {
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

function decomposeId(id) {
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

// Find by ID
function findById(array, id) {
    for (let i in array) {
      if (array[i] !== undefined && array[i].id === id) {
        return array[i];
      }
    }
    return null;
}

// http://stackoverflow.com/questions/5767325/how-to-remove-a-particular-element-from-an-array-in-javascript
function deleteById(array, id) {
    for (var i = array.length-1; i>=0; i--) {
        if (array[i] != null && array[i].id === id) {
           array.splice(i, 1);
        }
    }
}

function objLength(obj) {
    return Object.keys(obj).length;
}

export default {
    decomposeId,
    deleteById,
    drawRandomly,
    evalInContext,
    findById,
    getStageContents,
    isFunction,
    isNumber,
    isNumeric,
    objLength,
    outputFields,
    randomEl,
    randomInt,
    round,
    shuffle,
    sum,
}