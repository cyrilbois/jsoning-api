const { Rule, Rules } = require('./rule');

describe('Rules and Rule classes', () => {
    describe('Rule class', () => {
        it('should create a rule with given parameters', () => {
            const ruleData = {
                input: {
                    method: 'GET',
                    path: '/test',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    payload: '{"key":"value"}',
                },
                output: {
                    status: 200,
                    headers: {
                        'X-Test-Header': 'test-value'
                    },
                    response: '{"success":true}',
                },
                stop: false
            };

            const rule = Rule.create(ruleData);

            expect(rule.match({
                method: 'GET',
                originalUrl: '/test',
                get: (header) => {
                    return ruleData.input.headers[header];
                },
                rawBody: '{"key":"value"}'
            }, {})).toBe(true);
        });

        it('should return false if method does not match', () => {
            const ruleData = {
                input: {
                    method: 'POST',
                    path: '/test',
                },
            };

            const rule = Rule.create(ruleData);

            expect(rule.match({
                method: 'GET',
                originalUrl: '/test',
            }, {})).toBe(false);
        });

        it('should apply rule output to response', () => {
            const ruleData = {
                output: {
                    status: 201,
                    headers: {
                        'X-Test-Header': 'test-value'
                    },
                    response: '{"success":true}',
                },
                stop: true,
            };

            const rule = Rule.create(ruleData);

            const mockResponse = {
                status: jest.fn(),
                lockStatus: jest.fn(),
                send: jest.fn(),
                lockResponse: jest.fn(),
                addHeader: jest.fn(),
                exit: jest.fn(),
            };

            rule.apply(mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith('{"success":true}');
            expect(mockResponse.addHeader).toHaveBeenCalledWith('X-Test-Header', 'test-value');
            expect(mockResponse.exit).toHaveBeenCalled();
        });
    });

    describe('Rules class', () => {
        it('should create an instance with multiple rules', () => {
            const rulesData = [
                {
                    input: {
                        method: 'GET',
                        path: '/test',
                    },
                    output: {
                        status: 200,
                    }
                },
                {
                    input: {
                        method: 'POST',
                        path: '/submit',
                    },
                    output: {
                        status: 201,
                    }
                }
            ];

            const rules = Rules.create(rulesData);

            expect(rules.match({
                method: 'GET',
                originalUrl: '/test',
            }, {})).toBeDefined();

            expect(rules.match({
                method: 'POST',
                originalUrl: '/submit',
            }, {})).toBeDefined();

            expect(rules.match({
                method: 'DELETE',
                originalUrl: '/remove',
            }, {})).toBeUndefined();
        });
    });
});