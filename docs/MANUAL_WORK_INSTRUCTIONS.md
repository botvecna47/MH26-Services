# Manual Work Instructions for StarUML

You requested an `.mdj` file for StarUML 5.0.2.0. I have generated a starter project file (`MH26_Project.mdj`) for you in this directory.

Since StarUML is a GUI tool, you must assume some manual verification to recreate the diagrams perfectly from the Mermaid logic I provided.

## How to use

1.  **Open StarUML 5.0.2.0**.
2.  **Load the Project**: Go to `File` > `Open` and select `docs/MH26_Project.mdj`.
3.  **Create Diagrams**:
    *   Right-click on the "Model" in the sidebar -> Add Diagram -> Select Type (e.g., Class Diagram, ER Diagram).
    *   I have already populated the "Model" with some basic classes/entities in the `.mdj` file for you to drag and drop.

## Diagram Reference (Use `UML_DIAGRAMS_MERMAID.md`)

Open `docs/UML_DIAGRAMS_MERMAID.md` side-by-side.

1.  **ERD**: Create "Entities" for User, Provider, etc. Add columns/attributes as shown in the Mermaid ERD.
2.  **Class Diagram**: Create "Classes" for Controllers and Models. Add operations like `createBooking()`.
3.  **Sequence Diagram**: Create a "Sequence Diagram". Add Lifelines for User, Database, etc. Add messages between them matching arrows like `User->>Frontend`.
4.  **State Chart**: Add "States" (PENDING, CONFIRMED) and "Transitions" (arrows).
5.  **Activity Diagram**: Add "Actions" (Fill Form, Submit) and "Decisions" (Diamonds).
6.  **DFD**: StarUML DFD support varies; you can use the "Data Flow Diagram" type if available, or use a generic Flowchart.

The logical flow for ALL 8 diagrams is strictly defined in the Mermaid file. You just need to draw them.
