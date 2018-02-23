Fiber = require 'fibers'
access = require 'safe-access'

Operation = @OBWE.Operation
_ = lodash



# Hardcoded class, expect this to be removed
class SplitEvents extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    console.log arguments
    @mapping = opts?.arguments?.mapping
    super ActionFactory, opts


  generate: (user, actionObject) ->
    # Construct the model
    for event in actionObject.data.events
      # Generate a new task card
      action = _.cloneDeep actionObject

      # Copy the event into action.events
      action.data.events = event
      action.formData.events = event

      # Remember the parent, and generate a new ID
      action.parentID = action._id
      action._id = Random.id()

      @emit('data', user, action, 0)

    Fiber( () ->
      Actions.remove({_id: actionObject._id})
    ).run()


@OBWE.Operations.SplitEvents = SplitEvents

