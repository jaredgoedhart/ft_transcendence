/**
 * frontend/src/index.tsx
 *
 * This file is where the React app is rendered and started.
 * - React takes control of the loaded "root" div from index.html and renders the app.
 * - <React.StrictMode>: Helps find issues in development (unsafe methods, deprecated APIs).
 * - <AuthProvider>: Provides authentication info (e.g., login state) to the whole app.
 */


import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import AuthProvider from "./context/AuthenticationContext";


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);


root.render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>
);
