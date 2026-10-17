# Quick GPT

Quick GPT is a full-stack AI SaaS application that lets users chat with an AI assistant through a credit-based usage model, with subscription payments and role-based access control built in.

**Live app:** https://quick-gpt-blush.vercel.app
**Repository:** https://github.com/ArpitChouksey99/Quick-gpt

## Features

- 💬 **AI Chat** — Real-time, streaming AI responses powered by the OpenAI API
- 🖼️ **AI Image Generation** — Generate images via the ImageKit API
- ☁️ **Image Storage** — Generated/uploaded images are stored and served through Cloudinary
- 💳 **Credit Economy** — Usage is metered through a credit system, so users consume credits per chat/generation/image
- 🧾 **Stripe Payments** — Subscription/credit top-up billing handled via Stripe integration
- 🔐 **JWT Authentication & RBAC** — Secure login with JSON Web Tokens and role-based access control (RBAC) for user/admin permissions
- ⚡ **Fast API responses** — Optimized backend for sub-200ms average API response times

## Tech Stack

| Layer | Details |
|---|---|
| **Client** | `/client` — Frontend application |
| **Server** | `/server` — Backend API, authentication, credit & payment logic |
| **AI (chat)** | OpenAI API (streaming completions) |
| **AI (image)** | ImageKit API (image generation) |
| **Image storage** | Cloudinary (image hosting/CDN delivery) |
| **Payments** | Stripe |
| **Auth** | JWT-based authentication with role-based access control |

> This repo is organized as a monorepo with separate `client` and `server` directories — see each folder for its own setup details/scripts.

## Project Structure

```
Quick-gpt/
├── client/      # Frontend application
├── server/      # Backend API server
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- An OpenAI API key
- An ImageKit account/API key (for image generation)
- A Cloudinary account (for image storage)
- A Stripe account (for payment/credit features)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ArpitChouksey99/Quick-gpt.git
   cd Quick-gpt
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies
   ```bash
   cd ../client
   npm install
   ```

4. Configure environment variables

   Create a `.env` file in the `server` directory with the values your setup needs, for example:
   ```env
   PORT=5000
   MONGODB_URI=your_database_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

5. Run the app
   ```bash
   # From /server
   npm start

   # From /client (in a separate terminal)
   npm run dev
   ```

## Usage

1. Sign up / log in to your account.
2. Start a chat session with the AI assistant — responses stream in real time.
3. Generate images from a prompt via the ImageKit-powered image tool; generated images are uploaded to and served from Cloudinary.
4. Each chat/image generation consumes credits from your account balance.
5. Top up credits / manage your subscription via Stripe checkout.

## Metrics

- 30+ users
- 200+ chat sessions
- Sub-200ms average API response time

## Author

**Arpit Chouksey**
- GitHub: [@ArpitChouksey99](https://github.com/ArpitChouksey99)
- Portfolio: [port-ten-pearl.vercel.app](https://port-ten-pearl.vercel.app)
- LinkedIn: [Arpit Chouksey](https://linkedin.com/in/arpit-chouksey-9647a5220)

