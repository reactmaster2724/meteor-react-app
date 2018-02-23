@TimeTracker = new Mongo.Collection('timetracker')

TimeTracker.allow
  insert: (userId, action) ->
    #thing.name_sort = thing.name.toLowerCase()
    false
  update: (userId, action, fields, modifier) ->
    
    #thing.name_sort = thing.name.toLowerCase()
    false
  remove: (userId, action) ->
    false

