const request = require('supertest');
const DB = require('./db.js');
const Controller = require('./controller.js');
const Service = require('./service.js');
const { Engine } = require('./engine.js');
const createApp = require('./app.js');

describe('App', () => {
    let app, controller;

    beforeEach(() => {
        const db = DB.createFromData({
            test: [
                { id: '1', name: 'Item 1', description: 'Description 1' }, 
                { id: '2', name: 'Item 2', description: 'Description 2' }
            ]
        });
        const service = new Service(db);
        controller = new Controller(service);
        const engine = Engine.createFromScript(
            [
                {
                    "input": { "path": "/*/4" }, 
                    "output": { "status": 401, "response": "test ok" },
                    "stop" : true
                }
            ]
        );
        app = createApp(controller, engine);
    });

    test('GET / returns welcome message', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('JSONing API :)');
    });

    test('GET /:resource/:id returns the correct item', async () => {
        const response = await request(app).get('/test/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'Item 1', description: 'Description 1' });
    }); 

    test('GET /:resource/:id returns 404 for non-existent item', async () => {
        const response = await request(app).get('/test/3');
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('GET /:resource/:id returns 404 for non-existent resource', async () => {
        const response = await request(app).get('/unknown/1');
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('POST /:resource creates a new item', async () => {
        let response = await request(app).post('/test').send({ name: 'Item 3', description: 'Description 3' });
        expect(response.status).toBe(201);
        const newId = response.body.id;
        expect(response.body).toEqual({ id: newId, name: 'Item 3', description: 'Description 3' });

        response = await request(app).get('/test/' + newId);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: newId, name: 'Item 3', description: 'Description 3' });
    }); 

    test('POST /:resource creates a new item with id', async () => {
        let response = await request(app).post('/test').send({ id: '3', name: 'Item 3', description: 'Description 3' });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: '3', name: 'Item 3', description: 'Description 3' });

        response = await request(app).get('/test/3');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '3', name: 'Item 3', description: 'Description 3' });
    }); 

    test('POST /:resource attempts to create an item that already exists', async () => {
        let response = await request(app).post('/test').send({ id: '1', name: 'Item 1', description: 'Description 1' });
        expect(response.status).toBe(409);
        expect(response.text).toEqual('Already exists');
    }); 

    test('POST /:unknownresource creates a new item in unknown resource', async () => {
        let response = await request(app).post('/unknown').send({ id: '3', name: 'Item 3', description: 'Description 3' });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ id: '3', name: 'Item 3', description: 'Description 3' });

        response = await request(app).get('/unknown/3');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '3', name: 'Item 3', description: 'Description 3' });
    }); 

    test('PUT /:resource/:id updates an existing item', async () => {
        let response = await request(app).put('/test/1').send({ description: 'Description 1 updated' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', description: 'Description 1 updated' });

        response = await request(app).get('/test/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', description: 'Description 1 updated' });
    }); 

    test('PUT /:resource/:id returns 404 for non-existent item', async () => {
        let response = await request(app).put('/test/3').send({ description: 'Description 3 updated' });
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('PATCH /:resource/:id partially updates an existing item', async () => {
        let response = await request(app).patch('/test/1').send({ description: 'Description 1 updated' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'Item 1', description: 'Description 1 updated' });

        response = await request(app).get('/test/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'Item 1', description: 'Description 1 updated' });
    }); 

    test('PATCH /:resource/:id returns 404 for non-existent item', async () => {
        let response = await request(app).patch('/test/3').send({ description: 'Description 3 updated' });
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('DELETE /:resource/:id deletes an existing item', async () => {
        let response = await request(app).delete('/test/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'Item 1', description: 'Description 1' });

        response = await request(app).get('/test/1');
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('DELETE /:resource/:id returns 404 for non-existent item', async () => {
        let response = await request(app).delete('/test/3');
        expect(response.status).toBe(404);
        expect(response.text).toEqual('Not found');
    }); 

    test('Custom rules returns 401 status and "test ok" message', async () => {
        const response = await request(app).get('/toto/4');
        expect(response.status).toBe(401);
        expect(response.text).toBe('test ok');
    });
});
