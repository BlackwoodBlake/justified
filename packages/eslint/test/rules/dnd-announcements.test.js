import rule from "../../rules/dnd-announcements.js";
import { run } from "../helpers.js";

const imports = `
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
`;

/** A sortable list as dnd-kit's docs write it, with the given sensors line and DndContext props. */
const list = (sensors, props) => `${imports}
export function ReadingList({ books, onMove }) {
  ${sensors}
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onMove} ${props}>
      <SortableContext items={books} strategy={verticalListSortingStrategy}>
        {books.map((b) => <Book key={b.id} book={b} />)}
      </SortableContext>
    </DndContext>
  );
}`;

const keyboard = `const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );`;

const announcements = `{
  onDragStart({ active }) { return \`Picked up \${label(active)}, position \${pos(active)} of \${total}\`; },
  onDragOver({ active, over }) { return over ? \`\${label(active)}, position \${pos(over)} of \${total}\` : \`\${label(active)} is no longer over the list\`; },
  onDragEnd({ active, over }) { return over ? \`Dropped \${label(active)} at position \${pos(over)} of \${total}\` : \`Dropped \${label(active)}\`; },
  onDragCancel({ active }) { return \`Move cancelled. \${label(active)} is back at position \${pos(active)} of \${total}\`; },
}`;

run("dnd-announcements", rule, {
  valid: [
    // All four announcements, written inline.
    list(keyboard, `sensors={sensors} accessibility={{ announcements: ${announcements} }}`),
    // All four in a const, with screen reader instructions next to them, as dnd-kit's docs do.
    `${list(keyboard, `sensors={sensors} accessibility={{ announcements, screenReaderInstructions }}`)}
    const announcements = ${announcements};
    const screenReaderInstructions = { draggable: "Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel." };`,
    // Pointer only: KBD-001 asks for the keyboard route, not this guideline.
    list(`const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));`, `sensors={sensors}`),
    // Sensors or announcements from elsewhere are not known for certain.
    list(`const sensors = useBoardSensors();`, `sensors={sensors}`),
    list("", `sensors={props.sensors}`),
    list(keyboard, `sensors={sensors} accessibility={accessibility}`),
    list(keyboard, `sensors={sensors} accessibility={{ announcements: makeAnnouncements(t) }}`),
    list(keyboard, `sensors={sensors} accessibility={{ ...shared }}`),
    list(keyboard, `sensors={sensors} accessibility={{ announcements: { ...base, onDragStart } }}`),
    // Spread props may carry the accessibility prop.
    list(keyboard, `sensors={sensors} {...dndProps}`),
    // A DndContext that is not dnd-kit's: a project's own wrapper may add the messages.
    `import { DndContext } from "@/components/dnd";
    export const Board = () => <DndContext><Column /></DndContext>;`,
    // Ids in the text are not judged: the id may be the visible label.
    list(
      keyboard,
      `sensors={sensors} accessibility={{ announcements: {
      onDragStart: ({ active }) => \`Picked up \${active.id}\`,
      onDragOver: ({ active, over }) => \`\${active.id} is over \${over?.id}\`,
      onDragEnd: ({ active, over }) => \`Dropped \${active.id} on \${over?.id}\`,
      onDragCancel: ({ active }) => \`Move cancelled, \${active.id} is back\`,
    } }}`,
    ),
    // aria-grabbed next to words announced through a live region.
    `export function Row({ grabbed, label }) {
      return (<>
        <li aria-grabbed={grabbed}>{label}</li>
        <div aria-live="assertive" className="sr-only">{grabbed ? \`Picked up \${label}\` : ""}</div>
      </>);
    }`,
    `export const Row = ({ grabbed }) => <><li aria-grabbed={grabbed}>Item</li><p role="status">{message}</p></>;`,
    // aria-grabbed in a file whose DndContext announces every step.
    `${list(keyboard, `sensors={sensors} accessibility={{ announcements }}`)}
    const announcements = ${announcements};
    const Book = ({ book, dragging }) => <li aria-grabbed={dragging}>{book.title}</li>;`,
  ],
  invalid: [
    {
      // The Don't: KeyboardSensor added, default messages left.
      code: list(keyboard, `sensors={sensors}`),
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      // No sensors at all: the defaults include the keyboard.
      code: list("", ""),
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      // Sensors built inline, and from separate useSensor calls.
      code: list("", `sensors={useSensors(useSensor(KeyboardSensor))}`),
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      code: list(
        `const pointer = useSensor(PointerSensor);
  const keys = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(pointer, keys);`,
        `sensors={sensors}`,
      ),
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      // Instructions only: the moves are still read out by id.
      code: list(
        keyboard,
        `sensors={sensors} accessibility={{ screenReaderInstructions: { draggable: "Press Space to pick up." } }}`,
      ),
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      code: list(
        keyboard,
        `sensors={sensors} accessibility={{ announcements: {
        onDragStart: ({ active }) => \`Picked up \${label(active)}\`,
        onDragEnd: ({ active }) => \`Dropped \${label(active)}\`,
      } }}`,
      ),
      errors: [{ messageId: "missingSteps", data: { missing: "onDragOver, onDragCancel" } }],
    },
    {
      code: `${list(keyboard, `sensors={sensors} accessibility={{ announcements }}`)}
      const announcements = { onDragStart, onDragOver, onDragEnd };`,
      errors: [{ messageId: "missingSteps", data: { missing: "onDragCancel" } }],
    },
    {
      // A namespace import and an alias.
      code: `import * as Dnd from "@dnd-kit/core";
      export const Board = ({ children }) => <Dnd.DndContext onDragEnd={move}>{children}</Dnd.DndContext>;`,
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      code: `import { DndContext as Drag, KeyboardSensor as Keys, useSensor as one, useSensors as all } from "@dnd-kit/core";
      export function Board() { const s = all(one(Keys)); return <Drag sensors={s}><Column /></Drag>; }`,
      errors: [{ messageId: "noAnnouncements" }],
    },
    {
      code: `export function Row({ grabbed, label }) {
        return <li aria-grabbed={grabbed ? "true" : "false"} aria-dropeffect="move">{label}</li>;
      }`,
      errors: [
        { messageId: "deprecatedAria", data: { name: "aria-grabbed" } },
        { messageId: "deprecatedAria", data: { name: "aria-dropeffect" } },
      ],
    },
    {
      // A DndContext that reads ids does not count as words announced.
      code: `${list(keyboard, `sensors={sensors}`)}
      const Book = ({ book, dragging }) => <li aria-grabbed={dragging}>{book.title}</li>;`,
      errors: [{ messageId: "noAnnouncements" }, { messageId: "deprecatedAria" }],
    },
  ],
});
