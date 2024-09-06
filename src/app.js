const express = require('express');
const cors = require('cors');
const Response = require ('./response.js');

function createApp(controller, engine) {
    const app = express();

    app.use(cors()).options('*', cors())
    
    app.use((req, res, next) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            req.rawBody = data;
            if ( ['POST', 'PUT', 'PATCH'].includes(req.method) ) {
                try {
                    req.body = JSON.parse(data);
                } catch(error) {
                    return res.status(400).send({ error: 'Invalid JSON' });
                }    
            }
            next();
        });
    });
    
    app.use(express.urlencoded({ extended: true }));
    
    app.use((req, res, next) => {
        res.response = new Response();
        next();
    });
    
    app.use((req, res, next) => {
        const rule = engine.match(req, res);
        if (rule) {
            rule.apply(res.response);
        }
        if (res.response.shouldExit()) {
            res.status(res.response.getStatus()).send(res.response.getResponse());
            return;
        }
        next();
    });
    
    app.get('/', (req, res) => {
        res.send('JSONing API :)');
    });

    app.get('/:resource/:id?', controller.get.bind(controller));

    app.post('/:resource', controller.create.bind(controller));

    app.put('/:resource/:id', controller.update.bind(controller));

    app.patch('/:resource/:id', controller.patch.bind(controller));

    app.delete('/:resource/:id', controller.delete.bind(controller));

    app.use((req, res) => {
        res.response.getHeaders().forEach((header) => res.set(header.name, header.value));
        res.status(res.response.getStatus()).send(res.response.getResponse());
    });

    app.use((err, req, res, next) => {
        if (err.code === 'ERR_HTTP_INVALID_STATUS_CODE') {
            res.status(500).send('Internal Server Error: Invalid status code');
        } else {
            res.status(500).send('Something broke!');
        }
    });
      
    return app;
}

module.exports = createApp;