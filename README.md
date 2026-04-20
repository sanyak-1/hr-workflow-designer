# HR Workflow Designer ⚙️

A full-stack drag-and-drop workflow builder designed for HR teams to map out internal processes (like employee onboarding and leave requests). 

## 🚀 How to Run the Project

You will need two terminal windows to run the frontend and the mock backend simultaneously.

1. Start the Mock Database (Backend)
Open a terminal in the root folder and run the JSON server to handle data persistence:
`npx json-server --watch db.json --port 3001`

2. Start the Frontend Application
Open a second terminal, navigate into the frontend folder, install dependencies, and start the Vite server:
`cd frontend`
`npm install`
`npm run dev`

Open `http://localhost:5173` in your browser.

## 🏗️ Architecture & Tech Stack

Frontend Framework: React 18 with TypeScript and Vite for rapid development and strict type safety.
Canvas Engine:`@xyflow/react` (React Flow) for rendering the node-based interactive UI.
State Management: `Zustand`. Chosen over React Context to prevent unnecessary re-renders when dragging nodes across the canvas, ensuring high performance.
Styling:Tailwind CSS for a clean, utility-first UI implementation.
Mock Backend:`json-server` acting as a REST API to test real-world async data fetching and saving.

## 🧠 Design Decisions & Assumptions

1.Component Decoupling: The canvas, sidebar, and configuration panel are completely decoupled. They communicate exclusively through the Zustand store. This allows the layout to scale without prop-drilling.
2.Strict Validation Engine: To prevent infinite loops and logical errors in HR workflows, I built a custom validation engine. It prevents Start nodes from receiving incoming edges, End nodes from having outgoing edges, and stops nodes from connecting to themselves.
3.Data Mutability:I assumed that when a user clicks "Save Draft," it should overwrite the current workflow canvas (PUT request) rather than generating an infinite stack of new workflows (POST requests) to keep the database optimized.

## ✅ Completed Features (Core + Bonus)

Core Requirements Met:
1.5 custom interactive node types (Start, Task, Automated, Approval, End).
2.Global state management (Zustand) wired to a slide-out configuration panel.
3.Full CRUD capabilities on the canvas (Add, Edit, Delete, Connect).
4.Backend persistence (Save/Load to `db.json`).
4.Drag-and-drop nodes from a dedicated sidebar.
5.Auto-validation of edges with visual error feedback.

Bonus Features Implemented:
1.Auto-Layout: Integrated the `dagre` math library to instantly organize messy canvas nodes into a perfect top-to-bottom tree structure.
2.Download as Image: Integrated `html-to-image` to allow HR users to export high-resolution PNGs of their workflows for presentations.
3.Zoom/Mini-map Controls: Fully functional viewport controls.
4.Node Templates: Dragged nodes automatically populate with sensible default data.

## 🔮 What I Would Add With More Time

If I had an additional week to scale this project for a production environment, I would implement:
1. Backend Persistence (MERN Migration): Connect the application to a real database (MongoDB) with a Node/Express backend to save user sessions and workflow templates permanently.
2. Graph Cycle Detection: Implement an algorithm (like Depth-First Search) to detect infinite loops or invalid cyclic dependencies.
3. Undo/Redo Stack: Utilize a state history middleware within Zustand to create past/future state arrays, allowing users to revert accidental node deletions.
4. AI Prompt-to-Workflow: Integrate a Generative AI endpoint where users could type a prompt and the system would automatically generate the JSON structure and map it on the canvas.
5. Role-Based Access Control: Implement a "View Only" mode that disables the React Flow `nodesDraggable` prop for standard employees, while keeping edit access for HR Admins.

---
Author: Sanya Kulshrestha
