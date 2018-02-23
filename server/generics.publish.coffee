'use strict'
settings = JSON.parse(Assets.getText('config/app.json'))
collections = JSON.parse(Assets.getText("workflows/#{settings.workflow}"))?.collections
generics = Object.keys(collections)
_ = lodash
generics = _.difference(generics, ["actions", "users"])
console.log generics

generics.forEach (generic) ->
  Meteor.publish generic, (options, searchString) ->
    # TODO: Use the search string
    if !searchString
      searchString = ''

    Generics[generic].find {}, {}