const fs = require('fs');
const { Rules } = require ('./rule.js');

class Engine {
    #rules     = null;
    static createFromFile(rulesPath) {
        let engine = new Engine();
        //try {
            engine.#rules = Rules.create( JSON.parse(fs.readFileSync(rulesPath, 'utf8')) );
        // } catch (error) {
        // }
        return engine;
    }
    static createFromScript(rules) {
        let engine = new Engine();
        //try {
            engine.#rules = Rules.create( rules );
        // } catch (error) {
        // }
        return engine;
    }
    constructor() {
    }
    match(req, res) {
        //try {
            if (this.#rules) {
                return this.#rules.match(req, res);
            }
        // } catch (error) {
        // }
        return null;
    }
};

module.exports = { Engine };