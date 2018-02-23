@Actions = new Mongo.Collection('actions')

Actions.allow
  insert: (userId, action) ->
    console.log 'In the insert for action'
    action._created = new Date()
    action.creatorID = userId
    #thing.name_sort = thing.name.toLowerCase()
    true
  update: (userId, action, fields, modifier) ->
    action._modified = new Date()
    action.lastModifiedBy = userId

    #thing.name_sort = thing.name.toLowerCase()
    true
  remove: (userId, action) ->
    true