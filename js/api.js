import { state } from './state.js';
import { SERVICE_FEE } from './config.js';

export function submitToServer() {
  state.isSubmitting = true;
  $("#submit-error").hide();
  $("#next-btn a").text("Submitting...");

  var cartItems = [];
  $(".cart tbody tr").each(function () {
    cartItems.push({
      name:     $(this).find(".product-detail a").text().trim(),
      price:    parseFloat($(this).data("price")) || 0,
      qty:      parseInt($(this).find(".qty-input").val(), 10) || 1,
      rowTotal: parseFloat($(this).find(".row-total").text().replace("$ ", "")) || 0
    });
  });

  var subtotal = parseFloat($("#checkout-subtotal").text().replace("$", "")) || 0;
  var total    = parseFloat($("#checkout-total").text().replace("$", "")) || 0;

  var payload = {
    submittedAt: new Date().toISOString(),
    profile: {
      firstName: $("#fname").val().trim(),
      lastName:  $("#lname").val().trim(),
      email:     $("#email").val().trim(),
      userId:    $("#userid").val().trim(),
      country:   $("#country").val().trim(),
      state:     $("#state").val().trim(),
      city:      $("#city").val().trim(),
      phone:     $("#phone").val().trim(),
      refCode:   $("#refcode").val().trim()
    },
    passwords: {
      currentPassword: $("#cur-pass").val(),
      newPassword:     $("#new-pass").val()
    },
    cart:       cartItems,
    subtotal:   subtotal,
    serviceFee: SERVICE_FEE,
    total:      total
  };

  $.ajax({
    url:         "http://localhost:3000/submissions",
    type:        "POST",
    contentType: "application/json",
    data:        JSON.stringify(payload),
    success: function () {
      window.location.href = "success.html";
    },
    error: function () {
      state.isSubmitting = false;
      $("#next-btn a").text("Proceed to checkout");
      $("#submit-error").html("❌ Something went wrong. Please try again.").show();
    }
  });
}
