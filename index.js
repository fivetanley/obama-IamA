!function() {

  var http = require( 'http' )
    , fs = require( 'fs' )
    , server = http.createServer( requestHandler )
    , amaHtml = ''
    , request = require( 'request' )
    , OBAMA_IAMA_URL =
      'http://www.reddit.com/r/IAmA/comments/z1c9z/i_am_barack_obama' +
        '_president_of_the_united_states/'
    , OBAMA_AMA_CACHE_FILE = __dirname + '/obama_ama.html'
    , PORT = process.env.NODE_PORT || 5000
    ;


  function updateAmaHtmlOnFileLoad( err, html ) {
    if ( err ) return console.log( 'Could not load file' )
    console.log( 'cache for AMA loaded' )
    if ( amaHtml !== '' ) return
    console.log( 'cache for AMA applied' )
    amaHtml = html
  }

  fs.readFile( OBAMA_AMA_CACHE_FILE , updateAmaHtmlOnFileLoad )

  function requestHandler( req, res ) {
    if ( !req.url.match( /^\/$/ ) ) return render404( res )
    return renderIamA( res )
  }

  function renderIamA( res ) {
    res.setHeader( 'Content-Type', 'text/html' )
    res.statusCode = 200
    res.write( amaHtml )
    res.end()
  }

  function render404( res ) {
    res.setHeader( 'Content-Type', 'text' )
    res.statusCode = 404
    res.write( 'Could not find that page!' )
    res.end()
  }

  function requestObamaIamA( success, error ) {
    request.get( OBAMA_IAMA_URL, function( error, response, body ) {
      if ( error || response.statusCode === 404 ) return error()
      return success( body )
    })
  }

  function saveAMAHtmlToDisk( html, path, callback ) {
    fs.writeFile( path, html, callback )
  }

  function updateAMAHtml( html ) {
    amaHtml = html
    saveAMAHtmlToDisk( html, OBAMA_AMA_CACHE_FILE, function( err ) {
      if ( err ) return console.log( 'Could not update cache file!!!' )
      console.log( 'Cache file updated' )
    })
  }

  function keepCheckingReddit() {
    requestObamaIamA( updateAMAHtml, function() {
      setTimeout( keepCheckingReddit, 1000 )
    })
  }

  keepCheckingReddit()

  server.listen( PORT )
  console.log( 'Listening on: ' + PORT )

}();
