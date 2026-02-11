# Event schedule builder

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/technical-5785s-projects/v0-event-schedule-builder)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dXJNkGX1IN9)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/technical-5785s-projects/v0-event-schedule-builder](https://vercel.com/technical-5785s-projects/v0-event-schedule-builder)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/dXJNkGX1IN9](https://v0.app/chat/dXJNkGX1IN9)**

## Walking routes on the map

Routes between scheduled events use **Mapbox Directions API** with the **walking** profile so paths follow sidewalks and pedestrian-appropriate routes instead of driving roads.

To enable walking routes:

1. Create a [Mapbox account](https://account.mapbox.com/) and copy your **default public access token** (or create a new one).
2. Add it to your environment:
   - **Local:** create `.env.local` in the project root and add:
     ```bash
     NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
     ```
   - **Vercel:** in your project settings, add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` as an environment variable.

If the token is not set, the map falls back to the default routing provider (driving-style routes).

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository