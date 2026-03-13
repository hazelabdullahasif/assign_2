import { STEP_FIELDS } from './config.js';

export function setInvalid($input, message) {
  $input.removeClass("is-valid").addClass("is-invalid");
  if (message) $input.siblings(".invalid-feedback").text(message);
}

export function setValid($input) {
  $input.removeClass("is-invalid").addClass("is-valid");
}

function checkEmail(value) {
  var v = value.trim();
  if (!v) return "Email is required.";
  if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(v))
    return "Please enter a valid email address.";
  return null;
}

function checkNewPassword(value) {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value))
    return "Password must include uppercase, lowercase, and a number.";
  return null;
}

export function validateField(id) {
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

export function validateStep(stepIndex) {
  var fields = STEP_FIELDS[stepIndex] || [];
  var ok = true, $first = null;
  fields.forEach(function (id) {
    if (!validateField(id)) { ok = false; if (!$first) $first = $("#" + id); }
  });
  if ($first) $first.focus();
  return ok;
}
