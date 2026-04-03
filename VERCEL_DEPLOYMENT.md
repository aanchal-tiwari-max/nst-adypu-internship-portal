# Vercel Deployment Guide

This project can be easily deployed to Vercel. Since it contains both a Node.js Express backend and a static frontend, we will use a `vercel.json` file to configure Vercel to serve the API via Serverless Functions and the frontend as static files.

## Step 1: Export the Express App 
Vercel's serverless environment requires the Express app to be exported so it can hook into it. 
Open `backend/server.js` and add this single line at the very bottom of the file:

```javascript
module.exports = app;
```

## Step 2: Create a `vercel.json` 
In the **root** of your project (same level as the `frontend` and `backend` folders), create a file named `vercel.json` and paste the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/public/**",
      "use": "@vercel/static"
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/backend/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/frontend/public/$1"
    }
  ]
}
```

## Step 3: Deploy using Vercel CLI (Recommended)

1. **Install Vercel CLI**: If you haven't already, install it globally via npm:
   ```bash
   npm i -g vercel
   ```
2. **Login to Vercel**: 
   ```bash
   vercel login
   ```
3. **Deploy from the root directory**:
   Ensure your terminal is in the project's root folder (`/nst-adypu-internship-portal`) and simply run:
   ```bash
   vercel
   ```
4. Follow the interactive prompts (default settings are fine). Vercel will automatically read `vercel.json`, build the environment, and give you a live production URL!

## Step 3 (Alternative): Deploy via GitHub

1. Push your code to a GitHub repository.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Leave the Framework Preset as default ("Other").
5. Ensure the Root Directory is set to the project root (where `vercel.json` is located).
6. Click **Deploy**. Vercel will automatically read `vercel.json` and configure both the frontend and backend.
