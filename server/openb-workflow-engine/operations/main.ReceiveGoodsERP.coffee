Operation = @OBWE.Operation
Fiber = Npm.require('fibers')

_ = lodash

# Hardcoded class, expect this to be removed
class ReceiveGoodsERP extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts


  generate: (user, actionObject) ->
    actionObject.formData.po_table = actionObject.data.po_table = [
      {
        t_warehouse: actionObject.formData.fg_warehouse
        qty: actionObject.formData.stocksplit_qty
        item_code: actionObject.formData.production_item
      }
    ]

    console.log(actionObject.formData)

    Fiber( () =>
      actionObject.justCreated = false
      Actions.upsert {_id: actionObject._id}, actionObject, (err, res) =>
        @emit 'data', user, actionObject, 0
    ).run()


@OBWE.Operations.ReceiveGoodsERP = ReceiveGoodsERP
