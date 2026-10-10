/**
 * Rendering: evaluates a parsed template against a context.
 *
 * Kept separate from the parser so the syntax rules and the output rules can be
 * tested — and read — independently.
 */

import { parse } from "./parser.mjs";

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function lookup(context, expr) {
  return expr
    .trim()
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), context);
}

/** Truthiness, with an optional equality test against a quoted literal. */
export function truthy(expr, context) {
  const equality = expr.match(/^([\w.@]+)\s*(==|!=)\s*['"](.*)['"]$/);
  if (equality) {
    const [, path, operator, literal] = equality;
    const equal = String(lookup(context, path) ?? "") === literal;
    return operator === "==" ? equal : !equal;
  }
  const value = lookup(context, expr.trim());
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function evaluate(nodes, context, templates, depth = 0) {
  if (depth > 25) throw new Error("template recursion too deep");
  let out = "";
  for (const node of nodes) {
    switch (node.type) {
      case "text":
        out += node.value;
        break;
      case "var":
        out += escapeHtml(lookup(context, node.expr));
        break;
      case "raw":
        out += String(lookup(context, node.expr) ?? "");
        break;
      case "include": {
        const partial = templates[node.value];
        if (partial === undefined) throw new Error(`unknown partial: ${node.value}`);
        out += evaluate(parse(partial), context, templates, depth + 1);
        break;
      }
      case "if":
        out += evaluate(
          truthy(node.expr, context) ? node.body : (node.otherwise ?? []),
          context,
          templates,
          depth + 1,
        );
        break;
      case "each": {
        const list = lookup(context, node.expr);
        if (!Array.isArray(list)) break;
        list.forEach((item, index) => {
          out += evaluate(node.body, { ...context, this: item, "@index": index }, templates, depth + 1);
        });
        break;
      }
      default:
        break;
    }
  }
  return out;
}

/** Convenience: parse and render in one step. */
export function render(source, context, templates = {}) {
  return evaluate(parse(source), context, templates);
}