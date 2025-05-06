import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add meta tags for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'TaskFlow: A team task management system for efficient collaboration. Create, assign, and track tasks in a collaborative workspace.';
document.head.appendChild(metaDescription);

// Add title
const titleTag = document.createElement('title');
titleTag.innerText = 'TaskFlow - Team Task Management';
document.head.appendChild(titleTag);

// Add favicon
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✅</text></svg>';
document.head.appendChild(favicon);

createRoot(document.getElementById("root")!).render(<App />);
