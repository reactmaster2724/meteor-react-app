Operation = @OBWE.Operation
Fiber = Npm.require('fibers')

_ = lodash

# Hardcoded class, expect this to be removed
class IssueDO extends Operation
  constructor: ($joi, $db, $logger, ActionFactory, opts) ->
    @name = opts?.name
    @db = $db
    @logger = $logger
    @targets = opts?.targets
    @inbox = !@formField #If we don't have a formField, it's an entry operation
    super ActionFactory, opts
    
  getItemStock: (item) ->
      delivery_note= Generics.delivery_note_item.findOne({item_code: item.item_code})
      purchase_receipt = Generics.purchase_receipt.findOne({item_code: item.item_code})

      if !purchase_receipt
        if delivery_note
          return delivery_note.actual_qty - delivery_note.qty
        else
          return 0

      if purchase_receipt and !delivery_note
        return purchase_receipt.received_qty
      else
        deldiffqty = delivery_note.actual_qty - delivery_note.qty
        purrecqty = purchase_receipt.received_qty

        if delivery_note.modified > purchase_receipt.modified
          return purrecqty + deldiffqty
        else
          return purrecqty

  generate: (user, actionObject) ->
    Fiber( () =>
      details = actionObject.formData.products.productdetails

      products = []
      product_lineitem = {}
      quantities = {}
      for product in details
        products.push product.item_code
        quantities[product.item_code] = @getItemStock(product)
        product_lineitem[product.item_code] = product

      # Fetch the re-order levels
      products = Generics.products.find({item_code: {$in: products}}, {re_order_qty: 1, re_order_level: 1})
      products = products.fetch()

      console.log products

      # Now check which products need to be re-ordered
      reorder = _.filter products, (product) ->
        return (quantities[product.item_code] - product_lineitem[product.item_code].qty) < product.re_order_level

      console.log "Reorder: "
      console.log reorder

      console.log "Quantities: " 
      console.log quantities

      if reorder.length > 0
        # Create a new object with the re-order quantities
        for product in reorder
          product.qty = product.re_order_qty
          delete product.re_order_qty

        action = {
          state: "PR_1"
          data: {
            products: {
              productdetails: reorder
            }
          }
          formData: {
            products: {
              productdetails: reorder
            }
          }
        }

        @emit 'data', user, action, 1

      @emit 'data', user, actionObject, 0


    ).run()


@OBWE.Operations.IssueDO = IssueDO

