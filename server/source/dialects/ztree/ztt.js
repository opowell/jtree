/*
 * Reads z-Tree treatments (.ztt): z-Tree's binary format, as z-Tree 3 writes it (file versions
 * 16, 18 and 34 at least), into a plain object (see readTreatment). Written from z-Tree's example
 * treatments; z-Tree's format is not published.
 *
 * The format is a tree of objects. Each object is its class's name (a length-prefixed string such
 * as "EEXStage"), then its fields; in a list, each object is preceded by a 0 byte, and the list by
 * its length (4 bytes). Strings are MFC's: a length byte (or 0xff and 2 more bytes, ...) and
 * Windows-1252 text. Each class's leading fields are read exactly; the bytes after them, which hold
 * display settings this reader does not need, are skipped up to the next object, and the tree is
 * put together from the objects' classes, with the lists' lengths where their place is known.
 */

const CLASS_TAG = /^(EEX|CPGX)[A-Za-z]+$/;

// Boxes (z-Tree's screen areas), items in them, and buttons.
const BOX_CLASSES = {
    EEXDialogWindow: 'standard',
    EEXHeaderWindow: 'header',
    EEXHelpWindow: 'help',
    EEXContainerWindow: 'container',
    EEXShowContractWindow: 'contractList',
    EEXMakeContractWindow: 'contractCreation',
    EEXHistoryWindow: 'history',
    EEXGridWindow: 'grid',
    EEXChatterbox: 'chat',
    EEXButtonWindow: 'calculator',
    EEXMessageWindow: 'message',
    EEXPlotWindow: 'plot',
    EEXMultimediaWindow: 'multimedia',
};
const ITEM_CLASSES = new Set(['EEXInfoItem']);

// Windows-1252's characters 0x80-0x9f, where it differs from Latin-1.
const CP1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';
function decode(bytes) {
    let out = '';
    for (const b of bytes) out += b >= 0x80 && b <= 0x9f ? CP1252[b - 0x80] : String.fromCharCode(b);
    return out;
}

class ZttError extends Error {}

/** Reads fields from bytes buf[start, end). */
class Reader {
    constructor(buf, start = 0, end = buf.length) {
        this.buf = buf;
        this.pos = start;
        this.end = end;
    }
    get left() { return this.end - this.pos; }
    need(n) {
        if (this.pos + n > this.end) throw new ZttError('the file ends early, at byte ' + this.pos);
    }
    u8() { this.need(1); return this.buf[this.pos++]; }
    u16() { this.need(2); const v = this.buf.readUInt16LE(this.pos); this.pos += 2; return v; }
    i32() { this.need(4); const v = this.buf.readInt32LE(this.pos); this.pos += 4; return v; }
    skip(n) { this.need(n); this.pos += n; }
    /** An MFC CString. */
    str() {
        let n = this.u8();
        if (n === 0xff) {
            n = this.u16();
            if (n === 0xfffe) throw new ZttError('Unicode strings are not read yet (byte ' + this.pos + ')');
            if (n === 0xffff) n = this.i32();
        }
        this.need(n);
        const s = decode(this.buf.subarray(this.pos, this.pos + n));
        this.pos += n;
        return s.replace(/\r\n/g, '\n');
    }
    /** The strings that look like CStrings in what is left (for fields after lists, read loosely). */
    strings() {
        const out = [];
        let p = this.pos;
        while (p < this.end) {
            const n = this.buf[p];
            if (n >= 1 && n < 0xff && p + 1 + n <= this.end) {
                const bytes = this.buf.subarray(p + 1, p + 1 + n);
                if (bytes.every((c) => c >= 32 && c !== 127 || c === 9 || c === 10 || c === 13)) {
                    out.push(decode(bytes).replace(/\r\n/g, '\n'));
                    p += 1 + n;
                    continue;
                }
            }
            p++;
        }
        return out;
    }
}

/**
 * The file's objects, in order: {cls, start (of its class name), body (where its fields start),
 * end (where the next object starts)}.
 */
function tokenize(buf) {
    const tokens = [];
    for (let p = 0; p + 2 < buf.length; p++) {
        const n = buf[p];
        if (n < 6 || n > 40 || p + 1 + n > buf.length) continue;
        const first = buf[p + 1];
        if (first !== 0x45 && first !== 0x43) continue; // E, C
        const name = buf.toString('latin1', p + 1, p + 1 + n);
        if (!CLASS_TAG.test(name)) continue;
        // The next byte must not continue the name (a longer name with this one in it).
        tokens.push({ cls: name, start: p, body: p + 1 + n });
        p += n;
    }
    // An object's fields end where the next object starts (in a list, after a 0 byte before its
    // class name; the readers read only the fields they know, so that byte does no harm).
    for (let i = 0; i < tokens.length; i++) {
        const next = tokens[i + 1];
        tokens[i].end = next == null ? buf.length : next.start;
    }
    return tokens;
}

/** Reads a z-Tree treatment (.ztt) from buf; returns its description (see the end of this function). */
function readTreatment(buf) {
    const version = buf.readInt32LE(0);
    const tokens = tokenize(buf);
    if (tokens.length === 0 || tokens[0].cls !== 'CPGXGame') {
        throw new ZttError('not a z-Tree treatment (no CPGXGame at its start)');
    }
    const warnings = [];
    const reader = (t) => new Reader(buf, t.body, t.end);
    // Bytes between a stage's timeout and its active screen's length, by file version.
    const STAGE_OPTIONS = version <= 16 ? 8 : version <= 18 ? 13 : 17;
    const BOX_EXTRA = version > 18 ? 1 : 0;

    const game = { version, tables: [], background: newStage('Background'), stages: [], periods: [], subjects: [], params: [] };
    readGameHeader(reader(tokens[0]), game);

    function newStage(name) {
        return { name, programs: [], timeout: '', options: [], showHeader: true, active: [], waiting: [] };
    }

    // The tree, built from the objects' classes.
    let stage = game.background;
    let stageReader = null; // where the current stage's fields after its programs are
    let activeLeft = null;  // boxes of the current stage's active screen still to come
    let containers = [];    // open container boxes: {box, left}
    let box = null;
    let button = null;
    let lastReader = null;  // the last object's reader, after its fields

    /** The fields of a stage after its programs, read where they are (after its last program). */
    function finishStageFields() {
        if (stageReader == null) return;
        const r = stageReader;
        stageReader = null;
        try {
            stage.timeout = r.str();
            stage.options = [...buf.subarray(r.pos, r.pos + STAGE_OPTIONS)];
            r.skip(STAGE_OPTIONS);
            stage.showHeader = stage.options[STAGE_OPTIONS - 2] !== 0;
            activeLeft = r.i32();
        } catch (err) {
            warnings.push('stage ' + stage.name + ': ' + err.message);
            activeLeft = Infinity;
        }
    }

    function addBox(newBox) {
        // A child of the innermost container with children to come; else a box of the stage's screens.
        while (containers.length > 0 && containers[containers.length - 1].left === 0) containers.pop();
        if (containers.length > 0) {
            containers[containers.length - 1].box.boxes.push(newBox);
            containers[containers.length - 1].left--;
        } else if (stage === game.background) {
            (newBox.type === 'header' ? stage.active : stage.waiting).push(newBox);
        } else {
            finishStageFields();
            if (activeLeft > 0) {
                stage.active.push(newBox);
                activeLeft--;
            } else {
                stage.waiting.push(newBox);
            }
        }
        if (newBox.type === 'container') containers.push({ box: newBox, left: newBox.childCount });
    }

    // A box's settings after its lists are in the bytes after its last object (its last item,
    // or its last button's last checker or program).
    let tailBox = null;
    const settleTail = () => {
        if (tailBox != null && lastReader != null) tailBox.tailStrings = lastReader.strings();
        tailBox = null;
    };

    for (let i = 1; i < tokens.length; i++) {
        const t = tokens[i];
        const r = reader(t);
        if (BOX_CLASSES[t.cls] != null || /^EEX\w*Window$/.test(t.cls) || ['EEXStage', 'CPGXPeriodParam'].includes(t.cls)) settleTail();
        try {
            if (t.cls === 'EEXDatabaseInfo') {
                game.tables.push({ name: r.str() });
            } else if (t.cls === 'EEXProgram') {
                const program = { table: r.str(), owner: r.str(), condition: r.str(), code: r.str() };
                if (button != null) button.programs.push(program);
                else if (box != null && box.type === 'chat') box.programs.push(program);
                else if (box != null && box.type === 'contractCreation' && button == null) box.programs.push(program);
                else {
                    stage.programs.push(program);
                    if (stage !== game.background) stageReader = r;
                }
            } else if (t.cls === 'EEXStage') {
                finishStageFields();
                stage = newStage(r.str());
                game.stages.push(stage);
                r.i32(); // its programs' count
                stageReader = r;
                activeLeft = null;
                containers = [];
                box = button = null;
            } else if (BOX_CLASSES[t.cls] != null || /^EEX\w*Window$/.test(t.cls)) {
                box = readBox(r, t.cls);
                button = null;
                addBox(box);
                tailBox = box;
            } else if (ITEM_CLASSES.has(t.cls)) {
                const item = readItem(r);
                if (box != null) box.items.push(item);
            } else if (t.cls === 'EEXChecker') {
                const checker = readChecker(r);
                if (button != null) button.checkers.push(checker);
                else if (box != null) box.items.push(checker);
            } else if (t.cls === 'EEXContractButton') {
                button = readButton(r);
                if (box != null) box.buttons.push(button);
            } else if (t.cls === 'CPGXPeriodParam') {
                finishStageFields();
                box = button = null;
                game.periods.push({ name: r.str(), program: r.str() });
            } else if (t.cls === 'CPGXRole') {
                game.subjects.push({ name: r.str(), index: r.i32() });
            } else if (t.cls === 'CPGXSubjectParam') {
                const param = { label: r.str() };
                // A role's own parameters (after the role) are its program only; the table's cells
                // (period × subject) have a label, a group and a program.
                if (lastToken(i).cls === 'CPGXRole') {
                    game.subjects[game.subjects.length - 1].program = param.label;
                } else if (r.left >= 5) {
                    param.group = r.i32();
                    param.program = r.str();
                    game.params.push(param);
                }
            } else {
                warnings.push('an object of class ' + t.cls + ' (at byte ' + t.start + ') is not read');
            }
        } catch (err) {
            if (!(err instanceof ZttError)) throw err;
            warnings.push(t.cls + ' at byte ' + t.start + ': ' + err.message);
        }
        lastReader = r;
    }
    settleTail();
    finishStageFields();

    function lastToken(i) { return tokens[i - 1]; }

    /** A box's fields: its header (name, placement), and its type's own fields. */
    function readBox(r, cls) {
        const b = { type: BOX_CLASSES[cls] || 'unknown', cls, name: r.str(), items: [], buttons: [], boxes: [], programs: [] };
        r.u8();
        b.options = [...buf.subarray(r.pos, r.pos + 8)];
        r.skip(8);
        b.condition = r.str();
        b.left = r.str();
        b.right = r.str();
        b.width = r.str();
        b.top = r.str();
        b.bottom = r.str();
        b.height = r.str();
        r.skip(BOX_EXTRA);
        if (b.type === 'container') {
            b.childCount = r.i32();
        } else if (b.type === 'help') {
            b.title = r.str();
            b.text = r.str();
        } else if (b.type === 'header') {
            r.skip(4);
            b.texts = { period: r.str(), of: r.str(), trial: r.str(), time: r.str(), timeout: r.str() };
        } else if (b.type === 'chat') {
            b.table = r.str();
            b.variable = r.str();
            const rest = r.strings();
            b.condition2 = rest.find((s) => s !== b.table) || '';
            b.outputs = rest.filter((s) => s.includes('<')).slice(0, 1);
        }
        // Settings after the box's lists (contract boxes' table, condition and sorting) are read
        // later, loosely, from the bytes after its items (see settleBoxes).
        b.tailStrings = [];
        return b;
    }

    function readItem(r) {
        const item = { kind: 'item', label: r.str(), variable: r.str() };
        item.input = r.u8() !== 0;
        r.skip(5);
        item.min = r.str();
        item.max = r.str();
        item.layout = r.str();
        // A contract box's settings come after its last item, among the item's display settings.
        item.after = r.strings();
        return item;
    }

    function readChecker(r) {
        const checker = { kind: 'checker', label: r.str(), condition: r.str() };
        r.skip(4);
        checker.message = r.str();
        r.u8();
        checker.button = r.str();
        return checker;
    }

    function readButton(r) {
        r.skip(4);
        return { name: r.str(), checkers: [], programs: [], after: r.strings() };
    }

    settleBoxes(game);
    game.warnings = warnings;
    return game;
}

/** The treatment's settings before its tables: the texts shown to bankrupt subjects, ... (loosely). */
function readGameHeader(r, game) {
    const strings = r.strings();
    game.texts = strings;
}

/**
 * Contract boxes' table, condition and sorting, from the strings after their last item (where
 * z-Tree keeps them): [table, condition, sorting].
 */
function settleBoxes(game) {
    const visit = (b) => {
        if (['contractList', 'contractCreation', 'history', 'grid'].includes(b.type)) {
            const last = b.items.filter((i) => i.kind === 'item').pop();
            const after = last != null && last.after != null ? last.after : [];
            b.table = after[0] || (b.type === 'history' ? 'subjects' : 'contracts');
            // Its condition and sorting: after its buttons, or (with none) after the table's name.
            let tail = b.tailStrings || [];
            if (b.buttons.length === 0 && tail[0] === b.table) tail = tail.slice(1);
            // An owner variable (a variable's name) may come first; empty, it is not seen here.
            const isName = (x) => /^\w+$/.test(x || '');
            if (tail.length >= 2 && isName(tail[0]) && !isName(tail[1])) {
                b.owner = tail[0];
                tail = tail.slice(1);
            }
            b.tableCondition = b.type === 'contractList' ? (tail[0] || '') : '';
            b.sorting = b.type === 'contractList' ? (tail[1] || '') : '';
        }
        for (const item of b.items) delete item.after;
        for (const btn of b.buttons) delete btn.after;
        b.boxes.forEach(visit);
        delete b.tailStrings;
    };
    for (const s of [game.background, ...game.stages]) {
        s.active.forEach(visit);
        s.waiting.forEach(visit);
    }
}

module.exports = { readTreatment, tokenize, Reader, ZttError, decode };
