Fiber = Npm.require('fibers')
Meteor.startup ->

  # Load the workflow here

  # Temporary workaround to speed up the port
  # should instead rework the engine in meteor
  # architecture
  # $joi, $db, $logger, ActionFactory
  logger =
    error: () ->
      console.error arguments
    activity: (evt, user, action) ->
      Events.insert 
        event: evt
        user: user?._id
        action: action?._id

  actionFactory =
    findById: (id, callback) ->
      Fiber( () ->
        action = Actions.findOne
          _id: id


        if !action
          callback(null, null)
        else
          action.remove = (db, callback) ->
            Actions.remove
              _id: @_id
            , callback
          action.save = (db, callback) ->
            save = @save
            delete @save

            if !@_created
              @_created = Date.now()
              @CreationDateTime = Date.now()

            @_modified = Date.now()

            # Save the action
            Actions.upsert
              _id: @_id
            , @, (err,res) =>
              callback(err,res)

          callback(null, action)
      ).run()

  WE = new OBWE.Graph(null, null, logger, actionFactory)
  @globals = {}
  @globals.Settings = JSON.parse(Assets.getText('config/app.json'))
  console.log "loading workflow",@globals.Settings.workflow
  @globals.Workflow = WE.loadGraph( JSON.parse(Assets.getText("workflows/#{@globals.Settings.workflow}")) )
  console.log "loaded workflow",@globals.Workflow
  @globals.Workflow.onDone (event,user,action) ->
    Fiber( () ->
      if action.ip?
        action = action.ip
      relAction = Actions.findOne {_id: action._id}
      relAction.status = "done"
      relAction.lastState = relAction.state
      relAction.state = "DONE"
      relAction.data = action.data
      relAction.formData = action.formData
      console.log "workflow.load.coffee onDone action :" + JSON.stringify(action, null,2) 
      Actions.upsert {_id: relAction._id}, relAction, (err, res) ->
        # Do nothing
    ).run()

  @globals.TaskCards = JSON.parse(Assets.getText('workflows/task_cards.json'))
  @globals.generatePdf = (asset, selector, callback) ->
    console.log "workflow.load generatePDF depreciated!!! it used blaze and wasnt reliable"
    ### comment out generatepdf feature
    # Setup the arguments
    args = ['assets/app/drivers/phantomjs.js']

    throw new Error "Callback is a required argument" if !callback
    throw new Error "Must provide data and user" if !selector?.data or !selector?.user

    # Use Blaze to generate the file with the data
    fs        = Npm.require 'fs'
    filePath = "/tmp/#{Random.id()}_#{Date.now()}.html"
    html = SSR.render("email." + (selector.template or "default"), {action:selector.data, user: selector.user})
    fs.writeFileSync( filePath, new Buffer(html) )
    args.push filePath
    console.log args

    # Spawn the process
    phantomjs = Meteor.npmRequire('phantomjs')
    spawn     = Npm.require('child_process').spawn
    command   = spawn(phantomjs.path, args)

    buffers = []
    command.stdout.on 'data', (data) ->
      # Should accumulate data here
      buffers.push data
    command.stderr.on 'data', (data) ->
      callback(data)
    command.on 'exit', () ->
      fileLocation = Buffer.concat(buffers).toString().replace("\n","")
      
      # Remove the temporary file
      fs.unlink(filePath, (err) ->
        console.error(err) if err?
      )
      # Read the file
      try 
        fileBuffer = fs.readFileSync(fileLocation)
        callback(null, fileBuffer)
      catch e
        callback(e)
      finally
        # Remove the file
        fs.unlink(fileLocation, (err) ->
          return callback(err) if err?
        )
  
  # Initialize emails
  emails = JSON.parse(Assets.getText('config/email.json'))
  if !emails.body 
    emailTemplates = Object.keys(emails)
  else
    emailTemplates = []

  for emailTemplate in emailTemplates
    SSR.compileTemplate("email."+emailTemplate, emails[emailTemplate].body)

  unless "default" in emailTemplates
    SSR.compileTemplate("email.default", (emails[emailTemplates[0]] or emails).body)
  ### 

  # @globals.generatePdf('config/email.json', {
  #   data: {test: "MyDataEntry"}
  #   user: {username: "Johnny"}
  # }, (err, buffer) ->
  #   console.log err
  #   fs = Npm.require 'fs'
  #   fs.writeFileSync '/tmp/pdf.pdf', buffer
  # )


  collections = JSON.parse(Assets.getText("workflows/#{@globals.Settings.workflow}"))?.collections
  generics = Object.keys(collections)
  _ = lodash
  @globals.GenericCollections  = _.difference(generics, ["actions", "users"])

  # Configure login handlers
  Accounts.validateNewUser (user) =>
    if Generics['ERPNextUsers'].find({"email": user.profile.email}).count() > 0 
      console.log "workflow.load validnewuser matched erpnext User"
      return true
    else
      console.log "workflow.load user not valided against erpnext User collection for : " + user.profile.email
      return false

  Slingshot.fileRestrictions "attachments",
    allowedFileTypes: ["image/png", "image/jpeg", "image/gif"]
    maxSize: 10 * 1024 * 1024 # 10 MB (use null for unlimited).

  Slingshot.createDirective "attachments", Slingshot.GoogleCloud,
    bucket: "nextaction"
    GoogleAccessId: "47e825b2061f99c1196ef108ddf7720fdc0a1be4"
    GoogleSecretKey:  Assets.getText('google-cloud-service-key.pem')
    acl: "public-read"

    authorize: () ->
      #Deny uploads if user is not logged in.
      if !@userId
        message = "Please login before posting files"
        throw new Meteor.Error("Login Required", message)

      return true

    key: (file) ->
      #tore file into a directory by the user's username.
      user = Meteor.users.findOne({_id: @userId})
      return user.profile.email + "/" + Date.now() + "-" + file.name

  # On User Create
  Accounts.onCreateUser (options, user) =>
    profile =
      name: options.profile.name
      email: user.services.google.email
      gender: user.services.google.gender
      google_id: user.services.google.id
      erpnext_sid: options.profile.erpnext_sid
      roles: @globals.Workflow.getUniqueNodes()
      groups: ['manager', 'employee']

    user.profile = profile
    return user

  # Configure google login
  for serviceName, serviceConfig of @globals.Settings.services
    ServiceConfiguration.configurations.remove
      service: serviceName

    config = _.clone(serviceConfig)
    _.extend( config, {service: serviceName} )
    ServiceConfiguration.configurations.insert config