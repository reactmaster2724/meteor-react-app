Future = Npm.require('fibers/future')
Meteor.methods
  processFile: (fileData) ->
    # For now very simple
    fileData.timestamp = Date.now()
    return fileData

  print: (actionId, templateName) ->
    Future = Npm.require "fibers/future"
    pdfFuture = new Future()
    console.log "Generating pdf..."

    globals.generatePdf('config/email.json', {
      data: Actions.findOne({_id: actionId})
      user: Meteor.user()
      template: templateName
    }, (err, buffer) ->
      console.log "Generated pdf..."
      if err?
        pdfFuture.throw(err)
      else
        pdfFuture.return(buffer)
    )
    return pdfFuture.wait()

  getErpUrl: () ->
    return globals.erpurl

  getDefinitions: (userId) ->
    user = Meteor.users.findOne {_id: userId}


    definitions = globals.Workflow.getDefinitions(user)

    # Send back the definitions for the personal tasks as well
    #definitions.schemas.personal = @adhocEngine.schema
    #definitions.definitions.personal = @adhocEngine.definition

    # Return
    return definitions

  getUsersTimes: () ->
    return TimeTracker.aggregate [
      {
        $group:
          _id: {user: "$user", status: "$status", lane: "$lane"}
          duration: 
            $avg: "$duration"
      }
    ]

  getTimeTracker: () ->
    console.log 'actions.method getTimeTracker called'
    aggregate = TimeTracker.aggregate [
      {
        $group:
          _id: {lane: "$lane", status: "$status"}
          duration: 
            $avg: "$duration"
      }
    ]
    console.log aggregate
    return aggregate

  getGenerics: () ->
    return globals.GenericCollections

  getModelDefinitions: (userId) ->
    user = Meteor.users.findOne {_id: userId}

    definitions = globals.Workflow.getModelDefinitions(user)

    return definitions

  getTaskCards: () ->

    return globals.TaskCards

  getWorkflow: () ->
    lanes = globals.Workflow.getUniqueNodes()
    ret_arr = []
    for lane in lanes
      if lane != 'OPERATION'
        ret_arr.push
          label: globals.Workflow.getLabel(lane)
          name: lane
          ids: globals.Workflow.getIds(lane)
          category: globals.Workflow.getCategory(lane)

    return {
      lanes: ret_arr
      overrides: globals.Workflow.getOverrides()
    }

  # Interaction methods
  createAction: (data, state, userId, start = true) ->
    action = Actions.findOne({}, {sort: {seq_id: -1}})
    #user = Meteor.users.findOne {_id: userId}


    # Create a sequence id
    if action?.seq_id
      data.seq_id = action.seq_id + 1
    else
      data.seq_id = 1

    data._id = Random.id()
    # setting up data's structure
    data.justCreated = true
    data.state = state
    data.type = 'workflow'

    # Insert the action to make front end subscription work properly
    data.opts = {
      start: start
    }
    console.log 'actions.method createAction globals.Workflow.send data'
    console.log data
    globals.Workflow.send 'data', userId, data

    return data

  getAction: (id) ->
    # no security for now, any client can call for information on actionid, i think? meteor auth does provide a layer of protection already
    # 

    action = Actions.find({"_id": id}).fetch()[0]
    console.log 'actions.method getAction action: ' + JSON.stringify(action,null,2) + ' with id: ' + JSON.stringify(id)
    return action
  getAllAction: () ->
    # no security for now, any client can call for information on actionid, i think? meteor auth does provide a layer of protection already
    # 

    actions = Actions.find({}).fetch()
    #console.log 'actions.method getAction action: ' + JSON.stringify(action,null,2) + ' with id: ' + JSON.stringify(id)
    return actions
    
  startAction: (id, userId) ->
    action = Actions.findOne {_id: id}
    user = Meteor.users.findOne {_id: userId}
    if action.status is 'tbp'
      action.status = 'in_progress'

    if action.type is 'adhoc'
      # Adhoc action
    else
      console.log 'startAction action: '
      console.log action
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "start"}}

  pauseAction: (id, data, userId,attachments) ->
    action = Actions.findOne {_id: id}
    action.formData = data

    if attachments
      action.attachments = attachments

    console.log("PAUSING ACTION")

    user = Meteor.users.findOne {_id: userId}
    if action.type is 'adhoc'
      # Adhoc action
    else
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "pause"}}

  continueAction: (id, data, userId,attachments) ->
    action = Actions.findOne {_id: id}
    action.formData = data

    if attachments
      action.attachments = attachments

    user = Meteor.users.findOne {_id: userId}
    console.log "actions.methods continueAction action:" + JSON.stringify(action,null,2)
    if action.type is 'adhoc'
      # Adhoc action
    else
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "continue"}}

  releaseAction: (id, data, userId,attachments) ->
    console.log 'actions.methods releaseAction id: ' + id + ' data:' + data + ' userId: ' + userId
    action = Actions.findOne {_id: id}
    action.formData = data

    if attachments
      action.attachments = attachments

    user = Meteor.users.findOne {_id: userId}
    if action.type is 'adhoc'
      # Adhoc action
    else
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "cancel"}}

  undoAction: (id, userId) ->
    action = Actions.findOne {_id: id}
    user = Meteor.users.findOne {_id: userId}

    if action.type is 'adhoc'
      # Adhoc action
    else
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "undo"}}

  failAction: (id, userId) ->
    action = Actions.findOne {_id: id}
    user = Meteor.users.findOne {_id: userId}

    if action.type is 'adhoc'
      # Adhoc action
    else
      globals.Workflow.send 'broadcast', userId, {ip: action, options: {action: "fail"}}
