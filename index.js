const http = require( 'http' );

//const hostDefault = 'localhost:4502';
const hostDefault = '192.168.100.3:4502';
let host = null;

if( process.env.AIM_HOST ) {
  host = process.env.AIM_HOST;
} else {
  host = hostDefault;
}

console.log( host );

//http://$host/api/assets/we-retail/en/experiences.json
//

Promise.resolve().then( ( resolve, reject ) => {

  const request = http.request(
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
          console.log( JSON.parse( output.join( '' ) ) );
        } );
    } )
    .end();

} );
