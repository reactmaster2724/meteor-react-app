# Include the ERPNext API
API = @ErpNextPlugin.API
util = require 'util'
fs = require 'fs'
_  = lodash
access = require 'safe-access'


#methods?

observeToNa = (events, collection, mongoCollection) ->
  events.on "sync:#{collection}", (packet) ->
    console.log "observeToNa called for packet: " + JSON.stringify(packet) + " with collection: " + collection
    # Store the packet locally now
    mongoCollection.upsert
      _id: packet.update._id
    , packet.update, (err, res) ->
      if err?
        console.error err

  return {
    added: (doc, beforeIndex) =>
      return if doc._updateSource is 'erpnext'
      events.emit collection, {
        update: doc
        event: "insert"
        index: beforeIndex
      }

    changed: (newDocument, atIndex, oldDocument) =>
      if newDocument._updateSource is 'erpnext'
        newDocument._updateSource = null
        return
      if collection is 'actions'
        console.log "main.coffee erpnext if collection is actions collection:" + JSON.stringify(collection,null,2)
        events.emit collection, {
           update: newDocument
           event: "insert"
           index: atIndex
         }
      else
         events.emit collection, {
           update: newDocument
           event: "update"
           index: atIndex
         }

    removed: (oldDocument, atIndex) =>
      events.emit collection, {
        update: oldDocument
        event: "remove"
        index: atIndex
      }
  }
getCollection = (name) ->

  if name is 'actions'
    return Actions

  else
    for generic, mongoCollection of Generics
      if generic is name
        return mongoCollection
    return null

#end methods?

class ErpnextPlugin
  constructor: ($events, $simplehttp, $cron, $setupCron) ->
    # Dependencies
    @debug  = () ->
      console.log arguments

    @events = $events
    @cron = $cron
    @updateCache = {}
    @setupCron = false
    if $setupCron?
      @setupCron = $setupCron
    @observeToNa = observeToNa
    #if $observeToNa?
    #  @observeToNa = $observeToNa

    ## Setup required events for synchronization
    config = JSON.parse(Assets.getText "plugins/erpnext/mapping.json")
    @mapping = config.models

    ## setup cache for load erpnext on dashboard -hansel
    ##@erpnextconfig["Url"] = config.configuration

    # Construct the api for communication
    @erpnext = new API($simplehttp, config.configuration)
    @mongoCollections = []

    #@events = new require("events").EventEmitter()
    #already passed in a new event emitter here from erpnext.load???

  # Call this plugin when you are ready to start the plugin
  # Was added so normal operations do not intefere with integration test
  startPlugin: ()->
    @cursors = []
    for collection, properties of @mapping
      # Setup NA to ERPNext


      @mongoCollections[collection] = getCollection(collection)
      if !@mongoCollections[collection]
        console.log "erpnext main.coffee !@mongoCollections[collection], !!!not structured properly!!! collection :" + JSON.stringify(collection,null,2)
      continue if !@mongoCollections[collection] # Just ignore collections that are mapped poorly
      console.log "in main.coffee startPlugin - Pushing NA to ERPNext for " + collection

      cursor = @mongoCollections[collection].find()
      #console.log "cursor :" + util.inspect(cursor)
      cursor.observe @observeToNa(@events, collection, @mongoCollections[collection])
      @cursors.push cursor

      if properties instanceof Array
        for property in properties
          @_createListener(['insert','save','update','remove'], collection,property.doctype, property.mapping, property)
      else
        @_createListener(['insert','save','update','remove'], collection,properties.doctype, properties.mapping, properties)

      # Setup ERPNext to NA
      # We don't enable two-way sync for actions to protect workflow constraints
      if (collection isnt 'actions') and @setupCron # TODO: Probably move this to autosync
        console.log "Setting up cron for #{collection}"
        @_setupCron(collection,properties.doctype, properties.mapping)


      # Enable two way sync for specifically defined actions in mapping.json
      if (collection is 'actions') and @setupCron # TODO: Probably move this to autosync
        console.log "Setting up actions cron for #{collection} properties: " + JSON.stringify(properties,null,2)
        @_setupCron(collection,properties.doctype, properties.mapping)


  stopPlugin: ()->
    for cursor in @cursors
      cursor.stop()
    @events.removeAllListeners()

  _createListener: (events,collection,doctype,mapping, opts) ->

    @events.on "#{collection}", (packet) =>
      return if packet.event not in events
      # Don't bother if we don't support the event
      return if !@erpnext[packet.event]?

      # Don't sync if we can't match the filter
      return if opts.filter && !_.isMatch(packet.update, opts.filter)

      # Process the event
      erpnextObject = {}
      for erpName, localName of mapping
        erpnextObject[erpName] = _.get(packet, "update.#{localName}") || _.get(packet, "query.#{localName}")

      erpnextObject.modified = packet.update._modified
      _.extend(erpnextObject, packet.update.external.erpnext) if packet.update?.external?.erpnext?

      # packet.event = 'insert' if !packet.update?.external?.erpnext?


      # Change the event to insert if we don't have an erpnext key
      if !packet.update?.external?.erpnext?.name? or collection is 'actions'
        packet.event = "insert"

      if packet.event is 'update'
        console.log 'Logging packet for update'
        console.log packet.update

      return if collection is 'actions' and packet.update?.status not in ['tbp', 'done', 'failed']
      # return if packet.event is 'update' and !erpnextObject.name?

      # Execute the appropriate api call
      @erpnext[packet.event](doctype, erpnextObject, erpnextObject.name, (err, res) =>
        if err?
          console.log err
        else if !packet.update?.external?.erpnext?.name
          # Update locally
          packet.update.external = packet.update.external || {}
          _.extend(packet.update.external, {erpnext:{name: res.data.data.name}})

          @events.emit "sync:#{collection}",
            event: "update"
            query: packet.query
            update: packet.update
            timestamp: new Date(packet.update.modified) #, 'yyyy-mm-dd hh:MM:ss.l')
      )

  _docIsValidForErpNextInsert: (doc, mappings)->
    # if doc.justCreated? and !doc.justCreated
    #   return false
    for erpKey, localKey of mappings
      if !doc[localKey]? or doc[localKey].length is 0
        return false
    return true

  _docIsValidForErpNextUpdate: (newDocument, oldDocument)->
    if !oldDocument? or oldDocument._modified <= newDocument._modified
      return false
    return true

  _setupCron: (collection, doctype, mapping, callback) ->
    # Maintain a cache to detect deleted documents
    @updateCache[collection] = []

    processData = (err, items) =>
      if err?
        console.log "Error trying to process erpnext data for collection:#{collection}  doctype:#{doctype}"
        console.log err
        # console.log err
        # console.log items
      return if err? or !items
      # console.log items

      items = items.data

      mongoCollection = @mongoCollections[collection]

      # console.log items
      # First check for anything that's in the update cache
      missingItems = _.filter @updateCache[collection], (cacheItem) =>
        for item in items
          if item.name is cacheItem
            return false
        return true

      # Clear the update cache for this collection
      @updateCache[collection] = []
      @debug "No items missing for collection #{collection}!" if missingItems.length is 0
      @debug "Found #{missingItems.length} missing items" if missingItems.length isnt 0
      @debug missingItems if missingItems.length isnt 0
      @debug @updateCache[collection] if missingItems.length isnt 0
      @debug items if missingItems.length isnt 0

      # items = _.filter missingItems, (cacheItem)->
      #   for item in items
      #     if item.name is cacheItem
      #       return false
      #   return true

      # console.log items
      for item in items
        update = {}
        for erpName, localName of mapping
          if typeof localName is 'string'
            update[localName] = item[erpName]
          else if item[erpName]
            update[localName.key] = localName.prefix + item[erpName]

        update.external = {
          erpnext: {
            name: item.name
          }
        }

        @updateCache[collection].push item.name


        # Using the selector external.erpnext.name, update the resource iff
        # the modified date-time is later than the one present in the
        # collection. Use upsert.\

        # 1. Find the collection that is mapped to the 'collection' string
        # 2. Select the document by external.erpnext.name
        # 3. Upsert the document into the collection iff the erpnext document has a modified datetime higher than the meteor collection


        update._modified = item['modified']
        update._updateSource = "erpnext"
        mongoCollection.upsert {"external.erpnext.name": item.name}, update, (err2, affected)->
          if err2?
            console.log "Error upserting erpnext collection: #{collection} into db after sync"
            return
    # Setup a cronjob for synchronization
    cronJob = () =>
      console.log "Setup cron job for erpnext collection: #{collection} and doctype: #{doctype}"
      fields = Object.keys(mapping)
      @erpnext.list doctype, fields, null, processData

    @cron.config
      logger: (opts) ->
        console.log "Cron Job triggered"
        console.log('Message: ', opts.message)
        console.log('Tag: ', opts.tag)

    @cron.add
      name: "Job to Sync Erpnext Data into Nextaction for #{collection}"
      schedule: (parser)->
        return parser.cron('*/03 * * * * *')
      job: cronJob

    # Run once
    cronJob()

@ErpNextPlugin.Main = ErpnextPlugin
