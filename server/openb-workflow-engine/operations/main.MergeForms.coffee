## Here we merge the forms
Operation = @OBWE.Operation
Fiber = Npm.require('fibers')

_ = lodash

# Hardcoded class, expect this to be removed
class MergeForms extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts

  generate: (user, actionObject) ->
    Fiber( () =>
      actionObject.state = @id

      console.log "actionObject....."
      console.log actionObject
      removeHashKeyFromAction = (data)->
        if(data instanceof Array)
          for val in data
            removeHashKeyFromAction val
        else if((typeof data) == 'object')
          for key, val of data
            if key is '$$hashKey'
              console.log 'Before Key'
              console.log data
              console.log key
              delete data.$$hashKey
              console.log 'After Key'
              console.log data
            removeHashKeyFromAction val

      removeHashKeyFromAction actionObject.formData.widgets
      removeHashKeyFromAction actionObject.data

      Actions.upsert {_id: actionObject._id}, actionObject
      formsNotInMergeState = Actions.find({parentID: actionObject.parentID, state: {$nin: [@id]}})

      # We can now create deployment as all forms now in merge state
      if formsNotInMergeState.count() is 0
        formsInMergeState = Actions.find({parentID: actionObject.parentID}).fetch()
        console.log formsInMergeState

        action = _.cloneDeep(actionObject)
        action._id = Random.id()
        action.state = 'DEPLOYMENTS'
        action.lastState = 'OPERATION'
        delete action.parentID
        delete action.formData.form
        delete action.data.form

        action.formData.forms = []
        action.formData.widgets = []

        try
          for form, i in formsInMergeState
            console.log "Index #{i}"
            if(form.formData.form?)
              console.log form.formData.form
              console.log form.formData.widgets
              console.log form.formData.widgets.length
              action.formData.forms[i] = form.formData.form
              action.formData.widgets[i] = []
              action.formData.widgets[i].push.apply action.formData.widgets[i], form.formData.widgets

          action.data.forms = action.formData.forms
          action.data.widgets = action.formData.widgets
        catch e
          console.error e

        Actions.upsert {_id: action._id}, action, (err, res) =>
          console.log 'Action upserted'
          console.log action
          @emit 'data', user, action, 0
    ).run()

@OBWE.Operations.MergeForms = MergeForms
