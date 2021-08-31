const fs = require( 'fs' );
const http = require( 'http' );
/**
var formData = require('form-data')();

var binaryFilename = '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/camp-fire.jpg';

let request = http.request({
    host: 'localhost',
    port: '4502',
    path: '/content/dam/we-retail/en/experiences/destination.createasset.html',
    method: 'POST',
    headers: formData.getHeaders()
}, (res) => {
    res.on('data', (data) => {
       console.log('Data received: ', data.toString()); 
    });
});

request.on("error", (e) => {
    console.error(e);
});

formData.append('file', require("fs").createReadStream(binaryFilename));
formData.pipe(request);
**/

const { exec } = require("child_process");

//https://helpx.adobe.com/experience-manager/kb/common-AEM-Curl-commands.html
exec( 'curl -u "admin:admin" -X POST -F file=@"/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/artifact.indd" http://localhost:4502/content/dam/we-retail/en/experiences/destination.createasset.html' , (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});


/**
const formData = new FormData();

const req = http.request('http://localhost:4502/content/dam/we-retail/en/experiences/destination.createasset.html', function(response) {
  formData.append('file', '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/camp-fire.jpg' );
  console.log( response.statusCode  );
});

req.end();
*/
/**
  const req =  http.request(
    new URL( "http://localhost:4502/content/dam/we-retail/en/experiences/destination.createasset.html" ), 
    {
      method: "POST",
      auth: "admin:admin"
    },
    ( res ) => {
      console.log( res.statusCode );
    } );

req.on('error', error => {
  console.error(error)
});

const data = fs.readFileSync( '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/camp-fire.jpg' );

req.write(data);
req.end();
/**
const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d);
  });
});

fs.createReadStream('/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/camp-fire.jpg')
  .pipe(
    http.request( new URL( "http://localhost:4502/content/dam/we-retail/en/experiences/destination.createasset.html" ), {
      method: "POST",
      auth: "admin:admin"
    })
  );

/**
const data = fs.readFileSync( '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/camp-fire.jpg' );

const options = {
  hostname: 'localhost',
  port: 4502,
  path: '/content/dam/we-retail/en/experiences/destination.createasset.html',
  method: 'POST',
  headers: {
    auth: "admin:admin",
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error)
});

req.write(data);
req.end();
**/
