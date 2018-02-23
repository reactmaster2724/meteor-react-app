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
class IssuePO extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts


  generate: (user, actionObject) ->
    products = actionObject.data.products.productdetails

    console.log "Processing IssuePO... \n====================================="

    for product in products
      product.default_supplier = product.default_supplier or ""

    console.log products
    # Group the suppliers
    groups = _.groupBy(products, "default_supplier")

    saveAction = (action, sequence) =>
      Fiber( () =>
        top_action = Actions.findOne({}, {sort: {seq_id: -1}})

        action.seq_id = top_action.seq_id + sequence

        Actions.upsert {_id: action._id}, action, (err, res) =>
          @emit 'data', user, action, 0
      ).run()

    sequence = 1
    for supplier, group of groups
      # Here we push the cards to the next lane
      targetObject = _.cloneDeep(actionObject)

      # Set the line items
      targetObject.data.products.productdetails = group
      targetObject.formData.products.productdetails = group

      # Set the supplier data
      if !!supplier
        targetObject.data.suppliername = targetObject.formData.suppliername = supplier
        _.extend targetObject.data, group[0]
        _.extend targetObject.formData, group[0]

      # Generate a new ID
      targetObject._id = Random.id()

      # Generate the task card
      saveAction(targetObject, sequence)
      sequence += 1

    # Now we need to remove
    Fiber( () =>
      Actions.remove {_id: actionObject._id}
    ).run()
@OBWE.Operations.IssuePO = IssuePO

