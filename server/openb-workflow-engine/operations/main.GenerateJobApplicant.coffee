Fiber = require 'fibers'
access = require 'safe-access'

Operation = @OBWE.Operation
_ = lodash



# Hardcoded class, expect this to be removed
class GenerateJobApplicant extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @collection = 'jobApplicant'
    ## hardcoded above, need to refactor
    @exclusive = opts?.arguments?.exclusive
    ####@mapping = opts?.arguments?.mapping
    super ActionFactory, opts
    #console.log "exiting main.GenerateObject constructor"
    ####console.log "@mapping :" + @mapping
    ####console.log "@collection :" + @collection
    console.log "opts :" + JSON.stringify(opts, null, 2)
    console.log "ActionFactory :" + JSON.stringify(ActionFactory, null, 2)

  generate: (user, actionObject) ->
    # Construct the model
    model = {}
    collection = Generics[@collection]
    console.log "in main.GenerateObeject generate model from actionObject: " + JSON.stringify(actionObject, null, 2)
    console.log "@mapping :" + @mapping
    console.log "collection :" + collection

    if !@exclusive
      console.log "in main.GenerateObject inside !@exclusive"
      # TODO: Should filter out any fields in mapping
      # But too lazy now
      for key, value of actionObject.data
        model[key] = value

    console.log "in main.GenerateObeject after !@exclusive model: " + JSON.stringify(model, null, 2)
    # Deal with the mapping
    if @mapping
      console.log "in main.GenerateObject if @mapping"
      for key, target of @mapping
        model[target] = access(actionObject, key)

    console.log "main.GenerateObeject after if @mapping model: " + JSON.stringify(model, null, 2)
    # TODO: Make expressions possible via json
    if model.FirstName? and model.LastName?
      model.name = model.FirstName + " " + model.LastName

    # Store the data into the collection
    Fiber( () =>
      # Insert the model
      model._id = Random.id()
      collection.insert model

      # Move the action onto the done lane
      @emit('data', user, actionObject, 0)

    ).run()


@OBWE.Operations.GenerateJobApplicant = GenerateJobApplicant

