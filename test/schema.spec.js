var hapi = require('hapi')
  , assert = require('assert')
  , tastypie = require('tastypie')
  , hoek = require('hoek')
  , Resource = tastypie.Resource
  , Api = tastypie.Api
  , JSONSchema = require('../lib/resource/schema/json')
  , v1
  , Endpoints
  , MoreEndpoints

MoreEndpoints = Resource.extend({
	mixin:[JSONSchema],
	fields:{
		test:{ type: 'int', default: 1, help:"this is a test"},
	}
})
Endpoints = Resource.extend({
	mixin:[JSONSchema],
	fields:{
		name:{ type: 'char', default: "fake", help:"this is your name"},
        more: {type:'related', to:MoreEndpoints, help:"More endpoints to check"}
	}
});

describe('JSONSchema', function( ){
	var server
	before(function( done ){
		server = new hapi.Server({minimal:true})
		server.connection({ host:'localhost' })
		v1 = new Api('api/v1') 
		v1.use('more',new MoreEndpoints({}) );
		v1.use('json',new Endpoints({}) );
		server.register([v1], function( ){
			server.start( done )
		})
	}) 

	after( function( done  ){
		server.stop( done )
	});

	it('should include related definitions', function( done ){
		server.inject({
			url:'/api/v1/json/schema',
			method:'get',
			headers:{
				Accept:'application/json',
				'Content-Type':'application/json'
			}
		}, function( response ){
			var data = JSON.parse( response.result )
			assert.ok( !!data.definitions )
			assert.ok( !!data.definitions.more )

			done();
		})
	})

	it('should have a properties defintion of field schemas', function( done ){
		server.inject({
			url:'/api/v1/json/schema',
			method:'get',
			headers:{
				Accept:'application/json',
				'Content-Type':'application/json'
			}
		}, function( response ){
			var data = JSON.parse( response.result )
			assert.ok( !!data.properties )
			assert.ok( !!data.properties.name )
			assert.ok( !!data.properties.more )
			done();
		})
	})

	it('should inject a $ref for related schemas', function( done ){
		server.inject({
			url:'/api/v1/json/schema',
			method:'get',
			headers:{
				Accept:'application/json',
				'Content-Type':'application/json'
			}
		}, function( response ){
			var data = JSON.parse( response.result )
			assert.ok( data.properties.more.hasOwnProperty( '$ref') )
			done();
		})
	})

	it('should inject a ref resolvable to a schema definition', function( done ){
		server.inject({
			url:'/api/v1/json/schema',
			method:'get',
			headers:{
				Accept:'application/json',
				'Content-Type':'application/json'
			}
		}, function( response ){
			var data = JSON.parse( response.result )
			var rel = data.properties.more['$ref'];

			rel = rel.replace(/\#\//, '').replace('/','.')
			var schema = hoek.reach(data, rel)
			assert.ok(schema.properties.test)
			assert.equal(schema.properties.test.default, 1)
			assert.equal(schema.properties.test.help, "this is a test")
			done();
		})
	})
})