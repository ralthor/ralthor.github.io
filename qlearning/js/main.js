Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

Array.prototype.last = function () {
    return this[this.length - 1];
}

class Environment {
    constructor() {
        this.width = 10;
        this.height = 10;
        this.finals = [];
        this.finals.push([this.width, this.height, 1]);
        this.finals.push([Math.floor(this.width/2), Math.floor(this.height/2), -1]);
    }

    start() {
        return [0, 0];
    }

    isFinal(state) {
        let idx = this.finals.findIndex(cell => cell[0] == state[0] && cell[1] == state[1]);
        if(idx == -1)
            return 0;
        return this.finals[idx][2];
        // if (state[0] == this.width && state[1] == this.height)
        //     return 1;
        // if (state[0] == Math.floor(this.width/2) && state[1] == Math.floor(this.height/2))
        //     return -1;
        // return false;
    }

    validState(state) {
        if (0 <= state[0] && state[0] <= this.width && 0 <= state[1] && state[1] <= this.height)
            return true;
        return false;
    }

    actions(state) {
        let actions = [[1, 0], [0, -1], [-1, 0], [0, 1]];
        let result = actions.map(a => [state[0] + a[0], state[1] + a[1]]).filter(s => this.validState(s)).map(s => [s[0] - state[0], s[1] - state[1]]);
        return result;
    }

    applyAction(state, action) {
        return state.map((x, i) => x + action[i]);
    }

    changeCell(i, j, value) {
        let idx = this.finals.findIndex(cell => cell[0] == i && cell[1] == j);
        if (idx == -1)
            this.finals.push([i, j, value]);
        else
            this.finals[idx][2] = this.finals[idx][2] == value? 0: value;
    }
}

class QLearning {
    constructor(env) {
        this.env = env;
        this.epsilon = 0.05;
        this.alpha = 0.5;
        this.discount = 0.8;
        this.qvalues = {};
        this.qvalueCount = {};
        this.episodes = 1000; // this.episodes < 0 means infinite, this.episodes == 0 means finished/stopped
        this.maxEpisodeLength = 100;
    }

    selectBest(state, actions) {
        let bestActions = [];
        let bestValue = -2;
        for (let i = 0; i < actions.length; i++) {
            let nextState = this.env.applyAction(state, actions[i]);
            let value = this.env.isFinal(nextState) ? this.env.isFinal(nextState) : [state, actions[i]] in this.qvalues ? this.qvalues[[state, actions[i]]] : 0;
            if (value > bestValue) {
                bestActions = [actions[i]];
                bestValue = value;
            }
            else if (value == bestValue)
                bestActions.push(actions[i]);
        }
        return bestActions.randomElement();
    }

    bestScore(state) {
        let value = this.env.isFinal(state);
        if (value != 0)
            return value;
        let actions = this.env.actions(state);
        let scores = actions.filter(a => [state, a] in this.qvalues).map(a => this.qvalues[[state, a]])
        if (scores.length == 0)
            return 0;
        value = scores.reduce((t,x)=>Math.max(t,x), -Infinity)
        return value;
    }

    episode() {
        if (this.episodes == 0)
            return false;
        if (this.episodes > 0)
            this.episodes--;

        let pairs = [];

        let s = this.env.start();
        let a = null;
        for (let i = 0; i < this.maxEpisodeLength && !this.env.isFinal(s); i++) {
            let actions = this.env.actions(s);
            if (this.epsilon > Math.random())
                a = actions.randomElement();
            else
                a = this.selectBest(s, actions);

            let candidateState = this.env.applyAction(s, a)
            if (pairs.map(p => p[0]).findIndex(state => state[0] == candidateState[0] && state[1] == candidateState[1]) != -1)
                continue; // if the state is repeated, it is not selected.

            pairs.push([s, a]);
            s = candidateState;
        }
        let score = null;
        let reward = 1;
        if (this.env.isFinal(s)) {
            score = this.env.isFinal(s);
            if (score > 0)
                reward = 1.1;
        }
        else {
            score = this.bestScore(s);
        }
        if (score != null) {
            for (let i = pairs.length - 1; i >= 0; i--) {
                let prevScore = pairs[i] in this.qvalues ? this.qvalues[pairs[i]] : 0;
                let prevCount = pairs[i] in this.qvalueCount ? this.qvalueCount[pairs[i]] : 0;
                this.qvalues[pairs[i]] = ((1 - this.alpha) * prevScore + this.alpha * (reward * this.discount * score));
                this.qvalueCount[pairs[i]] = prevCount + 1;
                score = this.qvalues[pairs[i]];
            }
        }
    }

    learn() {
        while (this.episodes != 0)
            this.episode();
    }

    bests() {
        let w = this.env.width + 1;
        let h = this.env.height + 1;
        let result = Array(w).fill(null).map(() => new Array(h).fill(0));
        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++)
                result[i][j] = this.bestScore([i, j]);

        return result;
    }
}

function drawTable(q, id) {
    let result = q.bests();
    result = result.map(a => a.map(c => Math.floor(c * 100)/100));
    var tbl = document.createElement("table");
    for(let j = 0; j < result.length; j++) {
        let tr = tbl.insertRow();
        for(let i = 0; i <result[0].length; i++) {
            let td = tr.insertCell();
            td.appendChild(document.createTextNode(result[i][j]));
            if (result[i][j] < -0.5)
                td.style.color = "white"
            td.style.backgroundColor = heatmapColor(result[i][j])
            td.data = [i,j];
            td.onclick = function() {
                q.env.changeCell(this.data[0], this.data[1], -1);
                drawTable(q, id);
            };
            td.ondblclick = function() {
                q.env.changeCell(this.data[0], this.data[1], 1);
                drawTable(q, id);
            };
        }
    }
    let div = document.getElementById(id);
    div.innerHTML = "";
    div.appendChild(tbl);

    document.getElementById('showAlpha').innerHTML = q.alpha = document.getElementById('alpha').value/1000
    document.getElementById('showEpsilon').innerHTML = q.epsilon = document.getElementById('epsilon').value/1000
    document.getElementById('showDiscount').innerHTML = q.discount = document.getElementById('discount').value/1000
}

function heatmapColor(value) {
    if (value > 0) { // blue for 1.0, and white for 0.0
        var rg = Math.round(-255 * value + 255).toString(16);
        rg = rg.length > 1 ? rg : "0" + rg;
        return "#" + rg + "ff" + rg;
    }
    else {
        var gb = Math.round(255 * value + 255).toString(16);
        gb = gb.length > 1 ? gb : "0" + gb;
        return "#ff" + gb + gb;
    }
}

function iterateLearning() {
    q.episodes = 50;
    q.learn();
    drawTable(q, "show")
}

var timerId = null;

function start() {
    if (timerId != null)
        return;
    timerId = setInterval(iterateLearning, 10);
}

function stop() {
    clearInterval(timerId);
    timerId = null;
}

function step() {
    q.episodes = 1;
    q.learn();
    drawTable(q, "show")
}

function reset() {
    q = new QLearning(e);
    drawTable(q, "show");
}

function resetEnv() {
    e = new Environment();
    reset();
}

var e = new Environment();
var q = new QLearning(e);