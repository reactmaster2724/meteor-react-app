'use strict'

_ = lodash

# Stump for more finegrained permission control
_getPermissions = (action,user) ->
  # Setup our basic knowledge domain
  actionLane = globals.Workflow.getLaneName(action.state)
  canClaim = (!action.ownerID) or (action.ownerID is user._id)
  hasRole = (actionLane in user.profile.roles)
  isEmployee = 'employee' in user.profile.groups
  isManager = 'manager' in user.profile.groups
  isAdmin = 'administrator' in user.profile.groups
  isPersonal = action.type in ['adhoc', 'personal'] and action.ownerID is user._id
  # Anyone who is not an employee, manager or admin is a guest
  isGuest = !(isEmployee or isManager or isAdmin)

  isAdmin = false # Deactivate admin account for local testing

  if action.state is 'DONE'
    edit = false
    view = !isGuest
    remove = isAdmin or isManager
  else
    edit = (isAdmin and canClaim) or (canClaim and hasRole)
    view = !isGuest
    remove = isAdmin

  return {
    edit: edit or isPersonal
    view: view or isPersonal
    remove: remove or isPersonal
  }

getRequiredFields = () ->
  requiredFields = ["time", "_id", "ownerID", "_created", "CreationDateTime", "_modified", "creatorID", "state", "status", "lastState", "seq_id"]
  for key, taskCard of globals.TaskCards
    for mapping, field of taskCard
      continue if !field or field is "" or field in [true, false]
      requiredFields.push "data.#{field}"
      requiredFields.push "formData.#{field}"

  # Filter out the duplicates
  requiredFields = _.uniq requiredFields

  # HACK
  requiredFields.push "can"

  # Due Date for finance
  requiredFields.push "data.duedate"
  requiredFields.push "formData.duedate"

  return requiredFields

transformedFind = (query, options, self) ->
  if options.transform?
    transform = options.transform
    delete options.transform

    observer = Actions.find(query, options).observe
      added: (doc) =>
        self.added('actions',doc._id,transform(doc))
      changed: (doc) =>
        self.changed('actions',doc._id,transform(doc))
      removed: (doc) =>
        self.removed('actions',doc._id)

    self.onStop () ->
      observer.stop()

    self.ready()
  else
    return Actions.find query, options


# Actual publishing
Meteor.publish 'actions', (options, searchString) ->
  console.log 'actions.publish publish actions options: ' + options
  if !searchString
    searchString = ''

  user = Meteor.users.findOne({_id: @userId})

  requiredFields = getRequiredFields()
  dashboard = options
  ids = globals.Workflow.getCategoryIds(dashboard)

  # Return the actions with the necessary fields
  return transformedFind {
      $or: [
        {state: {$in: ids}}
        {state: "DONE", lastState: {$in: ids}}
      ]
    },{
      fields: _.object(requiredFields, _.fill(new Array(requiredFields.length),1))
      transform: (doc) ->
        doc.can = _getPermissions(doc, user)
        return doc
    }, @

# Fetch a single action from the system
Meteor.publish 'singleAction', (id) ->
  if !id
    id = ''
  user = Meteor.users.findOne({_id: @userId})
  return transformedFind {_id: id}, {
    fields: _.object(requiredFields, _.fill(new Array(requiredFields.length),1))
    transform: (doc) ->
      doc.can = _getPermissions(doc, user)
      return doc
  }, @