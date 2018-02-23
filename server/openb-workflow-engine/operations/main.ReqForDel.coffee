_ = lodash
Fiber = Npm.require('fibers')

Operation = @OBWE.Operation

# Hardcoded class, expect this to be removed
class ReqForDel extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @formField = opts?.formField
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts

  generate: (user, actionObject) ->
    # Just copy the action to both lanes
    accpay = _.cloneDeep(actionObject)
    action = _.cloneDeep(actionObject)

    # Update IDs
    accpay._id = Random.id()
    action._id = Random.id()

    # Update SEQ IDS
    Fiber () =>
      top_action = Actions.findOne({}, {sort: {seq_id: -1}})
      action.seq_id = top_action.seq_id + 1
      accpay.seq_id = top_action.seq_id + 2

      @emit('data', user, action, 0)
      @emit('data', user, accpay, 1)
    .run()

@OBWE.Operations.ReqForDel = ReqForDel