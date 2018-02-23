_ = lodash

# Consider keeping dependencies in here, make it self-contained
class SimpleHttp
  constructor: ($http, $https, $queryString, $urlParser, $cookieParser) ->
    console.log "Using simplehttp.coffee constructor inside server/modules"
    @http = $http
    @https = $https
    @cookies = []
    @session_cookie = null

    @queryString = $queryString
    @urlParser = $urlParser
    @cookieParser = $cookieParser

  getJson: (url, callback) ->
    @get url, (err,response) ->
      return callback(err) if !!err
      try
        callback(null,JSON.parse(response))
      catch err
        callback(err)#https://docs.google.com/a/openbusiness.com.sg/uc?id=0B8w8-lk_XXU2Yk94RWpGcll3SG8

  get: (url, params, callback) ->
    if !callback
      callback = params
      params = {}

    binary = false
    if params.binary
      binary = true
      delete params.binary

    if url.indexOf('https') < 0 and url.indexOf('http') < 0
      url = "https://" + url
    opts = @urlParser.parse(url)

    processResponse = (response_stream) ->
      response = ""
      responseBinary = []
      #if binary
      #  response_stream.setEncoding('binary')

      response_stream.on 'data', (data) ->
        if binary
          responseBinary.push data
        else
          response += data
      response_stream.on 'end', (data) ->
        if binary
          buffer = Buffer.concat(responseBinary)
          callback(null, buffer, response_stream)
        else
          callback(null, response, response_stream)

    request =
      host: opts.hostname
      port: opts.port
      path: opts.path
      headers:
        Cookie: @session_cookie

    _.merge(request, params)

    if url.indexOf('https://') >= 0
      @http.get(request, processResponse).on "error", () -> console.log arguments
    else
      console.log "Reading HTTPS"
      @https.get(request, processResponse).on 'error',() -> console.log arguments

  postJson: (options, callback) ->
    options.body = JSON.stringify(options.body)
    if !options.headers
      options.headers = {}
    options.headers['Content-Type'] = 'application/json'
    options.headers['Content-Length'] = options.body.length
    @_post(options,callback)

  postErp: (options, callback) ->
    options.body = "data="+JSON.stringify(options.body)
    if !options.headers
      options.headers = {}
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.headers['Content-Length'] = options.body.length
    @_post(options,callback)

  putErp: (options, callback) ->
      options.body = "data="+JSON.stringify(options.body)
      if !options.headers
        options.headers = {}
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = options.body.length
      @_put(options,callback)

  post: (options, callback) ->
    options.body = @queryString.stringify(options.body)
    if !options.headers
      options.headers = {}
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.headers['Content-Length'] = options.body.length
    @_post(options,callback)

  _post: (options, callback) ->
    self = this
    reqOptions =
      host: options.host
      port: options.port || 80
      path: options.path
      method: 'POST'
      headers: options.headers
    reqOptions.headers.Cookie = @session_cookie

    post_req = @http.request reqOptions, (response_stream) ->
      response = ""
      if response_stream.headers?['set-cookie']
        self._set_cookie(response_stream.headers['set-cookie'])

      response_stream.on 'data', (data) ->
        response += data
      response_stream.on 'end', (data) ->
        callback(null, response, response_stream)

    post_req.on "error", () -> console.log arguments

    post_req.write(options.body)
    post_req.end()

  _put: (options, callback) ->
    self = this
    reqOptions =
      host: options.host
      port: options.port || 80
      path: options.path
      method: 'PUT'
      headers: options.headers
    reqOptions.headers.Cookie = @session_cookie

    post_req = @http.request reqOptions, (response_stream) ->
      response = ""
      if response_stream.headers?['set-cookie']
        self._set_cookie(response_stream.headers['set-cookie'])

      response_stream.on 'data', (data) ->
        response += data
      response_stream.on 'end', (data) ->
        callback(null, response)

    post_req.on "error",  () -> console.log arguments

    post_req.write(options.body)
    post_req.end()

  # TODO: This should be unique to requests
  _set_cookie: (cookies) ->
    for cookie in cookies
      _parsed = @cookieParser.parse cookie
      if _parsed.sid
        @session_cookie = cookie

    @cookies.push.apply(@cookies,cookies)
@SimpleHttpModule = SimpleHttp
