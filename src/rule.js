
class Rules {
    #rules = []
    static create(rules) {
        const instance = new Rules();
        rules.forEach((rule) => {
            instance.#rules.push(Rule.create(rule));
        });
        return instance;
    }
    match(req, res) {
        return this.#rules.find((rule) => {
            return rule.match(req, res);
        });
    }
}

class Rule {
    #headers = null;
    #method = null;
    #path = null;
    #payload = null;
    #status = null;
    #outputHeaders = null;
    #response = null;
    #stop = true;
    static create(rule) {
        const instance = new Rule();
        if (rule.input && rule.input.hasOwnProperty('headers')) {
            instance.#headers = rule.input.headers;
        }
        if (rule.input && rule.input.hasOwnProperty('method')) {
            instance.#method = rule.input.method;
        }
        if (rule.input && rule.input.hasOwnProperty('path')) {
            instance.#path = rule.input.path;
        }
        if (rule.input && rule.input.hasOwnProperty('payload')) {
            instance.#payload = typeof rule.input.payload === 'string' ? rule.input.payload : JSON.stringify(rule.input.payload);
        }
        if (rule.output && rule.output.hasOwnProperty('status')) {
            instance.#status = rule.output.status;
        }
        if (rule.output && rule.output.hasOwnProperty('headers')) {
            instance.#outputHeaders = rule.output.headers;
        }
        if (rule.output && rule.output.hasOwnProperty('response')) {
            instance.#response = rule.output.response;
        }
        if (rule.hasOwnProperty('stop')) {
            instance.#stop = rule.stop;
        }
        return instance;
    }
    match(req, res) {
        if (this.#method) {
            if (this.#method != req.method) {
                return false;
            }
        }
        if (this.#path) {
            if (!this.#path.includes('*')) {
                if (this.#path != req.originalUrl) {
                    return false;
                }
            } else {
                const [prefix, suffix] = this.#path.split('*');
                if ( ! (req.originalUrl.startsWith(prefix) && req.originalUrl.endsWith(suffix) ) ) {
                    return false;
                }
            }
        }
        if (this.#headers) {
            for (let key in this.#headers) {
                if (this.#headers.hasOwnProperty(key)) {
                    if (this.#headers[key] != req.get(key)) {
                        return false;
                    }
                }
            }
        }
        if (this.#payload) {
            if (this.#payload != req.rawBody) {
                return false;
            }
        }
        return true;
    }
    apply(response) {
        if (this.#status) {
            response.status(this.#status);
            response.lockStatus();
        }
        if (this.#response) {
            response.send(this.#response);
            response.lockResponse();
        }
        if (this.#outputHeaders) {
            for (let key in this.#outputHeaders) {
                if (this.#outputHeaders.hasOwnProperty(key)) {
                    response.addHeader(key, this.#outputHeaders[key]);
                }
            }
        }
        if (this.#stop) {
            response.exit();
        }
    }
};

module.exports = { Rules, Rule };