@ErpNextPlugin = {}
class ERPNextAPI
  constructor: ($simplehttp, $config) ->
    @simplehttp = $simplehttp
    # Configuration
    @erpurl = $config.url.replace('https://','')
    @port = $config.port || 443
    @admin =
      usr: $config.username || "Administrator"
      pwd: $config.password || "MKvbHKFrLVkYnGv8"
    @debug  = require("debug")("erpnext.api")

    globals.erpurl = @erpurl

  _isValid: (result) ->
    try
      JSON.parse(result)
      return true
    catch e
      return false


  login: (username, password, callback) ->
    @simplehttp.getJson "#{@erpurl}:#{@port}/api/method/frappe.auth.get_logged_user"
    ,(err,response) =>
      if !err and response?.message is username
        cookie = response.headers?['set-cookie'][4]
        @simplehttp.session_cookie = cookie
        callback(null,
          response: response
          cookie: cookie
        )
      else
        url = @constructUrl @erpurl, @port, "/api/method/login"
        @simplehttp.post url,
          content:
            usr: username
            pwd: password
        , (err1, response1) =>
          console.log 'Error logging in' if err1?
          console.log err1 if err1?
          return if !response1?
          cookie = response1.headers?['set-cookie'][4]
          # console.log 'Cookie Here'
          # console.log response1.headers?['set-cookie']
          # console.log response1.headers
          # console.log response1
          # cookie = response1.headers?['set-cookie'][4].split(";")[0].split("sid=")[1];
          @simplehttp.session_cookie = cookie
          callback(err1,
            response: response1
            cookie: cookie
          )

  insert: (docType, data, id, callback) ->
    @login @admin.usr, @admin.pwd, (err,response) =>
      url = "https://#{@erpurl}:#{@port}/api/resource/#{docType}"
      console.log 'In insert api.coffee calling url: ' + url + ' with data: ' + JSON.stringify(data,null,2)
      @simplehttp.postErp url,
        data: data
      , (err2,res2) =>
        # if !@_isValid(res2)
        #   err2 = res2
        #   res2 = null
        # Ignore these
        # @debug arguments if !err?.match('TimestampMismatchError')?
        callback(err2,res2) if callback?

  update: (docType, data, id, callback) ->
    if !id?
      callback('Trying to update without an id set')
      return
    @login @admin.usr, @admin.pwd, (err,response) =>
      url = "https://#{@erpurl}:#{@port}/api/resource/#{docType}/#{id}"
      @simplehttp.putErp url,
        data: data
      , (err,res) =>
        # if !@_isValid(res)
        #   err = res
        #   res = null
        # @debug arguments if !err?.match('TimestampMismatchError')?
        callback(err,res) if callback?

  save: (docType, data, id, callback) ->
    @login @admin.usr, @admin.pwd, (err,response) =>
      @simplehttp.putErp
        host: @erpurl
        port: @port
        path: "/api/resource/" + docType + "/" + id
        body: data
      , (err,res) =>
        # if !@_isValid(res)
        #   err = res
        #   res = null
        # @debug arguments if !err?.match('TimestampMismatchError')?
        callback(err,res) if callback?

  remove: (docType, data, id, callback) ->
    console.log "Warn: Remove not implemented (erpnext.api)"
    @debug arguments
    ###
    @login @admin.usr, @admin.pwd, (err,response) =>
      @simplehttp.putErp
        host: @erpurl
        path: "/api/resource/" + docType + "/" + id
        body: data
      , (err,res) ->
        console.log arguments if !res.match('TimestampMismatchError')?
        callback(err,res) if callback?
    ###

  list: (docType, fields, filters, callback) ->
    @login @admin.usr, @admin.pwd, (err,response) =>
      self = this
      if fields?
        fields.push "modified" if fields.indexOf('modified') < 0
        fields.push "name" if fields.indexOf('name') < 0

      fields = JSON.stringify(fields)
      console.log 'erpnext api.coffee list fields: ' + fields

      url = "https://#{@erpurl}:#{@port}/api/resource/#{docType}"
      if fields? and filters?
        url = url + "?filters=" + filters + "&fields=" + fields
      else if fields?
        url = url + "?fields=" + fields
      else if filters?
        url = url + "?filters=" + filters

      if fields? or filters?
        url = url + "&limit_page_length=2000"
      else
        url = url + "?limit_page_length=2000"

      self.simplehttp.get url, (err1, res1) ->
        if typeof res1 isnt 'object'
          try
            res1 = JSON.parse(res1)
            callback(null,res1.data)
          catch e
            callback(e,res1?.data)
        else
          callback(err1, res1?.data)

  findOne: (docType, name, callback) ->
    @login @admin.usr, @admin.pwd, (err,response) =>
      @simplehttp.get "https://#{@erpurl}:#{@port}/api/resource/#{docType}/#{name}", (err1, res1) ->
        callback(err1, res1)

  constructUrl: (host, port, path) ->
    return "https://#{host}:#{port}#{path}"

@ErpNextPlugin.API = ERPNextAPI
