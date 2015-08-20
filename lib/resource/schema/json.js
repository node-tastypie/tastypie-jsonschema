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
 * @alias module:tastypie/lib/resource/schema
 */
Schema = new Class({
	_schema_cache:null
	,build_schema: function( fields, options ){
		var schema;
		options = options || this.options || EMPTY_OBJECT;
		fields = fields || this.fields || EMPTY_OBJECT;
		if( this._schema_cache ){
			return this._schema_cache;
		}

		schema = {
			title:options.title
			,description:options.description
			,required:[]
			,formats: Object.keys( options.serializer.options.content_types )
			,filtering: options.filtering || {}
			,ordering: options.ordering || []
			,limit: options.limit
		    ,definitions:{}
		    ,properties:{}
		};

		for( var key in this.fields ){
			if( !this.fields.hasOwnProperty( key ) ){
				continue;	
			}
			var field = this.fields[ key ];
			if( field.is_related ){
				
			}else {
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

		this._schema_cache = schema;
		return schema;
	}
	,get_schema: function( req, res ){
		this.respond( this.bundle( req, res, this.build_schema( ) ) );
	}
});

module.exports = Schema;
