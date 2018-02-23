# The glue between two different components
@OBWE = {}
class Connector
  constructor: ($target, $source) ->
    @source = $source
    @target = $target

  send: (event,user, data) -> 
    self = this

    # Async send
    process.nextTick () ->
      #console.log "OBWE connector send"
      #console.log "event: " + JSON.stringify(event,null,2)
      #console.log "user: " + JSON.stringify(user.data,null,2)
      #console.log "data: " + JSON.stringify(data,null,2)
      self.target.receive(event, user, data)

  sendBack: (event, user, data) ->
    self = this

    # Async send
    process.nextTick () ->
      if self.source.inbox
        # Send back, there's no lane before this one
        self.target.receive(event, user, data)
      else
        self.source.receive(event, user, data)

@OBWE.Connector = Connector