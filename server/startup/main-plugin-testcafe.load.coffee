Meteor.startup ->
  # Load future from fibers
  Future = Npm.require('fibers/future')
  # Load exec
  exec = Npm.require('child_process').exec
  fs = Npm.require('fs')

  # Server methods
  Meteor.methods
    bizfile: (actionId,formData) ->
      # This method call wont return immediately, it will wait for the
      # asynchronous code to finish, so we call unblock to allow this client
      # to queue other method calls (see Meteor docs)
      @unblock()
      future = new Future
      
      if fs.existsSync(process.env["PWD"] + "/.testcafe/bizfile/action/" + actionId)
        console.log "testcafe.load bizfile action has already been created!! system stops action"
        throw new (Meteor.Error)(80, command + "failed because file exists")
        return

      console.log "testcafe.load bizfile method actionId: " + actionId
      fs.writeFile(process.env["PWD"] + "/.testcafe/bizfile/action/" + actionId, JSON.stringify(formData))
      command = 'testcafe -e -S -s ' + process.env["PWD"] + '/.testcafe/bizfile/screenshots chrome ' + process.env["PWD"] + '/.testcafe/bizfile/download-entities.test.js'
      exec command, (error, stdout, stderr) ->
        console.log stdout
        if error
          console.log "error in testcafe bizfile error: " + error
          throw new (Meteor.Error)(500, command + ' failed')
        #future.return stdout.toString()
        return
      future.wait()
    
    singpasscode: (singpass_pin,actionId) ->
      # This method call wont return immediately, it will wait for the
      # asynchronous code to finish, so we call unblock to allow this client
      # to queue other method calls (see Meteor docs)
      @unblock()
      future = new Future
      command = 'echo ' + singpass_pin + ' > ' + process.env["PWD"] + '/.testcafe/bizfile/singpass_pin/' + actionId
      console.log 'main-plugin-testcafe-load singpasscode command :' + command
      exec command
      future.wait()
  return
