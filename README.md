# JSONing API

JSONing API is a versatile tool that allows you to mock REST APIs. It allows to easily simulate and test API behaviors, providing a dynamic environment to craft custom responses and logic.

## Install

```shell
$ npm install jsoning-api

# Or clone the repository
$ git clone https://github.com/cyrilbois/jsoning-api.git
$ cd jsoning-api
$ npm install
```

## Configuration

Create a `db.json` file

```json
{
  "products": [
    {
      "id": 1, "name": "T-shirt", "price": 19.99
    },
    {
      "id": 2, "name": "Jeans", "price": 49.99
    }
  ],
  "users": [
    {
      "id": 1, "username": "johndoe", "email": "johndoe@example.com"
    },
    {
      "id": 2, "username": "janedoe", "email": "janedoe@example.com"
    }
  ]
}
```
In this example, you have created 2 resources: "products" and "users" (2 objects for each resource).

Create a `rules.json` file (you can provide an empty array)

```json
[
  {
    "input": { "method": "GET", "path": "/status/401" }, 
    "output": { "status": 401, "response": {"error": "demo error"} },
    "stop" : true
  }
]
```

With this rule, calling the resource `/status/401` will return a 401 error. 

## Usage

Start the REST API service

```shell
$ npm start
```

Get a REST API

```shell
$ curl http://localhost:3000/products/1
{
    "id": 1,
    "name": "T-shirt",
    "price": 19.99
}
```

## Routes

The REST API handles different HTTP methods for creating, retrieving, updating, and deleting resources


```
GET     /products     Returns all products
GET     /products/2   Returns the product with ID 2
POST    /products     Create a new product
GET     /products/2   Returns the product with ID 2
PUT     /products/2   Update the product with ID 2
PATCH   /products/2   Update partially the product with ID 2
DELETE  /products/2   Delete the product with ID 2
```

### Pagination

- page
- limit 

```
GET     /products?limit=5         Returns the first 5 products (Page defaults to 1)
GET     /products?page=2          Returns 10 products from the second page (default limit is 10)
GET     /products?page=2&limit=5  Returns 5 products from the second page (Page starts at 1)
```

## Custom rules

Custom rules are defined using JSON. With these JSON-based rules, you can set conditions based on the request (such as HTTP method, headers, and payload) and specify the response (including HTTP status code and payload). This allows you to tailor the API's behavior to meet specific testing and development needs.

Rules are applied before the API execution (which reads, writes, or deletes data).

If multiple rules match the request, only one is executed (the first one found).

The HTTP status and payload defined by the rules take precedence over those set by the API.

Here is an example of a rule:
```json
  {
    "input": { "method": "GET", "path": "/status/401" }, 
    "output": { "status": 401, "response": {"error": "demo error"} },
    "stop" : true
  }
```

The `stop` attribute indicates whether to halt after applying the rule or to continue with the API execution.

### Input

The `input` object is used to represent the different criteria that can be tested in the request.


```md
| Attribute | Description                                                 |
|-----------|-------------------------------------------------------------|
| headers   | The headers (Object: each header is an attribute)           |
| method    | The HTTP method ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')   |
| path      | The pathname of the URL (e.g., /users/23).                  |
| payload   | The payload (object or string)                              |
```

###  Output

The `output` object is used to update the response if the rule match.

```md
| Attribute | Description                                 |
|-----------|---------------------------------------------|
| status    | Sets the HTTP status (e.g., 200, 404, etc.) |
| response  | Sets the response payload                   |
| headers   | Sets the headers                            |
```

## Tests

Launch tests

```shell
$ npm test
```

## License

MIT License