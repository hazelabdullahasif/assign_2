import { SERVICE_FEE } from './config.js';

export function updateCartTotal() {
  var subtotal = 0;
  $("table.cart tbody tr").each(function () {
    var price    = parseFloat($(this).data("price")) || 0;
    var qty      = parseInt($(this).find(".qty-input").val(), 10) || 1;
    var rowTotal = price * qty;
    $(this).find(".row-total").text("$ " + rowTotal);
    subtotal += rowTotal;
  });
  var total = subtotal + SERVICE_FEE;
  $("#checkout-subtotal").text("$" + subtotal.toFixed(2));
  $("#checkout-total").text("$" + total.toFixed(2));
}
