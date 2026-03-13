import { validateField } from './validation.js';
import { tryNavigateTo, goToStep } from './navigation.js';
import { updateCartTotal } from './cart.js';
import { submitToServer } from './api.js';
import { state } from './state.js';
import { TOTAL_STEPS } from './config.js';

export function setupEventListeners() {
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
    if (state.isSubmitting) return;
    if (state.currentStep === TOTAL_STEPS - 1) { submitToServer(); return; }
    tryNavigateTo(state.currentStep + 1);
  });

  // Back button
  $("#back-btn a").on("click", function (e) {
    e.preventDefault();
    if (state.currentStep > 0) goToStep(state.currentStep - 1);
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
}
