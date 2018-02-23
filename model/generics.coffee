if Meteor.isServer
  settings = JSON.parse(Assets.getText('config/app.json'))
  collections = JSON.parse(Assets.getText("workflows/#{settings.workflow}"))?.collections
  generics = Object.keys(collections)
  _ = lodash
  generics = _.difference(generics, ["actions", "users"])

  @Generics = {}

  for generic in generics
    @Generics[generic] = new Mongo.Collection(generic)
    @Generics[generic].allow
      insert: (userId, thing) ->
        thing._created = new Date()
        true
      update: (userId, thing, fields, modifier) ->
        thing._modified = new Date()
        true
      remove: (userId, thing) ->
        true

else
  Meteor.call("getGenerics", (err, generics) =>
    @Generics = {}
    for generic in generics
      @Generics[generic] = new Mongo.Collection(generic)
      @Generics[generic].allow
        insert: (userId, thing) ->
          thing._created = new Date()
          true
        update: (userId, thing, fields, modifier) ->
          thing._modified = new Date()
          true
        remove: (userId, thing) ->
          true

  )




