# Base class which is instantiated from the 
# GraphLoader with a single input and a single output
# Nodes themselves are constructed by applying an instance
# of this class to the subclass, which has its own injected
# dependencies.

class Node
  constructor: (id) ->
    @id = id
    @cls = "Node"

  setSource: (connector) ->
    @source = connector

  setOutput: ($output) ->
    @output = $output

  receive: (event, user, data) ->
    self = this

    if 'data' is event
      # Call data method
      self.generate user, data
    else if 'broadcast' is event
      console.log "Broadcast received on #{self.id}:#{data?.ip?.state}"
      # Deal with an interaction packet
      # If it's not for this state, forward
      if data?.ip?.state != self.id
        console.log "Broadcast not for this state, forward"
        self.emit(event,user,data)

      # Otherwise we consume 
      else  
        console.log "consume broadcast"
        self.interact user, data

  setPaths: (paths) ->
    @paths = paths

  emit: (event, user, data) ->
    self = this

    if @output
      @output.send(event,user, data) 
    else
      @debug('Output port not defined')

OBWE.Node = Node