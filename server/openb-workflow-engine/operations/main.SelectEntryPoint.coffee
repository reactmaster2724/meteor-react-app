Operation = @OBWE.Operation

# Hardcoded class, expect this to be removed
class SelectEntryPoint extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @formField = opts?.formField
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts

  generate: (user, actionObject) ->
    # Use the action object to select the appropriate
    # operation
    # And emit, BOOYA
    # TODO: Need to mitigate in case of errors (what if formfield is empty?)

    if @formField
      @emit('data', user, actionObject, @targets.indexOf(actionObject.data[@formField]))
    else
      @emit('data', user, actionObject, @targets.indexOf(actionObject.state))

  received: (event, user, data) ->

    self = this
    print("Broadcast received on SelectEntryPoint")
    # Async retrieval
    if 'data' is event
      # Call data method
      self.generate user, data
    else if 'broadcast' is event
      # Deal with an interaction packet
      # If it's not for this state, forward
      for target,i in @targets
        print("Emitting broadcast")
        if @containsLane(@output[i].target, data.ip.state, [])
          console.log "Found in #{target}"
          self.emit(event,user,data,i)

  containsLane: (from, target, stack) ->
    if from.id is target
      return true
    if !from.output or from.id in stack # Reached done lane
      return false

    stack.push from.id

    if from.cls is 'Node'
      return @containsLane(from.output.target,target, stack)
    else
      truthvalues = []
      for output in from.output
        truthvalues.push(@containsLane(output.target,target, stack))
      return truthvalues.indexOf(true) >= 0

@OBWE.Operations.SelectEntryPoint = SelectEntryPoint