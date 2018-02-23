@Events = new Mongo.Collection('events')

Events.allow
  insert: (userId, action) ->
    #thing.name_sort = thing.name.toLowerCase()
    false
  update: (userId, action, fields, modifier) ->
    action._modified = new Date()
    action.lastModifiedBy = userId

    #thing.name_sort = thing.name.toLowerCase()
    false
  remove: (userId, action) ->
    false