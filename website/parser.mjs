/**
 * Parsing: turns a template string into a node tree.
 *
 * Block tags are recognised as *tokens* rather than by position, so a closing
 * tag is found wherever it appears in the stream — including after text.
 */

/* {{#if x}} {{#each xs}} {{else}} {{#else}} {{/if}} {{/each}} {{> part}} {{path}} {{{raw}}} */
const TAG_RE = /\{\{\{([^}]*)\}\}\}|\{\{\s*([^}]*?)\s*\}\}/;

const isCloseTag = (inner) => inner === "/if" || inner === "/each";

/**
 * Parse one block, stopping at the closing tag that matches `closer`.
 *
 * Returns the node list, the `else` branch when present, and whatever text
 * follows the block.
 */
function parseBlock(source, closer) {
  const nodes = [];
  let otherwise = null;
  let rest = source;

  while (rest.length) {
    const tag = rest.match(TAG_RE);
    if (!tag) {
      nodes.push({ type: "text", value: rest });
      return { nodes, otherwise, rest: "" };
    }
    if (tag.index > 0) nodes.push({ type: "text", value: rest.slice(0, tag.index) });
    rest = rest.slice(tag.index + tag[0].length);

    const rawContent = tag[1];
    const inner = tag[2];

    if (isCloseTag(inner)) {
      if (inner.slice(1) !== closer) {
        throw new Error(`mismatched tag: {{${inner}}} closes a different block`);
      }
      return { nodes, otherwise, rest };
    }

    if (closer === "if" && (inner === "else" || inner === "#else")) {
      // Everything collected so far is the truthy branch.
      const branch = parseBlock(rest, "if");
      return { nodes, otherwise: branch.nodes, rest: branch.rest };
    }

    if (rawContent !== undefined) {
      nodes.push({ type: "raw", expr: rawContent.trim() });
    } else if (inner.startsWith("#if ")) {
      const body = parseBlock(rest, "if");
      nodes.push({
        type: "if",
        expr: inner.slice(4).trim(),
        body: body.nodes,
        otherwise: body.otherwise,
      });
      rest = body.rest;
    } else if (inner.startsWith("#each ")) {
      const body = parseBlock(rest, "each");
      nodes.push({ type: "each", expr: inner.slice(6).trim(), body: body.nodes });
      rest = body.rest;
    } else if (inner.startsWith("> ")) {
      nodes.push({ type: "include", value: inner.slice(2).trim() });
    } else if (inner.startsWith("#")) {
      throw new Error(`unexpected template tag: {{${inner}}}`);
    } else {
      nodes.push({ type: "var", expr: inner });
    }
  }

  if (closer !== "__document__") {
    throw new Error(`unclosed block: missing {{/${closer}}}`);
  }
  return { nodes, otherwise, rest };
}

/** Parse a whole template. */
export function parse(source) {
  return parseBlock(source, "__document__").nodes;
}