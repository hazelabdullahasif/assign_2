import { state } from './state.js';
import { updateUI, showToast } from './ui.js';
import { updateCartTotal } from './cart.js';
import { validateStep } from './validation.js';
import { STEP_TOASTS } from './config.js';

export function goToStep(step) {
  $(".step-panel").removeClass("active");
  $(".step-panel").eq(step).addClass("active");
  state.currentStep = step;
  updateUI();
  if (state.currentStep === 3) updateCartTotal();
}

export function tryNavigateTo(target) {
  if (target === state.currentStep) return;
  if (target <= state.maxReachedStep) { goToStep(target); return; }
  if (target === state.currentStep + 1) {
    if (!validateStep(state.currentStep)) {
      showToast("Please complete the current step first.", "warning");
      return;
    }
    state.maxReachedStep = target;
    if (STEP_TOASTS[state.currentStep]) showToast(STEP_TOASTS[state.currentStep], "success");
    goToStep(target);
  } else {
    showToast("Please complete the steps in order.", "warning");
  }
}
