# External dependencies
fs   = require "fs"
util = require 'util'

# Dependencies
_   = lodash

# Load dependencies
Connector = OBWE.Connector
Node = OBWE.Node
BOD = OBWE.BOD

Dijkstra = (Graph, Source, dist_between, Index, getNeighbours) ->
  dist = {}
  previous = {}

  # Initialize
  for vertex, v in Graph
    dist[Index(vertex)] = Infinity
    previous[Index(vertex)] = undefined

  dist[Index(Source)] = 0
  Q = _.cloneDeep(Graph)

  while Q.length > 0
    # Find node in Q with minimum distance
    minIndex = 0
    for node in Q
      if dist[Index(node)] < dist[minIndex]
        minIndex = Index(node)

    # Remove the u from Q
    u = Q.splice(minIndex, 1)[0]

    neighbours = getNeighbours(u, Graph)
    #console.log neighbours
    for v in neighbours
      alt = dist[Index(u)] + dist_between(u,v)
      if alt < dist[Index(v)]
        dist[Index(v)] = alt
        previous[Index(v)] = u

  return previous

deepOmit = (sourceObj, callback, thisArg) ->
  destObj = undefined
  i = undefined
  shouldOmit = undefined
  newValue = undefined
  if _.isUndefined(sourceObj)
    return undefined
  callback = if thisArg then _.bind(callback, thisArg) else callback
  if _.isPlainObject(sourceObj)
    destObj = {}
    _.forOwn sourceObj, (value, key) ->
      newValue = deepOmit(value, callback)
      shouldOmit = callback(newValue, key)
      if !shouldOmit
        destObj[key] = newValue
      return
  else if _.isArray(sourceObj)
    destObj = []
    i = 0
    while i < sourceObj.length
      newValue = deepOmit(sourceObj[i], callback)
      shouldOmit = callback(newValue, i)
      if !shouldOmit
        destObj.push newValue
      i++
  else
    return sourceObj
  destObj

class Graph
  constructor: ($joi, $db, $logger, ActionFactory) ->
    #console.log "main.graph.coffee Graph constructor arguments: " + JSON.stringify(arguments,null,2)
    @arguments = Array::slice.call(arguments, 0)
    @ActionFactory = ActionFactory

  loadGraphFile: (file, callback) ->
    self = this
    process.nextTick () ->
      try
        fs.readFile file, (err,doc) ->
          try
            throw err if err?
            callback null, self.loadGraph(JSON.parse(doc))
          catch e
            callback(e)
      catch e
        callback(e)


  loadGraph: (json) ->
    # TODO: Make this an external class
    # Construct a graph object
    self = this

    graph =
      exit: null
      to: null
      nodes: null
      inbox: true

      getLabel: (name) ->
        return @labels[name] if @labels?[name]?
        return "Not recognized: " + name

      getDefinitions: () ->
        uniq_nodes = []
        definitions = {}
        printviews = {}
        schemas = {}
        modules = {}
        #collections = {}
        ## above testing
        for id, node of @nodes
          if node.name in uniq_nodes
            continue
          else if node.name
            uniq_nodes.push node.name
            definitions[node.name] = node.definition
            printviews[node.name] = node.printview
            schemas[node.name] = node.schema
            modules[node.name] = node.module
            #collections[node.name] = node.collections
            #console.log "collections :" + collections
            # console.log "main.graph getDefinitions node: " + util.inspect(node,null,2)
            #debugger
            ## 3 above testing
        return {
          nodes: uniq_nodes
          definitions: definitions
          printviews: printviews
          schemas: schemas
          modules: modules
          #collections: collections
          ## above testing
          entry_points: @getEntryPoints(@to.target)
        }

      getCategoryIds: (category) ->
        ids = []
        for id, node of @nodes
          ids.push.apply(ids, @getIds(node.name)) if node.category is category or (category is 'main' and !node.category)
        return ids

      getLaneName: (state) ->
        for id, node of @nodes
          return node.name if id is state
        return null


      getEntryPoints: (from) ->
        if from.cls is 'Node'
          return [from.id]
        else
          entry_points = []
          for output in from.output
            entry_points.push.apply(entry_points, @getEntryPoints(output.target))
          return entry_points

      getUniqueNodes: () ->
        uniq_nodes = []
        for id, node of @nodes
          if node.name in uniq_nodes
            continue
          else if node.name
            uniq_nodes.push node.name
        return uniq_nodes

      getOverrides: () ->
        return json.overrides

      getIds: (type) ->
        ids = []
        for id, node of @nodes
          ids.push id if node.name == type
        return ids

      getCategory: (type) ->
        for id, node of @nodes
          return node.category if node.name == type
        return 'main'

      getModelDefinitions: () ->
        return json.collections

      onDone: (callback) ->
        @exit = callback

      receive: () ->
        @exit.apply(this, arguments) if @exit

      send: (event, user, data) ->
        data = deepOmit(data, (val, key) ->
          return key is '$$hashKey'
        )
        process.nextTick Meteor.bindEnvironment( =>
          if !@to
            return

          # Send data through
          if event is 'data'
            console.log 'main.graph.coffee event is data'
            @to.send(event, user, data)
          else
            console.log "Send from workflow data :" + JSON.stringify(data,null,2)
            self.ActionFactory.findById data.ip._id, (err,action) =>
              console.log("Find by id")
              # For DONE actions, treat them as if they were in their last state
              if action.state is 'DONE'
                action.state = action.lastState
              data.ip.state = action.state # Restore the state
              data.ip.status = action.status # Restore the status
              @to.send(event, user, data)
        )

      setLabels: (labels) ->
        @labels = labels

      setSource: (source) ->
        @source = source

      setOutput: (to) ->
        @to = to

      setNodes: (nodes) ->
        @nodes = nodes

      setPaths: (paths) ->
        for nodeId, node of @nodes
          node.setPaths(paths) unless node is @

    # Construct the first node
    nodes = {}

    # Create nodes
    for id, node of json.nodes
      if 'ENTRY' is id
        nodes[id] = graph
      else
        if node.type != 'OPERATION'
          # console.log "graph create nodes if != OPERATION node: " + JSON.stringify(node,null,2)
          printview = json.printviews?[node.type]
          definition = json.definitions[node.type]
          schema = json.schemas[node.type]
        nodes[id]  = @_loadNode(id,node.operation_type,
          label: node.label
          name: node.type
          definition: definition
          printview: printview
          schema: schema
          module: node.module
          category: node.category
          targets: node.to
          arguments: node.arguments
        )

    # Map the OUTBOX
    nodes.OUTBOX = graph

    # Delete output node if there is one
    delete json.nodes.OUTBOX if json.nodes.OUTBOX

    # Create connections
    for id, node of json.nodes
      if node.type is "OPERATION"
        console.log "graph node.type is OPERATION node: " + JSON.stringify(node,null,2)
        targets = []
        collection = node.collection
        for instId, instNode of nodes
          connector = new Connector(instNode,nodes[id])
          nodes[id].addOutput connector, node.to.indexOf(instId) if instId in node.to
          instNode.setSource connector, node.to.indexOf(instId) if instId in node.to
      else
        target = nodes[node.to]
        connector = new Connector(target,nodes[id])
        nodes[id].setOutput connector
        target.setSource connector

    graph.setNodes nodes
    graph.setLabels json.labels
    values = _.values(nodes)
    entry = _.findIndex(values,(node) -> return !!node.labels)
    values.splice(entry,1)


    graph.setPaths Dijkstra(values, values[0], () ->
      return 1
    , (node) ->
      return node?.id or "DONE" # If node is undefined, it's probably outbox
    , (node, _graph) ->
      targets = []
      #console.log node.id or node
      #console.log Object.keys(node)
      if node.cls is "Node"
        targets = [node.output.target]
      else
        if node.output instanceof Array
          targets = node.targets
        else
          targets = [node.targets]

        targets = _.map(targets, (target) ->
          _.find(_graph, (node) ->
            node.id == target
          )
        )
      return targets
    )


    return graph

  _loadNode: (id, op_type, opts) ->
    # Prepare the arguments
    args = []
    for arg in @arguments
      args.push arg
    args.push opts

    # Instantiate the operation or node
    if opts.name == 'OPERATION'
      console.log "main.graph.coffee _loadNode if opts.name== 'OPERATION' op_type: " + op_type
      #console.log "opts: " + JSON.stringify(opts,null,2)
      console.log "i'm OBWB",OBWE
      return @_instantiateClass(OBWE.Operations[op_type],id,args)()
    else
      return @_instantiateClass(BOD, id, args)()

  _instantiateClass: (Constructor, id) ->
    args = Array::slice.call(arguments, 2)
    ->
      inst = undefined
      ret = undefined

      # Copy Node
      TempNode = Node

      # Give the Temp constructor the Constructor's prototype
      TempNode:: = Constructor::

      # Create a new instance
      inst = new TempNode(id)

      # Call the original Constructor with the temp
      # instance as its context (i.e. its 'this' value)
      ret = Constructor.apply(inst, args[0])

      # If an object has been returned then return it otherwise
      # return the original instance.
      # (consistent with behaviour of the new operator)
      (if Object(ret) is ret then ret else inst)

@OBWE.Graph = Graph
