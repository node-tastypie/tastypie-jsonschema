/*jshint laxcomma: true, smarttabs: true, node:true */
'use strict';
/**
 * Mixin class providing json schema formating functionlity for resource schemas
 * @module tastypie-jsonschema/lib/resource/schema/json
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires debug
 * @requires mout/object
 * @requires class
 * @requires class/options
 **/
var Class        = require('tastypie/lib/class')
  , EMPTY_OBJECT = {}
  , Schema
  ;

/**
 * @constructor
 * @mixin
 * @alias module:tastypie-jsonschema/lib/resource/schema/json
 */
Schema = new Class({
	_schema_cache:null
	,build_schema: function( fields, options ){
		var schema, fields, field;
		options = options || this.options || EMPTY_OBJECT;
		fields = fields || this.fields || EMPTY_OBJECT;
		if( this._schema_cache ){
			return this._schema_cache;
		}

		schema = {
		     definitions:{}
			,description:options.description
			,filtering: options.filtering || {}
			,formats: Object.keys( options.serializer.options.content_types )
			,required:[]
			,title:options.title
			,limit: options.limit
			,ordering: options.ordering || []
		    ,properties:{}
			,schema:"http://json-schema.org/schema"
		    ,allowed:{}
			,type:'object'
		};

		for( var key in fields ){
			if( !fields.hasOwnProperty( key ) ){
				continue;	
			}
			field = fields[ key ];
			if( field.is_related ){
			    schema.definitions[ key ] = this.build_schema(
					field.instance.fields,
					field.instance.options
				);	
				schema.properties[key] = {'$ref': "#/definitions/" + key}
			} else {
				schema.properties[ key ] = {
						'default'  : field.default
					  , 'type'     : field.type()
					  , 'nullable' : field.options.nullable
					  , 'blank'    : !!field.options.blank
					  , 'readonly' : !!field.options.readonly
					  , 'help'     : field.options.help
					  , 'unique'   : !!field.options.unique
				} 
			}

			if( !field.options.nullable && !field.options.blank && !field.options.readonly ){
				schema.required.push( key );
			}
		}

		this.routes && this.actions.forEach( function( action ){
			schema[ 'allowed' ][ action ] = Object.keys( 
									options[ 'allowed' ][ action ] || EMPTY_OBJECT 
								)
								.filter( function( method ){
									return !!options['allowed'][action][method];
								});
		})

		this._schema_cache = schema;
		field = fields = schema = null;
		return this._schema_cache;
	}
	,get_schema: function( req, res ){
		this.respond( this.bundle( req, res, this.build_schema( ) ) );
	}
});

module.exports = Schema;
