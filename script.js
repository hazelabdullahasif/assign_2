$(function () {

  // Config
  var TOTAL_STEPS = 4;
  var SERVICE_FEE = 5.60;
  var IMG_BASE    = "https://colorlib.com/etc/bwiz/colorlib-wizard-8/images/";
  var STEP_NAMES  = ["step-1", "step-2", "step-3", "step-4"];

  // State
  var currentStep    = 0;
  var maxReachedStep = 0;
  var isSubmitting   = false;

  var STEP_FIELDS = [
    ["fname", "lname", "email", "userid", "country", "state", "city", "phone", "refcode"],
    ["cur-pass", "new-pass", "confirm-pass"],
    [], []
  ];
  var STEP_TOASTS = ["Basic details saved!", "Password updated!", "Cart review complete!"];


  // Toast notifications
  function showToast(message, type) {
    var bg = type === "success" ? "#8eb852" : "#f0a500";
    var id = "toast-" + Date.now();
    var html =
      '<div id="' + id + '" class="toast align-items-center text-white border-0 mb-2"' +
      ' role="alert" data-bs-autohide="true" data-bs-delay="3500"' +
      ' style="background:' + bg + ';">' +
        '<div class="d-flex align-items-center px-3 py-2" style="gap:10px;">' +
          '<div class="toast-body p-0 flex-grow-1"' +
               ' style="font-family:Lato,sans-serif;font-size:14px;font-weight:700;">' +
            message +
          '</div>' +
          '<button type="button" class="btn-close btn-close-white flex-shrink-0 ms-2"' +
                  ' data-bs-dismiss="toast"></button>' +
        '</div>' +
      '</div>';
    $("#toast-container").append(html);
    var $el = $("#" + id);
    new bootstrap.Toast($el[0]).show();
    $el.on("hidden.bs.toast", function () { $(this).remove(); });
  }


  // Validation helpers
  function setInvalid($input, message) {
    $input.removeClass("is-valid").addClass("is-invalid");
    if (message) $input.siblings(".invalid-feedback").text(message);
  }

  function setValid($input) {
    $input.removeClass("is-invalid").addClass("is-valid");
  }


  // Field validators
  function checkEmail(value) {
    var v = value.trim();
    if (!v) return "Email is required.";
    if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v))
      return "Please enter a valid email address.";
    return null;
  }

  function checkNewPassword(value) {
    if (!value)           return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value))
      return "Password must include uppercase, lowercase, and a number.";
    return null;
  }

  function validateField(id) {
    var $input = $("#" + id);
    var val    = $input.val();
    var err    = null;

    if (id === "email") {
      err = checkEmail(val);
    } else if (id === "new-pass") {
      err = checkNewPassword(val);
    } else if (id === "confirm-pass") {
      if (!val)                              err = "Please confirm your new password.";
      else if (val !== $("#new-pass").val()) err = "Passwords do not match.";
    } else if (id === "phone") {
      if (!val.trim())                          err = "Phone number is required.";
      else if (!/^\d{10,15}$/.test(val.trim())) err = "Enter a valid phone number (10-15 digits).";
    } else {
      if (!val.trim())
        err = ($input.attr("placeholder") || "This field") + " is required.";
    }

    if (err) { setInvalid($input, err); return false; }
    setValid($input);
    return true;
  }

  function validateStep(stepIndex) {
    var fields = STEP_FIELDS[stepIndex] || [];
    var ok = true, $first = null;
    fields.forEach(function (id) {
      if (!validateField(id)) { ok = false; if (!$first) $first = $("#" + id); }
    });
    if ($first) $first.focus();
    return ok;
  }


  // Step navigation
  function goToStep(step) {
    $(".step-panel").removeClass("active");
    $(".step-panel").eq(step).addClass("active");
    currentStep = step;
    updateUI();
    if (currentStep === 3) updateCartTotal();
  }

  function tryNavigateTo(target) {
    if (target === currentStep) return;
    if (target <= maxReachedStep) { goToStep(target); return; }
    if (target === currentStep + 1) {
      if (!validateStep(currentStep)) {
        showToast("Please complete the current step first.", "warning");
        return;
      }
      maxReachedStep = target;
      if (STEP_TOASTS[currentStep]) showToast(STEP_TOASTS[currentStep], "success");
      goToStep(target);
    } else {
      showToast("Please complete the steps in order.", "warning");
    }
  }

  function updateUI() {
    $(".steps li").each(function (i) {
      var suffix = (i === currentStep) ? "-active" : "";
      $(this).find(".step-icon").attr("src", IMG_BASE + STEP_NAMES[i] + suffix + ".png");
    });
    $("#back-btn").toggleClass("hidden", currentStep === TOTAL_STEPS - 1);
    if (currentStep === TOTAL_STEPS - 1) {
      $("#next-btn a").text("Proceed to checkout");
      $("#next-btn").addClass("finish");
    } else {
      $("#next-btn a").text("Continue");
      $("#next-btn").removeClass("finish");
    }
    isSubmitting = false;
  }

  function updateCartTotal() {
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


  // Validate on blur
  $(document).on("blur", ".form-control", function () {
    validateField($(this).attr("id"));
  });


  // Live validation while typing
  $(document).on("input", ".form-control", function () {
    var id = $(this).attr("id");
    if ($(this).hasClass("is-invalid")) validateField(id);
    if (id === "new-pass" && $("#confirm-pass").hasClass("is-invalid")) validateField("confirm-pass");
  });


  // Continue / checkout button
  $("#next-btn a").on("click", function (e) {
    e.preventDefault();
    if (isSubmitting) return;
    if (currentStep === TOTAL_STEPS - 1) { submitToServer(); return; }
    tryNavigateTo(currentStep + 1);
  });


  // Back button
  $("#back-btn a").on("click", function (e) {
    e.preventDefault();
    if (currentStep > 0) goToStep(currentStep - 1);
  });


  // Click step icons to navigate
  $(".steps li a").on("click", function (e) {
    e.preventDefault();
    var target = parseInt($(this).closest("li").data("step"), 10);
    tryNavigateTo(target);
  });


  // Quantity +/- buttons
  $(document).on("click", ".qty-plus, .qty-minus", function () {
    var $input = $(this).closest("tr").find(".qty-input");
    var val    = parseInt($input.val(), 10) || 1;
    $input.val($(this).hasClass("qty-plus") ? val + 1 : Math.max(1, val - 1));
    updateCartTotal();
  });


  // Show eye icon when typing password
  $(document).on("input", ".input-holder.password:not(.eye-only) input", function () {
    var $eye = $(this).siblings(".toggle-eye");
    if ($(this).val().length > 0) {
      $eye.css("display", "block");
    } else {
      $eye.css("display", "none");
      $(this).attr("type", "password");
      $eye.removeClass("zmdi-eye-off").addClass("zmdi-eye");
    }
  });


  // Toggle password visibility
  $(document).on("click", ".toggle-eye", function () {
    var $input   = $(this).closest(".input-holder").find("input");
    var isHidden = $input.attr("type") === "password";
    $input.attr("type", isHidden ? "text" : "password");
    $(this).toggleClass("zmdi-eye-off", isHidden).toggleClass("zmdi-eye", !isHidden);
  });


  // Submit form to server
  function submitToServer() {
    isSubmitting = true;
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
        isSubmitting = false;
        $("#next-btn a").text("Proceed to checkout");
        $("#submit-error").html("❌ Something went wrong. Please try again.").show();
      }
    });
  }


  // Initialize
  goToStep(0);
  updateCartTotal();

});
