import { state } from './state.js';
import { TOTAL_STEPS, IMG_BASE, STEP_NAMES } from './config.js';

export function showToast(message, type) {
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
  // Using bootstrap's global object
  new bootstrap.Toast($el[0]).show();
  $el.on("hidden.bs.toast", function () { $(this).remove(); });
}

export function updateUI() {
  $(".steps li").each(function (i) {
    var suffix = (i === state.currentStep) ? "-active" : "";
    $(this).find(".step-icon").attr("src", IMG_BASE + STEP_NAMES[i] + suffix + ".png");
  });
  $("#back-btn").toggleClass("hidden", state.currentStep === TOTAL_STEPS - 1);
  if (state.currentStep === TOTAL_STEPS - 1) {
    $("#next-btn a").text("Proceed to checkout");
    $("#next-btn").addClass("finish");
  } else {
    $("#next-btn a").text("Continue");
    $("#next-btn").removeClass("finish");
  }
  state.isSubmitting = false;
}
