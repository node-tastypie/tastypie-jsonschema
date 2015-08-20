# Tastypie JSONSchema

A Resource mixing that allows resources to generate json schema compliant schemas from the `/schema` endpoint.

```js
var tastypie = require('tastypie');
var JSONSchema = require('tastypie-jsonschema');
var Resource = tastypie.Resource;
var Hapi = require("hapi')
var Api = tastypi.Api;
var api, server;

var SchemaResource = Resource.extend({
	mixin:[ JSONSchema ]
  , fields:{
     test:{ type:'char', nullable: true }
  }
});

v1 = new Api('api/v1');
v1.use('json', new SchemaResource());

server = new Hapi.Server();
server.connection({host:'localhost', labels:['api']});
server.register([v1], function(){
	server.start( console.log );
});
```
