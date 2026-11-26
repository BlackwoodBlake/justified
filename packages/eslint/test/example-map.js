/**
 * example-map.js: finds the Do and Don't examples in a rule's example file,
 * and the lines each one renders. See examples.test.js.
 */
import tsParser from "@typescript-eslint/parser";

/** Every child node, for a plain walk of the parser's tree. */
function* children(node) {
  for (const key of Object.keys(node)) {
    if (key === "parent" || key === "loc" || key === "range") continue;
    const v = node[key];
    if (Array.isArray(v)) {
      for (const c of v) if (c && typeof c.type === "string") yield c;
    } else if (v && typeof v.type === "string") yield v;
  }
}

function* nodes(node) {
  yield node;
  for (const c of children(node)) yield* nodes(c);
}

/**
 * The examples in a rule file, each with the line ranges its Demo reaches.
 * @returns {{ kind: "do" | "dont", title: string, notLinted: string | undefined, ranges: [number, number][] }[]}
 */
export function examplesOf(code) {
  const ast = tsParser.parse(code, { ecmaFeatures: { jsx: true }, loc: true, range: true });
  /** Top-level declarations by name, with their node. */
  const declared = new Map();
  for (let statement of ast.body) {
    if (statement.type === "ExportNamedDeclaration" && statement.declaration) statement = statement.declaration;
    if (statement.type === "FunctionDeclaration" && statement.id) declared.set(statement.id.name, statement);
    if (statement.type === "VariableDeclaration")
      for (const d of statement.declarations) if (d.id.type === "Identifier" && d.init) declared.set(d.id.name, d);
  }
  /** The declarations a node uses, by name, as JSX or as a value. */
  const uses = (node) => {
    const names = new Set();
    for (const n of nodes(node)) {
      if (n.type === "JSXIdentifier" || n.type === "Identifier") if (declared.has(n.name)) names.add(n.name);
    }
    return names;
  };
  const reach = (start) => {
    const ranges = [[start.loc.start.line, start.loc.end.line]];
    const seen = new Set();
    const queue = [...uses(start)];
    while (queue.length) {
      const name = queue.shift();
      if (seen.has(name)) continue;
      seen.add(name);
      const d = declared.get(name);
      // The examples list holds every Demo; it is not code a Demo renders.
      if (lists.has(d)) continue;
      ranges.push([d.loc.start.line, d.loc.end.line]);
      queue.push(...uses(d));
    }
    return ranges;
  };
  const found = [];
  for (const n of nodes(ast)) {
    if (n.type !== "ObjectExpression") continue;
    const prop = (k) => n.properties.find((p) => p.type === "Property" && p.key.type === "Identifier" && p.key.name === k);
    const kind = prop("kind")?.value;
    const demo = prop("Demo")?.value;
    if (!demo || kind?.type !== "Literal" || (kind.value !== "do" && kind.value !== "dont")) continue;
    const title = prop("title")?.value?.value ?? "";
    const reason = prop("notLinted")?.value;
    const notLinted = reason?.type === "Literal" && typeof reason.value === "string" ? reason.value : undefined;
    found.push({ kind: kind.value, title, notLinted, demo });
  }
  const lists = new Set([...declared.values()].filter((d) => found.some((f) => f.demo.range[0] >= d.range[0] && f.demo.range[1] <= d.range[1])));
  return found.map(({ kind, title, notLinted, demo }) => ({ kind, title, notLinted, ranges: reach(demo) }));
}

