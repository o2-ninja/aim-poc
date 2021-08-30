
if( !console ) {
  var logfile = new File( Folder.temp + '/jsx.log' );
  logfile.open( 'a', 'TEXT' );
  logfile.lineFeed = 'Unix';
  /**
   * acts like console in node.js
   *
   * @returns {undefined}
   */
  const console = {
    log   : function( arg ) {
      logfile.writeln( arg );
    },
    error : function( arg ) {
      logfile.writeln( arg );
    }
  };
}

console.log( 'hoge' );

/**
 * XML を import する wrapper
 *
 * @memberof module:lib/xml
 * @param   {String}      path        path of XML file
 * @param   {Object}      textFrame   <a href="http://jongware.mit.edu/idcs6js/pc_TextFrame.html">textFrame</a>
 * @returns {undefined}
 */
function importXML( doc, xml ) {

  //const doc = textFrame.parent.parent;

  doc.xmlImportPreferences.properties = {
    createLinkToXML: false,
    repeatTextElements: true,
    ignoreUnmatchedIncoming: false,
    importTextIntoTables: true,
    ignoreWhitespace: false,
    removeUnmatchedExisting: false,
    importToSelected: false,
    importStyle: XMLImportStyles.MERGE_IMPORT,
    allowTransform: false,
    transformFilename: 1483961208,
    //transformParameters: ,
    importCALSTables: true
  };

  doc.importXML( xml );
  //textFrame.placeXML( doc.xmlElements );
  doc.recompose();


}

//HelloWorld.jsx
//Create a new document.
//var doc = app.documents.add();
////Get a reference to the first page.
//var myPage = doc.pages.item(0);
////Create a text frame.
//var myTextFrame = myPage.textFrames.add();
////Specify the size and shape of the text frame.
//myTextFrame.geometricBounds = ["6p0", "6p0", "18p0", "18p0"];
//Enter text in the text frame.

var mydoc = app.open( File( app.scriptArgs.get("dest") + '/template.idml' ) );

importXML( mydoc, File( app.scriptArgs.get("dest") + '/data.xml' ) );

//Save the document (fill in a valid file path).
//var myFile = new File(app.scriptArgs.get("dest") + "/HelloWorld.indd");
//var result = "saved to:  " + myFile.fullName + ' ' + Folder.temp + ' ' + logfile;
//if(!myFile.parent.exists && !myFile.parent.create()) {
//	result = "Not saved.  Unable to create the folder:  " + myFile.parent.fullName;
//} else {
//	doc = doc.save(myFile);
//}
//Close the document.
var saved = mydoc.save( new File( app.scriptArgs.get("dest") + '/artifact.indd' ) );
mydoc.close();

var result = saved.toString();

var savedFlag = new File( app.scriptArgs.get("dest") + '/confirmed-save' );
savedFlag.open( 'w', 'TEXT' );
savedFlag.lineFeed = 'Unix';
savedFlag.write( 'done' );
savedFlag.close();

result;

