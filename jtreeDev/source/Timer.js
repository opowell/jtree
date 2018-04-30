// @flow

/**
* A timer that expires after a certain amount of time.
*/
class Timer {

    // timeStarted: Date;
    // duration: number;
    // timeLeft: number;
    // stageIndex: number;
    // callback: function;
    // running: boolean;
    // timer: any;

    /**
    * constructor - description
    *
    * @param  {type} callback   The code to execute once the timer expires.
    * @param  {type} duration   The length of time to wait until the timer expires.
    * @param  {type} stageIndex description
    * @return {type}            description
    */
    // constructor(callback: function, duration: number, stageIndex: number) {
    constructor(callback, duration, stageIndex) {
        this.timeStarted = new Date();
        this.duration = duration;
        this.timeLeft = duration;
        this.stageIndex = stageIndex;
        this.callback = callback;
        this.running = false;
        this.setRunning(true);
    }

    /**
    * @static load - description
    *
    * @param  {type} ts         description
    * @param  {type} d          description
    * @param  {type} tl         description
    * @param  {type} stageIndex description
    * @param  {type} cb         description
    * @return {type}            description
    */
    static load(d, tl, stageIndex, cb) {
        var timer = new Timer(cb, 0, stageIndex);
        timer.duration = d;
        timer.timeLeft = tl;
        timer.stageIndex = stageIndex;
        return timer;
    }

    setRunning(b) {
        if (b) {
            this.resume();
        } else {
            this.pause();
        }
    }

    pause() {
        clearTimeout(this.timer);
        if (this.running) {
            var now = new Date();
            this.timeLeft = this.timeLeft - (now.getTime() - this.timeStarted.getTime());
        }
        this.running = false;
    }

    state() {
        var out = {};
        out.running = this.running;
        out.timeLeft = this.timeLeft;
        if (this.running) {
            var now = new Date();
            out.timeElapsed = now.getTime() - this.timeStarted.getTime();
        }
        return out;
    }

    resume() {
        if (this.timeLeft > 0) {
            this.running = true;
            this.timeStarted = new Date();
            this.timer = setTimeout(this.callback, this.timeLeft);
        }
    }

    clear() {
        clearTimeout(this.timer);
    }

}

var exports = module.exports = {};
exports.new = Timer;
exports.load = Timer.load;
