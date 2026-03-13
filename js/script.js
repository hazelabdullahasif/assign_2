import { goToStep } from "./navigation.js";
import { updateCartTotal } from "./cart.js";
import { setupEventListeners } from "./events.js";

$(function () {
  setupEventListeners();
  goToStep(0);
  updateCartTotal();
});
