# repltarget

The `repltarget` masquerades as a CouchDB server. It supports just enough API calls so that a remote CouchDB/Cloudant server is fooled into "replicating" with it, server to `repltarget`. You can use 
`repltarget` in your own code an respond to the events as they arrive:

- store the changed data in some other system
- call a third-party API call or web hook
- perform analytics on the data

## Installing

Install globally with

    npm install -g repltarget

or into your own Node.js project with

    npm install --save repltarget

## Running on the command-line

You can start up a `repltarget` daemon buy running

    > repltarget
    
This will startup a repltarget server on port 3000, listening for replication events.

You can then trigger a CouchDB replication to "http://localhost:3000/yourdb" and watch the documents arrive.

## Running in your own application

Load the `repltarget` module into your own code:

```js
const repltarget = require('repltarget');
```

and then run it with configuration object defining the `port`, `username` and `password` it is to use:

```js
var r = repltarget({port: 3000, username: 'username', password: 'password'});
```

You code can then listen to events emitted from the returned object:

- `startup` - when the webserver is ready to receive events
- `doc` - when each doc arrives individually
- `batch` - when each change arrives in batches (an array of docs)

e.g.

```js
r.on('doc', function(d) {
  console.log(d);
});
// { _id: "mydoc", _rev: "1-1234", a: 45 }

// or 
r.on('batch', function(a) {
  console.log(a);
});
// [ { _id: "mydoc", _rev: "1-1234", a: 45 }, { _id: "mydoc2", _rev: "1-5678", a: 11 } ]
```

## How does it work?

The project responds to the following API calls:

- `GET /db` - always returns 200 with a JSON object to let CouchDB know the database exists
- `GET /db/_local/id` - always returns 404 to show that the requested checkpoint document is missing
- `PUT /db/_local/id` - returns success, even though we discard the incoming document
- `POST /db/_revs_diff` - always return some JSON that indicates we need all the incoming documents
- `POST /db/_bulk_docs` - accepts bulkd document writes and emits events
- `PUT /db/id` - accepts single document writes and emits events
- `POST /db/_ensure_full_commit` - simulates success

By default, the checkpoint documents are always discarded on save and are found to be absent on fetch. 
You may choose a couple of other options:

- 'file' plugin - store checkpoint documents to disk
- 'ram' plugin - store checkpoint documents in memory
- 'devnull' plugin - the default behaviour

Provide a `plugin` key on startup e.g.

    var r = repltarget({port: 3000, username: 'username', password: 'password', plugin: 'file'});

## Debugging

For extra information during execution, set the `DEBUG` environment variable to `repltarget` e.g.

```
DEBUG=repltarget node yourapp.js
```
