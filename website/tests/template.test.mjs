import assert from "node:assert/strict";
import test from "node:test";

import { parse } from "../parser.mjs";
import { evaluate, truthy } from "../render.mjs";

const render = (template, context = {}, templates = {}) =>
  evaluate(parse(template), context, templates);

test("substitutes and escapes variables", () => {
  assert.equal(render("Hi {{ name }}", { name: "Ada" }), "Hi Ada");
  assert.equal(render("{{ html }}", { html: "<b>x</b>" }), "&lt;b&gt;x&lt;/b&gt;");
  assert.equal(render("{{{ html }}}", { html: "<b>x</b>" }), "<b>x</b>");
  assert.equal(render("{{ missing }}", {}), "");
});

test("resolves dotted paths", () => {
  assert.equal(render("{{ a.b.c }}", { a: { b: { c: "deep" } } }), "deep");
});

test("conditionals, including else", () => {
  assert.equal(render("{{#if on}}yes{{else}}no{{/if}}", { on: true }), "yes");
  assert.equal(render("{{#if on}}yes{{else}}no{{/if}}", { on: false }), "no");
  assert.equal(render("{{#if missing}}yes{{/if}}", {}), "");
});

test("else binds to the nearest open if", () => {
  const template = "{{#if a}}A{{else}}{{#if b}}B{{else}}C{{/if}}{{/if}}";
  assert.equal(render(template, { a: true, b: false }), "A");
  assert.equal(render(template, { a: false, b: true }), "B");
  assert.equal(render(template, { a: false, b: false }), "C");
});

test("equality tests against a literal", () => {
  const template = "{{#if kind == 'x'}}yes{{else}}no{{/if}}";
  assert.equal(render(template, { kind: "x" }), "yes");
  assert.equal(render(template, { kind: "y" }), "no");
});

test("loops iterate with this and @index", () => {
  const template = "{{#each items}}{{ @index }}:{{ this.name }};{{/each}}";
  assert.equal(render(template, { items: [{ name: "a" }, { name: "b" }] }), "0:a;1:b;");
});

test("loops nest and keep the outer item in scope", () => {
  const template = "{{#each groups}}[{{ this.label }}{{#each this.items}}{{ this }}{{/each}}]{{/each}}";
  assert.equal(
    render(template, { groups: [{ label: "g", items: ["a", "b"] }, { label: "h", items: [] }] }),
    "[gab][h]",
  );
});

test("a missing loop renders nothing", () => {
  assert.equal(render("{{#each nope}}x{{/each}}", {}), "");
});

test("includes render with the same context", () => {
  const templates = { card: "<b>{{ this.title }}</b>" };
  assert.equal(
    evaluate(parse("{{#each items}}{{> card }}{{/each}}"), { items: [{ title: "One" }] }, templates),
    "<b>One</b>",
  );
});

test("unknown partial is a build error, not silent empty output", () => {
  assert.throws(() => render("{{> nope}}", {}, {}), /unknown partial/);
});

test("truthiness treats empty arrays as falsy", () => {
  assert.equal(truthy("items", { items: [] }), false);
  assert.equal(truthy("items", { items: [1] }), true);
});

