// myDirective.ts
import $ from "jquery";
import { DirectiveBinding } from "vue/types/options";
import Tooltip from "bootstrap/js/dist/tooltip";
import PopoverPlacement = Tooltip.PopoverPlacement;

export default {
  inserted(el: HTMLElement, binding: DirectiveBinding) {
    let placement: PopoverPlacement = "top";
    if (!binding.value) return;

    if (
      binding.arg &&
      ["auto", "top", "left", "right", "bottom"].includes(binding.arg)
    ) {
      placement = binding.arg as PopoverPlacement;
    } else {
      if (binding.arg !== undefined)
        throw new Error("Invalid placement: " + binding.arg);
    }
    $(el).tooltip({
      title: binding.value,
      placement: placement,
      trigger: "hover",
    });
  },
  unbind(el: HTMLElement) {
    $(el).tooltip("dispose");
  },
};
