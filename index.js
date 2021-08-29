const http = require( 'http' );
const fs = require( 'fs' );
const Stream = require( 'stream' ).Transform;
const path = require( 'path' );

const tmpdir = require( 'os' ).tmpdir;
const mkdtemp = require( 'fs' ).mkdtemp;
const sep = require( 'path' ).sep;

//const hostDefault = 'localhost:4502';
const hostDefault = '192.168.100.3:4502';
let host = null;

if( process.env.AIM_HOST ) {
  host = process.env.AIM_HOST;
} else {
  host = hostDefault;
}

//console.log( host );

//http://$host/api/assets/we-retail/en/experiences.json
//
//

const request = function ( url ) {
  return new Promise( ( resolve, reject ) => {
    http.request(
      url,
      {
        'auth': 'admin:admin'
      },
      ( response ) => {
        //console.log('STATUS: ' + response.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(response.headers));
        const output = [];
        response.setEncoding( 'utf8' );
        response
          .on( 'data', ( chunk ) => {
            //console.log( chunk );
            output.push( chunk );
          } )
          .on( 'end', () => {
            //console.log( JSON.parse( output.join( '' ) ) );
            resolve( JSON.parse( output.join( '' ) ) );
          } );
      } )
      .on( 'error', ( e ) => { reject( e ); } )
      .end();
  } );
};

//https://stackoverflow.com/a/30939791
const download = function( url, saveTo ) {
  return new Promise( ( resolve, reject ) => {
    http.request( url, { 'auth' : 'admin:admin' }, function( response ) {
      const data = new Stream();

      response.on( 'data', function( chunk ) {
        data.push( chunk );
      } );

      response.on( 'end', function() {
        fs.writeFileSync( saveTo, data.read() );
        resolve( saveTo );
      } );
    } ).end();
  } );

};

let workdir = null;
let template = null;

Promise.resolve()
  .then( () => {
    return new Promise( ( resolve, reject ) => {
      mkdtemp(`${tmpdir}${sep}`, (err, directory) => {
        if (err) reject( err );
        console.log(directory);
        workdir = directory;
        template = path.join( directory, 'template.indd' );
        resolve();
        // Will print something similar to `/tmp/abc123`.
        // A new temporary directory is created within
        // the /tmp directory.
      });
    } );
  } )
  .then( () => {
    const pathJCR = '/content/dam/dynamic-deck-dynamo/templates/simple-template-2020/simple-template-2020.indd';
    return download(
      String().concat(
        'http://',
        host,
        pathJCR
      ),
      template
    );
  } )
  .then( () => {
    return request(
      String().concat(
        'http://',
        host,
        '/api/assets/we-retail/en/experiences.json'
      ),
    );
  } )
  .then( ( json ) => {
    const tasks = json.entities
      .filter( ( entity ) => {
        return entity.rel[ 0 ] === 'child';
      } )
      .map( ( child ) => {
        return request( child.links[ 0 ].href );
      } );
    return Promise.all( tasks );
    //return new Promise( ( resolve, reject ) => {
    //  console.log( JSON.stringify( json, null, '  ' ) );
    //} );
  } )
  .then( ( jsons ) => {
    const cfs = jsons.reduce( ( prev, json ) => {
      return prev.concat( json.entities );
    }, [] )
      .filter( ( entity ) => {
        if( ! entity.properties.elements ) {
          return false;
        }

        if( ! entity.properties.elements.ProductImage ) {
          return false;
        }

        if( ! entity.properties.elements.ProductImage.value ) {
          return false;
        }
        return true;
      } );
    //console.log( JSON.stringify( jsons, null, '  ' ) );
    //console.log( cfs.forEach( ( elm ) => { console.log( elm.properties.elements.ProductImage.value ); } ) );
    const tasks = cfs
      .map( ( cf ) => {
        return download(
          String().concat(
            'http://',
            host,
            cf.properties.elements.ProductImage.value
          ),
          String().concat(
            workdir,
            '/',
            path.basename( cf.properties.elements.ProductImage.value )
          )
        );
      } );
    return Promise.all( tasks )
      .then( ( vals ) => {
        //console.log( vals );
        return new Promise( ( resolve, reject ) => {
          const icfs = cfs
            .map( ( cf, index ) => {
              cf.properties.imageLocalPath = vals[ index ];
              return cf;
            } );
          //console.log( icfs );
          resolve( icfs );
        } );
      } );
    //download( imageurl, '/tmp/image2.png' );
    //console.log( cfs.map( ( cf ) => {
    //  return ( cf.properties.elements ? cf.properties.elements.ProductImage.value : null );
    //} ) );
  } )
  .then( ( cf ) => {
    console.log( cf );
  } );
