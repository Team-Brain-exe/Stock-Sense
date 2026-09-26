import { createElement } from "react";

export function Button({ children, type = "button", ...props }) {
  return createElement("button", { type, ...props }, children);
}

export function Input(props) {
  return createElement("input", props);
}

export function Select({ children, ...props }) {
  return createElement("select", props, children);
}

export function Text({ as = "p", children, ...props }) {
  return createElement(as, props, children);
}
