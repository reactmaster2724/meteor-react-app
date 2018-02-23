# if ( No of rejected line items > = 1 ) then 
# Create new task in the PR lane with pre populated supplier details.
# Add the rejected line item in the item table.
# if ( status of line = “Approved” && “Approved Quantity < Ordered Quantity” ) then 
# Remaining Quantity = Ordered Quantity - Approved Quantity 
# Add this line item in the item table in PR lane
# Send the task with all the approved line items to the Accounts Payables workflow.
# The goods that have been approved should be updated in ErpNext with the Actual Quantity.
# else 
# Send the task with all the approved line items to the Accounts Payables workflow.
# The goods that have been approved should be updated in ErpNext with the Actual Quantity.
Operation = @OBWE.Operation
Fiber = Npm.require('fibers')

_ = lodash

# Hardcoded class, expect this to be removed
class SplitForms extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super


  generate: (user, actionObject) ->
    Fiber( =>
      max_seq = Actions.findOne({}, {sort: {seq_id: -1}}).seq_id
      createAction = (form) =>
        max_seq += 1

        # Create the action
        action = _.cloneDeep(actionObject)
        action._id = Random.id()
        action.seq_id = max_seq
        action.parentID = actionObject._id
        
        # Remove the forms
        delete action.formData.forms
        delete action.data.forms

        action.formData.form = action.data.form = form
        Actions.upsert {_id: action._id}, action, (err, res) =>
          @emit 'data', user, action, 0

      # Create an action for each form
      for form in actionObject.data.forms
        createAction(form)

      Actions.remove {_id: actionObject._id}
    ).run()
@OBWE.Operations.SplitForms = SplitForms

