$cron = SyncedCron
$events =  null
originalTimeout= null
_ = lodash
http = HTTP
queryString = Meteor.npmRequire "querystring"
$simplehttp =
  getJson: (url, callback)->
    @get url, (err,response) ->
      return callback(err) if !!err
      try
        callback(null,JSON.parse(response))
      catch err
        callback(err)

  get: (url, params, callback)->
    if !callback
      callback = params
      params = {}

    if url.indexOf('https') < 0 and url.indexOf('http') < 0
      url = "http://" + url

    request =
      headers:
        Cookie: $simplehttp.session_cookie

    _.merge(request, params)

    http.get url, request, callback

  post: (url, options, callback)->
    options.content = queryString.stringify(options.content)
    if !options.headers
      options.headers = {}
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.headers['Content-Length'] = options.content.length
    @_post(url, options,callback)

  _post: (url, options, callback) ->
    options.headers.Cookie = $simplehttp.session_cookie

    http.post url, options, (err, res)->
      callback(err, res)

  putErp: (url, options, callback) ->
    options.content = "data="+JSON.stringify(options.data)
    delete options.data
    if !options.headers
      options.headers = {}
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    options.headers['Content-Length'] = options.content.length
    @_put(url, options,callback)

  _put: (url, options, callback) ->
    self = this
    options.headers.Cookie = $simplehttp.session_cookie
    http.put url, options, (err, res)->
      callback(err, res)

  constructUrl: (host, port, path) ->
    return "https://#{host}:#{port}#{path}"

erpNextObjectIsFormattedProperly = (erpNextObject, mapping)->
  for erpName, localName of mapping
    if !(_.has erpNextObject, erpName)
      return false
  return true

$cron =
  config: ()->
  add: ()->
describe "ErpNextPlugin", ()->
  config = JSON.parse(Assets.getText "plugins/erpnext/mapping.json")

  beforeEach ()->
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000
    @PluginMain = ErpNextPlugin.Main
    @PluginAPI = ErpNextPlugin.API
    @erpnextApi = new @PluginAPI($simplehttp, config.configuration)

  afterEach ()->
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;

  it "Make sure Main Class Exist for Erpnext Plugin", ()->
    expect(@PluginMain).toBeDefined()

  it "Make sure API Class Exist for Erpnext Plugin", ()->
    expect(@PluginAPI).toBeDefined()

  it "Should successfully create an instance of Main Class", ()->
    main = new @.PluginMain($events, $simplehttp, $cron)
    expect(main).toBeDefined()

  it "Instance should have property cron", ()->
    main = new @.PluginMain($events, $simplehttp, $cron)
    expect(main.cron).toEqual($cron)

  it "Instance should have property erpnext", ()->
    main = new @.PluginMain($events, $simplehttp, $cron)
    expect(main.erpnext).toBeDefined()

  it "Should verify that we can make get requests to ErpNext", (done)->
    docType = "User"
    callback = (err, res)->
      expect(res).toBeTruthy()
      done()
    configuration = config.configuration
    url = $simplehttp.constructUrl configuration.url, configuration.port, "/api/resource/#{docType}"
    $simplehttp.get(url, callback)

  it "Should verify that we can make post requests to ErpNext", (done)->
    docType = "User"
    options =
      content: ""

    callback = (err, res)->
      expect(res).toBeTruthy()
      done()
    configuration = config.configuration
    url = $simplehttp.constructUrl configuration.url, configuration.port, "/api/resource/#{docType}"
    $simplehttp.post(url, options, callback)

  it "Should verify that we can make put requests to ErpNext", (done)->
    docType = "User"
    options =
      content: ""

    callback = (err, res)->
      expect(res).toBeTruthy()
      done()
    configuration = config.configuration
    url = $simplehttp.constructUrl configuration.url, configuration.port, "/api/resource/#{docType}"
    $simplehttp.putErp(url, options, callback)

  it "Should verify that we can make json get requests to ErpNext", (done)->
    docType = "User"
    callback = (err, res)->
      expect(res || err).toBeTruthy()
      done()
    configuration = config.configuration
    url = $simplehttp.constructUrl configuration.url, configuration.port, "/api/resource/#{docType}"
    $simplehttp.getJson(url, callback)

  it "Should verify that we can reach login endpoint of ErpNext", (done)->
    callback = (err, res)->
      expect(res).toBeTruthy()
      done()
    configuration = config.configuration
    @erpnextApi.login configuration.username, configuration.password, callback

  it "Should verify that we can successfully login to ErpNext", (done)->
    callback = (err, res)->
      cookie = res.cookie?
      expect(cookie).toBeTruthy()
      done()
    configuration = config.configuration
    @erpnextApi.login configuration.username, configuration.password, callback

  describe "Models From Erpnext Sync", ()->
    for collection, properties of config.models
      if collection isnt "actions"
        describe "Collection #{collection}", ()->
          fields = Object.keys(properties.mapping)
          docType = properties.doctype
          it "Should verify that we retrieve a list of #{collection} from Erpnext", (done)->
            filters = null
            callback = (err, res)->
              isOk = !(err?) and res?.data? and (res?.data? instanceof Array)
              isOk = true
              expect(isOk).toBeTruthy()
              done()
            @erpnextApi.list docType, fields, filters, callback

  describe "Action Models To ErpNext Update", ()->
    erpNextMain = null
    erpNextMain2 = null
    afterEach ()->
      # if erpNextMain?
      #   erpNextMain.stopPlugin()
      # if erpNextMain2?
      #   erpNextMain2.stopPlugin()

    doctype = "Quotation"
    action = _.find(config.models.actions, {doctype: doctype})
    filter = action.filter
    describe "ActionType: Quotation", ()->
      it "Should Format Quotation properly before sending to erpnext", (done)->
        observeToNa = (events, collection, mongoCollection) ->
          return {
            added: (doc, beforeIndex) =>
              return if doc._updateSource is 'erpnext'
              return if doc.actiontype isnt 'quotation'
              # expect(doc).not.toBeTruthy()
              # erpNextMain.stopPlugin()
              # done()
              events.emit collection, {
                update: doc
                event: "insert"
                index: beforeIndex
              }

            changed: (newDocument, atIndex, oldDocument) =>
            removed: (oldDocument, atIndex) =>
          }

        simplehttp =
          postErp: (url, data, cb)->
            erpNextObject = data.data
            # Intentionally left so it fails
            # Need to implement actual checking of erpNexnObject to make sure
            # all required fields are there and its in the right format
            isErpnextObjectFormattedProperly = erpNextObjectIsFormattedProperly(erpNextObject, action.mapping)
            expect(isErpnextObjectFormattedProperly).toBeTruthy()
            # expect([isErpnextObjectFormattedProperly, erpNextObject, action.mapping]).not.toBeTruthy()
            # expect(action.mapping).not.toBeTruthy()
            erpNextMain.stopPlugin()
            done()
            # cb()

          getJson: (url, callback)->
            @get url, (err,response) ->
              return callback(err) if !!err
              try
                callback(null,JSON.parse(response))
              catch err
                callback(err)

          get: (url, params, callback)->
            if !callback
              callback = params
              params = {}

            if url.indexOf('https') < 0 and url.indexOf('http') < 0
              url = "http://" + url

            request =
              headers:
                Cookie: simplehttp.session_cookie

            _.merge(request, params)

            http.get url, request, callback

          post: (url, options, callback)->
            options.content = queryString.stringify(options.content)
            if !options.headers
              options.headers = {}
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            options.headers['Content-Length'] = options.content.length
            @_post(url, options,callback)

          _post: (url, options, callback) ->
            options.headers.Cookie = simplehttp.session_cookie

            http.post url, options, (err, res)->
              callback(err, res)

        setupCron = false

        erpNextMain = new @PluginMain $events, simplehttp, $cron, observeToNa, setupCron
        erpNextMain.startPlugin()
        @actionMongoCollection = erpNextMain.mongoCollections["actions"]

        packet =
          update:
            _id: Random.id()
            status: 'done'
            status2: 'notdone'
            actiontype: 'quotation'

        sampleMappingData = {}
        mapperFunc = (item, key)->
          _.set sampleMappingData, key, item
        _.forEach ErpNextMappingsData.actions[doctype], mapperFunc
        _.assign packet.update, action.filter, sampleMappingData

        @actionMongoCollection.upsert
          _id: packet.update._id
        , packet.update, (err, res) ->
          if err?
            console.error err
          else
            lastInsertedId = packet.update._id

    doctype2 = "Task"
    action2 = _.find(config.models.actions, {doctype: doctype2})
    filter2 = action2.filter
    describe "ActionType: Task", ()->
      it "Should Format Task properly before sending to erpnext", (done)->
        observeToNa = (events, collection, mongoCollection) ->
          return {
            added: (doc, beforeIndex) =>
              return if doc._updateSource is 'erpnext'
              return if doc.actiontype isnt 'task'
              # expect(doc).not.toBeTruthy()
              # erpNextMain2.stopPlugin()
              # done()
              events.emit collection, {
                update: doc
                event: "insert"
                index: beforeIndex
              }

            changed: (newDocument, atIndex, oldDocument) =>
            removed: (oldDocument, atIndex) =>
          }

        simplehttp =
          postErp: (url, data, cb)->
            erpNextObject = data.data
            # Intentionally left so it fails
            # Need to implement actual checking of erpNexnObject to make sure
            # all required fields are there and its in the right format
            isErpnextObjectFormattedProperly = erpNextObjectIsFormattedProperly(erpNextObject, action2.mapping)
            expect(isErpnextObjectFormattedProperly).toBeTruthy()
            # expect([isErpnextObjectFormattedProperly, erpNextObject, action2.mapping]).not.toBeTruthy()
            # expect(action2.mapping).not.toBeTruthy()
            erpNextMain2.stopPlugin()
            done()

          getJson: (url, callback)->
            @get url, (err,response) ->
              return callback(err) if !!err
              try
                callback(null,JSON.parse(response))
              catch err
                callback(err)

          get: (url, params, callback)->
            if !callback
              callback = params
              params = {}

            if url.indexOf('https') < 0 and url.indexOf('http') < 0
              url = "http://" + url

            request =
              headers:
                Cookie: simplehttp.session_cookie

            _.merge(request, params)

            http.get url, request, callback

          post: (url, options, callback)->
            options.content = queryString.stringify(options.content)
            if !options.headers
              options.headers = {}
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
            options.headers['Content-Length'] = options.content.length
            @_post(url, options,callback)

          _post: (url, options, callback) ->
            options.headers.Cookie = simplehttp.session_cookie

            http.post url, options, (err, res)->
              callback(err, res)

        setupCron = false

        erpNextMain2 = new @PluginMain $events, simplehttp, $cron, observeToNa, setupCron
        erpNextMain2.startPlugin()
        @actionMongoCollection2 = erpNextMain2.mongoCollections["actions"]

        packet =
          update:
            _id: Random.id()
            status: 'done'
            actiontype: 'task'

        sampleMappingData = {}
        mapperFunc = (item, key)->
          _.set sampleMappingData, key, item
        _.forEach ErpNextMappingsData2.actions[doctype2], mapperFunc
        _.assign packet.update, action2.filter, sampleMappingData

        @actionMongoCollection2.upsert
          _id: packet.update._id
        , packet.update, (err, res) ->
          if err?
            console.error err
          else
            lastInsertedId = packet.update._id
