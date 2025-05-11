
# SmartCycle ♻️💰

<div align="center">
  <img src="https://raw.githubusercontent.com/your-username/smartcycle/main/public/smartcycle-logo-large.png" alt="SmartCycle Logo" width="150" />
  <p><strong>Turn Your Trash into Treasure!</strong></p>
  <p>SmartCycle is a modern web application designed to make recycling fun, easy, and rewarding. Locate smart vending machines, check material prices, manage your earnings, participate in challenges, and chat with our AI assistant.</p>
</div>

---

## ✨ Key Features

*   **Machine Locator:** Interactive map to find nearby SmartCycle vending machines using Mapbox.
*   **Material Pricing:** View real-time (mocked) prices for various recyclable materials.
*   **Digital Wallet:** Track your earnings, loyalty points, and redeem perks/vouchers.
*   **QR Code Scanner:** Generate a unique QR code for user identification at vending machines.
*   **Weekly Challenges:** Participate in gamified recycling challenges to earn points and rewards.
*   **AI Chatbot:** A friendly, multilingual AI assistant (powered by Genkit and Google Gemini) to answer questions about recycling, SmartCycle features, and access app data like machine locations and material prices. Supports voice input.
*   **User Profile Management:** View and edit your profile information, including avatar and password.
*   **Authentication:** Secure login and signup functionality.
*   **Responsive Design:** Mobile-first design, accessible on various devices.
*   **Light & Dark Mode:** Theme support for user preference.

---

## 🚀 Tech Stack

*   **Frontend:** Next.js (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, ShadCN UI components
*   **AI/LLM:** Genkit, Google Gemini (via `@genkit-ai/googleai`)
*   **Mapping:** Mapbox GL JS
*   **State Management:** React Hooks (useState, useEffect, useContext)
*   **Form Handling:** React Hook Form, Zod (for validation)
*   **Icons:** Lucide React
*   **Linting/Formatting:** ESLint, Prettier (implied by Next.js standards)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## ⚙️ Getting Started

Follow these steps to get the SmartCycle application up and running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/kaixin1112/ModelMinds.git
cd ModelMinds
```
*(Replace `your-username/smartcycle.git` with the actual repository URL if different)*

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project and add the following environment variables:

```env
# Required for Mapbox GL JS
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Required for Genkit with Google AI (Gemini)
GOOGLE_API_KEY=your_google_ai_api_key_here
```

*   **`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`**: Get your free token from [Mapbox](https://www.mapbox.com/).
*   **`GOOGLE_API_KEY`**: Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey) to use Gemini models with Genkit.

**Important:** Without these keys, the map functionality and AI chatbot will not work correctly.

### 4. (Optional) Patch Packages
If `patch-package` is used in the project (check `package.json` scripts), run:
```bash
npm run postinstall
# or
yarn postinstall
```
This applies any patches defined in the `patches/` directory.

---

## ▶️ Running the Application

The application consists of two main parts: the Next.js frontend and the Genkit AI flows.

### 1. Start the Next.js Development Server

This server handles the frontend application.

```bash
npm run dev
# or
yarn dev
```
The application will typically be available at `http://localhost:9002`.

### 2. Start the Genkit Development Server

This server runs the AI flows (e.g., for the chatbot). It needs to run concurrently with the Next.js server.

Open a **new terminal window/tab** and run:

```bash
npm run genkit:dev
# or for auto-reloading on changes to AI flows:
npm run genkit:watch
```
The Genkit development UI will typically be available at `http://localhost:4000` (or as specified in the Genkit output). The Next.js app communicates with these flows.

---

## 📂 Project Structure

A brief overview of the key directories:

```
smartcycle/
├── .env                # Environment variables (create this file)
├── components.json     # ShadCN UI configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies and scripts
├── public/             # Static assets
├── src/
│   ├── ai/             # Genkit AI flows and configuration
│   │   ├── dev.ts      # Genkit development server entry point
│   │   ├── flows/      # AI flow definitions (e.g., chatbot, translation)
│   │   └── genkit.ts   # Genkit initialization
│   ├── app/            # Next.js App Router (pages, layouts, API routes)
│   │   ├── (main)/     # Main application authenticated routes
│   │   │   ├── layout.tsx
│   │   │   └── [feature]/page.tsx # Feature pages (challenges, wallet, etc.)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── globals.css # Global styles and Tailwind CSS theme
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Landing page
│   ├── components/     # Reusable UI components
│   │   ├── icons/      # Custom SVG icons
│   │   ├── ui/         # ShadCN UI generated components
│   │   └── InteractiveMap.tsx # Mapbox map component
│   │   └── MaterialIcon.tsx   # Icon component for material types
│   ├── hooks/          # Custom React hooks (e.g., useToast, useMobile)
│   ├── lib/            # Utility functions (e.g., cn for Tailwind)
│   ├── models/         # TypeScript interfaces/types for data structures
│   └── services/       # Mock data services (e.g., challenges, vending machines)
└── tsconfig.json       # TypeScript configuration
```

---

## 📜 Available Scripts

In the `package.json` file, you'll find several scripts:

*   `npm run dev`: Starts the Next.js development server (with Turbopack).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with watch mode.
*   `npm run build`: Builds the Next.js application for production.
*   `npm run start`: Starts the Next.js production server.
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run typecheck`: Runs TypeScript compiler to check for type errors.

---

## 🤖 GenAI (Genkit)

This project utilizes Genkit to power its AI features, primarily the chatbot.

*   **Configuration:** Genkit is initialized in `src/ai/genkit.ts`.
*   **Flows:** AI logic is encapsulated in "flows" located in `src/ai/flows/`. These flows define prompts, tools, and interactions with LLMs (like Google Gemini).
    *   `chatbot-response-flow.ts`: Handles generating responses for the chatbot, including using tools to access app data.
    *   `translate-query-flow.ts`: (Currently unused but available) Can translate user queries to English before processing.
*   **Tools:** Genkit tools allow the LLM to interact with external services or data. For example, the chatbot can use tools to fetch smart vending machine locations, material prices, and active challenges.

Ensure your `GOOGLE_API_KEY` is correctly set in `.env` for Genkit to function.

---

## 🗺️ Map Integration (Mapbox)

The machine locator feature uses Mapbox GL JS.

*   **Configuration:** The Mapbox access token is provided via the `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` environment variable.
*   **Component:** The `src/components/InteractiveMap.tsx` component handles map rendering and interactions.
*   **Data:** Vending machine location data is currently mocked in `src/services/smart-vending-machine.ts`.

---

## Demo Credentials

For demonstration purposes, you can use the following credentials to log in:

*   **Email:** `user@example.com`
*   **Password:** `password123`

---

Enjoy using SmartCycle! If you encounter any issues or have suggestions, please feel free to open an issue on the GitHub repository.
