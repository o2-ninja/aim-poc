const http = require( 'http' );

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

Promise.resolve()
  .then( () => {
    return new Promise( ( resolve, reject ) => {
      http.request(
        String().concat(
          'http://',
          host,
          '/api/assets/we-retail/en/experiences.json'
        ),
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
    } )
      .then( ( json ) => {
        const tasks = json.entities
          .filter( ( entity ) => {
            return entity.rel[ 0 ] === 'child';
          } )
          .map( ( child ) => {
            return child.links[ 0 ].href;
          } );
        console.log( tasks );
        //return new Promise( ( resolve, reject ) => {
        //  console.log( JSON.stringify( json, null, '  ' ) );
        //} );
      } );
  } );
