const http = require( 'http' );
const fs = require( 'fs' );
const Stream = require( 'stream' ).Transform;
const path = require( 'path' );

const tmpdir = require( 'os' ).tmpdir;
const mkdtemp = require( 'fs' ).mkdtemp;
const sep = require( 'path' ).sep;

const hostDefault = 'localhost:4502';
//const hostDefault = '192.168.100.3:4502';
let host = null;

if( process.env.AIM_HOST ) {
  host = process.env.AIM_HOST;
} else {
  host = hostDefault;
}

const request = function ( url ) {
  return new Promise( ( resolve, reject ) => {
    http.request(
      url,
      {
        'auth': 'admin:admin'
      },
      ( response ) => {
        const output = [];
        response.setEncoding( 'utf8' );
        response
          .on( 'data', ( chunk ) => {
            output.push( chunk );
          } )
          .on( 'end', () => {
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

        //console.log(directory);
        workdir = directory;
        template = path.join( directory, 'template.idml' );
        resolve();
      });
    } );
  } )
  .then( () => {
    const pathJCR = '/content/dam/we-retail/en/experiences/template/template.idml';
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
  } )
  .then( ( jsons ) => {
    const cfs = jsons.reduce( ( prev, json ) => {
      return prev.concat( json.entities );
    }, [] )
      .filter( ( entity ) => {
        if( ! entity ) {
          return false;
        }

        if( ! entity.properties.elements ) {
          return false;
        }

        if( ! entity.properties.elements.Image ) {
          return false;
        }

        if( ! entity.properties.elements.Image.value ) {
          return false;
        }
        return true;
      } );
    const tasks = cfs
      .map( ( cf ) => {
        return download(
          String().concat(
            'http://',
            host,
            cf.properties.elements.Image.value
          ),
          String().concat(
            workdir,
            '/',
            path.basename( cf.properties.elements.Image.value )
          )
        );
      } );
    return Promise.all( tasks )
      .then( ( vals ) => {
        return new Promise( ( resolve, reject ) => {
          const icfs = cfs
            .map( ( cf, index ) => {
              cf.properties.imageLocalPath = vals[ index ];
              return cf;
            } );
          resolve( icfs );
        } );
      } );
  } )
  .then( ( cfs ) => {
    return new Promise( ( resolve, reject ) => {
      const templateXML = fs.readFileSync( 'template.xml', 'utf-8' );
      const xmlitems = cfs
        .map( ( cf ) => {

          return String().concat(
            '<item>',
            '<Image href="file://',
            cf.properties.imageLocalPath,
            '"/>',
            '<CFBODY>',
            cf.properties.elements.main.value.replace( /</g, '{{TAGBEGIN}}' ).replace( />/g, '{{TAGEND}}' ).replace( /&nbsp;/g, '{{nbsp}}' ),
            '</CFBODY>',
            '</item>\n'
          );
        } );
      const xml = templateXML.replace( /{{ITEMS}}/, xmlitems );
      fs.writeFileSync( path.join( workdir, 'data.xml' ), xml );
      resolve();
    } )
    .then( () => {
      return new Promise( ( resolve, reject ) => {

        const soapRequest = require('easy-soap-request');

        // example data
        const url = 'http://192.168.100.3:8080';
        const sampleHeaders = {
          'user-agent': 'sampleTest',
          'Content-Type': 'text/xml;charset=UTF-8',
          'soapAction': 'https://graphical.weather.gov/xml/DWMLgen/wsdl/ndfdXML.wsdl#LatLonListZipCode',
        };
        const xml = fs.readFileSync('samplesoap.xml', 'utf-8')
          .replace( /{{WORKDIR}}/, workdir )
          .replace( /{{EXTENDSCRIPT}}/, path.join( path.resolve( __dirname ), 'HelloWorld.jsx' ) );

        // usage of module
        (async () => {
          const { response } = await soapRequest({ url: url, headers: sampleHeaders, xml: xml, timeout: 60000 }); // Optional timeout parameter(milliseconds)
          const { headers, body, statusCode } = response;
          console.log(headers);
          console.log(body);
          console.log(statusCode);
          while( true ) {
            if( fs.existsSync( path.join( workdir, '/confirmed-save' ) ) ) {
              resolve();
              break;
            }
          }
        })();
      } );
    } )
    .then( () => {
      return new Promise( ( resolve, reject ) => {
        const { exec } = require("child_process");

        const command = String().concat(
          'curl -u "admin:admin" -X POST -F file=@"',
          path.join( workdir, 'artifact.indd' ),
          '" ',
          'http://localhost:4502/content/dam/we-retail/en/experiences/destination.createasset.html'
        );

        //https://helpx.adobe.com/experience-manager/kb/common-AEM-Curl-commands.html
        exec( command , (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                resolve();
                return;
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
      } );
    } )
    .then( () => {
      console.log( workdir );
    } );
  } );
