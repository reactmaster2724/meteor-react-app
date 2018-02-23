Meteor.startup ->
  console.log "Setting Up ErpNext Plugin"
  $events = new EventEmitter()
  
  queryString = require "querystring"
  http = HTTP
  _ = lodash
  $simplehttp = {
    session_cookie: null
    get: (url, params, callback)->
      if !callback
        callback = params
        params = {}

      if url.indexOf('https') < 0 and url.indexOf('http') < 0
        url = "https://" + url

      #console.log 'Checking if the cookie is set'
      #console.log $simplehttp.session_cookie

      request =
        headers:
          Cookie: $simplehttp.session_cookie

      _.merge(request, params)

      #console.log 'Logging out params'
      #console.log request

      http.get url, request, callback

    getJson: (url, callback)->
      @get url, (err,response) ->
        return callback(err) if !!err
        try
          callback(null,JSON.parse(response))
        catch err
          callback(err)#https://docs.google.com/a/openbusiness.com.sg/uc?id=0B8w8-lk_XXU2Yk94RWpGcll3SG8

    post: (url, options, callback)->
      options.content = queryString.stringify(options.content)
      if !options.headers
        options.headers = {}
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = options.content.length
      @_post(url, options,callback)

    postJson: (url, options, callback) ->
      options.body = JSON.stringify(options.body)
      if !options.headers
        options.headers = {}
      options.headers['Content-Type'] = 'application/json'
      options.headers['Content-Length'] = options.body.length
      @_post(url, options,callback)

    postErp: (url, options, callback) ->
      #console.log 'In erpnext.load.coffee postErp'


      options.content = "data="+JSON.stringify(options.data)
      delete options.data
      # options.body = "data="+JSON.stringify(options.body)
      # options.content = queryString.stringify(options.content)
      if !options.headers
        options.headers = {}
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = options.content.length
      @_post(url, options,callback)

    _parseResponse: (request, err, response, callback) ->
      #console.log "in erpnext-load _parseResponse request :" + JSON.stringify(request,null,2)
      #console.log "err :" + JSON.stringify(err,null,2)
      console.log "request :" + JSON.stringify(request,null,2)
      statusCode = err?.code or err?.response.statusCode or response.statusCode

      if statusCode >= 200 and statusCode < 300
        # Success, we pass the response
        callback(null, response)
      else if statusCode >= 400 and statusCode < 500
        # Client error, we don't retry
        callback(err)
      else if statusCode in [500, 502, 503, 504, 507]
        # Temporary server error, we can retry
        generateRetry = (req) =>

          if req.type is "POST"
            return () =>
              console.log("Retrying after #{req.retry._timeout(req.count)}...")
              @_post(req.url, req.options, callback, req.count, req.retry)
          else if req.type is "PUT"
            return () =>
              console.log("Retrying after #{req.retry._timeout(req.count)}...")
              @_put(req.url, req.options, callback, req.count, req.retry)

        if not request.count?
          request.count = 0
          request.retry = new Retry(
            baseTimeout: 100 #starting from 100ms and starting
            maxTimeout: 60000 * 60 #max timeout will be 1 hour
          )
        request.count += 1
        request.retry.retryLater request.count, generateRetry(request)

      else if statusCode is 511
        # We're not authenticated, we should log in and retry
        callback(err)

    _post: (url, options, callback, count, retry) ->
      options.headers.Cookie = $simplehttp.session_cookie
      #console.log 'After insert 4'



      http.post url, options, (err, res) =>
        @_parseResponse({url: url, options: options, retry: retry, type: "POST", count: count}, err, res, callback)
        #console.log 'Returns from post successfully'
        #console.log arguments

    putErp: (url, options, callback) ->
      # options.body = "data="+JSON.stringify(options.content)
      # options.content = queryString.stringify(options.content)
      options.content = "data="+JSON.stringify(options.data)
      delete options.data
      if !options.headers
        options.headers = {}
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      options.headers['Content-Length'] = options.content.length
      @_put(url, options,callback)

    _put: (url, options, callback, count, retry) ->
      self = this
      options.headers.Cookie = $simplehttp.session_cookie
      http.put url, options, (err, res) =>
        @_parseResponse({url: url, options: options, retry: retry, type: "PUT", count: count}, err, res, callback)
  }

  $cron = SyncedCron
  console.log "erpnext.load at creating new @ErpNextPlugin.Main $events: " + JSON.stringify($events,null,2) + " $simplehttp: " + $simplehttp + " $cron: " + $cron
  main = new @ErpNextPlugin.Main($events, $simplehttp, $cron, true)
  main.startPlugin()
  $cron.start()
