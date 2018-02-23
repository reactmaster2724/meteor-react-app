Node = OBWE.Node

class Operation extends Node
  constructor: (ActionFactory, opts) ->
    @output = []
    @cls = "Operation"
    @targets = opts?.targets
  
  addOutput: (output, index) ->
    @output[index] = output

  receive: (event, user, data) ->
    self = this
    console.log "RECEIVED INTERACTION event:" + event
    console.log data

    # Async retrieval
    if 'data' is event
      # Call data method
      self.generate user, data
    else if 'broadcast' is event
      # Deal with an interaction packet
      # If it's not for this state, forward

      path = @getPath(@, data.ip.state)
      console.log "BROADCASTING"
      console.log path

      self.emit(event,user,data,@targets.indexOf(path))
      # for target,i in @targets
      #   if @containsLane(@output[i].target, data.ip.state, [])
      #     console.log "Found in #{target}"
      #     self.emit(event,user,data,i)

  emit: (event, user, data, port) ->
    # TODO: Consider branching operations
    if !port
      port = 0

    if @output[port]
      @output[port].send(event,user, data)

  getPath: (from, target) ->
    if from.id is @paths[target].id
      return target
    else
      return @getPath(from, @paths[target].id)

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

@OBWE.Operation = Operation
@OBWE.Operations = {}