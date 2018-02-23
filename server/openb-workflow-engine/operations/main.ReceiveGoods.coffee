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
Fiber = require 'fibers'
access = require 'safe-access'

Operation = @OBWE.Operation
_ = lodash

# Hardcoded class, expect this to be removed
class ReceiveGoods extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @formField = opts?.formField
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts

  generate: (user, actionObject) ->
    products = actionObject.data.products.productdetails

    rejectedGoods = _.some products, (product) ->
      return _.some(product.more, (entry) ->
        return entry.approvegoods_sunyu is "dontapprove" or
               (entry.approvegoods_sunyu in ["approve",'',null] and 
                product.actualqty < product.qty)
      )

    if rejectedGoods
      # Create a task in PO lane with pre-populated supplier details
      # Add the rejected line item in the item table.
      # if ( status of line = “Approved” && “Approved Quantity < Ordered Quantity” ) then 
      # Remaining Quantity = Ordered Quantity - Approved Quantity 
      # Add this line item in the item table in PR lane
      # Send the task with all the approved line items to the Accounts Payables workflow.
      # The goods that have been approved should be updated in ErpNext with the Actual Quantity.
      poObject = _.cloneDeep(actionObject)
      actionObject = _.cloneDeep(actionObject)

      rejectedLines = []
      approvedLines = []

      for product in poObject.data.products.productdetails
        approved = _.some(product.more, (entry) -> entry.approvegoods_sunyu in ['approve','',null])

        if approved and product.actualqty < product.qty
          approvedqty = product.actualqty
          rejectedqty = product.qty - approvedqty

          approved = _.cloneDeep(product)
          rejected = _.cloneDeep(product)

          approved.qty = approvedqty
          rejected.qty = rejectedqty

          rejectedLines.push rejected
          approvedLines.push approved
        else if approved and product.actualqty is product.qty
          approvedLines.push product
        else
          rejectedLines.push product

      # Construct the two objects
      poObject.data.products.productdetails = poObject.formData.products.productdetails = rejectedLines
      actionObject.data.products.productdetails = actionObject.formData.products.productdetails = approvedLines

      # TODO: Also construct a new seq_id for poObject
      Fiber( () =>
        top_action = Actions.findOne({}, {sort: {seq_id: -1}})
        poObject.seq_id = top_action.seq_id + 1
        poObject._id = Random.id()
        originalId = actionObject._id
        actionObject._id = Random.id()

        if approvedLines.length > 0
          @emit('data', user, actionObject, 0)
        @emit('data', user, poObject, 1)
        Actions.remove({_id: originalId})
      ).run()


    else

      # Just go through to the accounts payables workflow (e.g. next task in workflow)
      @emit('data', user, actionObject, 0)



@OBWE.Operations.ReceiveGoods = ReceiveGoods

