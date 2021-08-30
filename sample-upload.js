/**
const DirectBinary = require('@adobe/aem-upload');

// URL to the folder in AEM where assets will be uploaded. Folder
// must already exist.
const targetUrl = 'http://localhost:4502/content/dam/we-retail/en/experiences/destination';

// list of all local files that will be uploaded.
const uploadFiles = [
    {
        fileName: 'file1.jpg', // name of the file as it will appear in AEM
        fileSize: 1024, // total size, in bytes, of the file
        filePath: '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/RScU8U/camp-fire.jpg' // Full path to the local file
    },
    {
        fileName: 'file2.jpg',
        fileSize: 512,
        filePath: '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/RScU8U/fly-fishing-the-amazon-1.jpg'
    }
];

const upload = new DirectBinary.DirectBinaryUpload();
const options = new DirectBinary.DirectBinaryUploadOptions()
    .withUrl(targetUrl)
    .withBasicAuth('admin:admin')
    .withUploadFiles(uploadFiles);

// this call will upload the files. The method returns a Promise, which will be resolved
// when all files have uploaded.
upload.uploadFiles(options)
    .then(result => {
      console.log( JSON.stringify( result, null, '  ' ) );
        // "result" contains various information about the upload process, including
        // performance metrics and errors that may have occurred for individual files

        // at this point, assuming no errors, there will be two new assets in AEM:
        //  http://localhost:4502/content/dam/target/file1.jpg
        //  http://localhost:4502/content/dam/target/file2.jpg
    })
    .catch(err => {
      console.error( err );
        // the Promise will reject if something causes the upload process to fail at
        // a high level. Note that individual file failures will NOT trigger this

        // "err" will be an instance of UploadError. See "Error Handling"
        // for more information
    });
**/
      ( async() => {
        const {
            FileSystemUploadOptions,
            FileSystemUpload
        } = require('@adobe/aem-upload');

        // configure options to use basic authentication
        const options = new FileSystemUploadOptions()
            .withUrl('http://localhost:4502/content/dam/we-retail/en/experiences/destination')
            .withBasicAuth('admin:admin');

        // upload a single asset and all assets in a given folder
        const fileUpload = new FileSystemUpload();
        await fileUpload.upload(options, [
          '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/RScU8U/camp-fire.jpg',
          '/var/folders/xz/w2_8ksms6p957wp02sd63yrm0000gq/T/dcmBpe/data.xml'
        ] );
      } )();
