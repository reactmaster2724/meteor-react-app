Node = @OBWE.Node
Fiber = Npm.require('fibers')

# TODO:
# Right now this class is quite big, because
# it has a bunch of reusables that are really
# utility functions. Need to move these to a different
# file and remove ActionFactory from dependencies

# USed as a workaround
deepOmit = (sourceObj, callback, thisArg) ->
  destObj = undefined
  i = undefined
  shouldOmit = undefined
  newValue = undefined
  if _.isUndefined(sourceObj)
    return undefined
  callback = if thisArg then _.bind(callback, thisArg) else callback
  if _.isPlainObject(sourceObj)
    destObj = {}
    _.forOwn sourceObj, (value, key) ->
      newValue = deepOmit(value, callback)
      shouldOmit = callback(newValue, key)
      if !shouldOmit
        destObj[key] = newValue
      return
  else if _.isArray(sourceObj)
    destObj = []
    i = 0
    while i < sourceObj.length
      newValue = deepOmit(sourceObj[i], callback)
      shouldOmit = callback(newValue, i)
      if !shouldOmit
        destObj.push newValue
      i++
  else
    return sourceObj
  destObj

# Dependencies
_   = lodash

class BusinessObject extends Node
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    #console.log "main.bod.coffee constructor opts: " + JSON.stringify(opts,null,2)
    @joi = $joi
    @actionFactory = ActionFactory
    @definition = opts?.definition
    @schema = opts?.schema
    @printview = opts?.printview
    @name = opts?.name
    @module = opts?.module
    @category = opts?.category
    @db = $db
    @logger = $logger
    @label = opts?.label

  generate: (userid, actionObject) ->
    self = this
    console.log 'main.bod generate called with actionObject: ' + actionObject
    # Update the object
    # actionObject.formFields = @definition # TODO: Remove this, perform validation from this class instead of storing the data in the db
    actionObject.lastState  = actionObject.state
    actionObject.state      = @id # Comes from the super class
    actionObject.status     = 'tbp'
    actionObject.lane       = @name
    actionObject.title      = @label
    actionObject.module     = @module
    actionObject.data       = actionObject.data || {}
    actionObject.pulled     = false

    opts = actionObject.opts
    delete actionObject.opts unless !actionObject.opts

    actionObject.status_start = (new Date()).valueOf()
    actionObject.time = {} if !actionObject.time #Init
    actionObject.time[@name] =
      tbp: 0
      paused: 0
      in_progress: 0

    # Pull the justCreated property
    justCreated = actionObject.justCreated
    #actionObject.justCreated = false

    console.log 'generate actionObject: ' 
    console.log actionObject
    # TODO: Refactor a little
    save = (obj, cb) =>
      Fiber( () ->
        obj = deepOmit(obj, (val, key) ->
          return key is '$$hashKey'
        )
        if obj._updateSource?
          obj._updateSource = null
        Actions.upsert {_id: obj._id}, obj, (err, res) ->
          if err?
            self.logger.error "Could not generate action", err.message, "Ensure database connection works", userid
            console.log "Error in main.bod.coffee Actions.upsert: " + err.message + " userid: " + userid
            cb(err) if cb?
          else if justCreated
            self.logger.activity "task_created", userid, res
            cb(null,obj) if cb?
          else
            self.logger.activity "task_finished", userid, res
            cb(null,obj) if cb?
      ).run()

    # TODO: If this is the first action (e.g. 'justCreated')
    # We'll need to verify that the _id doesn't already exist
    # This is to prevent the front end from overwriting existing actions
    if justCreated
      @actionFactory.findById actionObject._id
      , (err,res) ->
        if !!res and res?.length isnt 0
          self.logger.error "Could not generate action", "_id already exists", "Ensure front-end isn't repeating ids"
        else
          save actionObject, (err,res) =>
            return if !opts.start
            # Automatically start action
            self.interact(userid, {
              ip: actionObject
              options:
                action: 'start'
            })
    else
      save(actionObject)



  interact: (userid, packet) ->
    self    = this
    ip      = packet.ip
    options = packet.options

    action  = options.action
    console.log "Interacting with #{ip._id} with action #{action}"


    # TODO: Perform basic authorization control here
    # TODO: Consider restricting this to an ActionObject API
    # Removing the ActionFactory dependency
    @actionFactory.findById ip._id, (err,actionObject) ->
      # We need to update the 'rev'
      actionObject._rev = ip._rev

      # HACK: Should find out the real cause
      if action in ['pause','continue','cancel'] and ip.status is 'tbp'
        actionObject.status = 'in_progress'

      # We need to retain the formData
      actionObject.formData = ip.formData

      # Retain the attachments
      actionObject.attachments = ip.attachments

      # Preserve the project ID
      actionObject.projectID = ip.projectID
      actionObject = deepOmit(actionObject, (val, key) ->
        return key is '$$hashKey'
      )

      # Do nothing on errors
      if err? #or ip.state != actionObject.state
        return

      # Remove when it's cancelled after its first creation
      if actionObject.justCreated and 'cancel' == action
        # Remove
        return actionObject.remove self.db, (err,res) ->
          if err?
            self.logger.error "Could not save to database", err.message, "Please ensure database is setup correctly", userid
          else
            self.logger.activity "task_" + event, userid, actionObject
      else if action != 'start'
        actionObject.justCreated = false

      # Now interact
      if action is 'update'
        if actionObject.status != 'in_progress'
          # We can update
          actionObject.save self.db, (err, res) ->
            if err?
              self.logger.error "Could not save to database", err.message, "Please ensure database is setup correctly", userid
            else
              self.logger.activity "task_updated", userid, actionObject
        else
          self.logger.error "Unable to perform action update", "Cannot update an action if it is in progress", "Please pause or cancel the action before updating"


      else if action != 'continue' or actionObject.status != 'in_progress'
        # Track time
        time = self._timeTrack(actionObject, userid)
        event = ''

        # Set the status
        if 'start' == action and actionObject.status != 'in_progress'
          # Set the status of the object
          actionObject.ownerID = userid
          actionObject.status = 'in_progress'
          event = 'started'

        else if 'pause' == action and actionObject.status == 'in_progress'
          # Set the status of the object
          actionObject.status = 'paused'
          actionObject.pulled = actionObject.pulled || (new Date()).valueOf()

          event = 'paused'

        else if 'stop' == action and actionObject.status == 'in_progress'
          # Set the status of the object
          actionObject.status = 'paused'
          event = 'stopped'

        else if 'cancel' == action and actionObject.status == 'in_progress'
          # Set the status of the object
          actionObject.ownerID = null
          actionObject.status = 'tbp'
          event = 'cancelled'

        else if 'undo' == action and (actionObject.status == 'tbp' || actionObject.status == 'failed') and actionObject.lastState != null and !actionObject.pulled
          actionObject.ownerID = null
          actionObject.status = 'tbp'
          event = 'undo'

          if actionObject.status is 'failed'
            actionObject.state = actionObject.lastState
            actionObject.lastState = null
            actionObject.pulled = false
          else
            return self.source?.sendBack 'data', userid, actionObject

        else if 'fail' == action and actionObject.status == 'in_progress'
          actionObject.status = "failed"
          actionObject.lastState = actionObject.state
          actionObject.state = "DONE"
          actionObject.pulled = false
          event = "failed"


          ###
          return actionObject.save self.db, (err,res) ->
            if err?
              self.logger.error "Could not save to database", err.message, "Please ensure database is setup correctly", userid
            else
              self.logger.activity "task_" + event, userid,
                action: actionObject
          ###


        else
          return self.logger.error "Unrecognized action performed", action + " is not a valid action when the action is in state " + actionObject.status, "Please ensure the correct action is passed to the options packet", userid

        actionObject.time = time

        # Now that we've done action specific stuff, finish off
        # with general operations
        actionObject.save self.db, (err,res) ->

          if err?
            self.logger.error "Could not save to database", err.message, "Please ensure database is setup correctly", userid
          else
            self.logger.activity "task_" + event, userid, actionObject

      else
        try
          # Validate with schema
          valid = tv4.validate ip.formData, self.schema

          # TODO: Validate database

          # Check if everything's valid, pass the object
          # to the next node
          if !valid #result?.error?
            self.logger.error 'Operation not valid', tv4.error, 'Ensure the front-end verified fields correctly', userid
            throw new Error "Invalid form data received"
          else
            # Update
            _.merge(actionObject.data, ip.formData)

            # Restore the action model
            actionObject.ownerID = null

            # Just emit, let the next object deal with database
            # storage
            self.emit("data",userid,actionObject)

        catch e
          console.log "CAUGHT ERROR"
          console.error e

          # Revert the status to paused
          actionObject.status = 'paused'
          actionObject.ownerID = userid

          actionObject.save self.db, (err,res) ->
            if err?
              self.logger.error "Could not save to database", err.message, "Please ensure database is setup correctly", userid
            else
              self.logger.error 'Operation not valid', e, 'Ensure the front-end verified fields correctly', userid

  _timeTrack: (data, userid) ->
    date = Date.now()

    # Backwards compatibility
    if !data.time
      data.time = {}

    if !data.time[@name]
      data.time[@name] = {}

    time_in_status = date - data.status_start

    data.time[@name][data.status] += time_in_status
    data.status_start = date

    # New method
    TimeTracker.insert
      timestamp: date
      status: data.status
      duration: time_in_status
      userid: userid
      action: data?._id
      lane: @name

    return data.time

OBWE.BOD = BusinessObject
