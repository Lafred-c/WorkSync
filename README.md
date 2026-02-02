## Why I Made WorkSync
**The Problem**
In today's fast-paced work environment, teams are scattered across time zones, projects become increasingly complex, and communication often falls through the cracks. I watched teams struggle with a fragmented toolset—task management in one app, project tracking in another, team communication scattered across multiple platforms. This constant context-switching wasn't just inefficient; it was draining productivity and creating silos within teams.
The real issue wasn't that tools didn't exist. It was that they existed separately. Teams had to juggle multiple applications, manage different login credentials, and piece together information from various sources just to get a complete picture of their work. Something had to change.


## The Vision
I wanted to build a unified platform where teams could collaborate seamlessly without the friction of juggling multiple tools. WorkSync was born from the idea that project management, task tracking, and team communication should live together, not apart.


**WorkSync** isn't just another task manager. It's a collaborative workspace—a single source of truth where teams can:
- See the full picture instantly with an interactive dashboard that surfaces what matters most
- Communicate in real-time without leaving the platform or losing context
- Organize projects and tasks with intuitive management features built for modern teams
- Stay secure with robust authentication that respects user privacy
- Make data-driven decisions through visual analytics and performance insights

## Features

- **Secure Authentication**: Robust user authentication system with Login, Registration, and Password Reset utilizing JWT and HttpOnly cookies.
- **Interactive Dashboard**: A centralized hub for viewing project progress, upcoming deadlines, and key metrics at a glance.
- **Project Management**: Create, edit, and organize projects. manage project-specific tasks with ease.
- **Advanced Task Management**:
  - Create, assign, and track tasks.
  - Set priorities, deadlines, and statuses.
  - Filter and organize tasks efficiently.
- **Team Collaboration**:
  - Manage teams and members.
  - **Real-time Chat**: Integrated team chat powered by Socket.io for seamless communication.
- **Modern UI/UX**: Built with **React**, **Tailwind CSS**, and **Framer Motion** for a responsive, accessible, and beautiful user interface. Includes Dark Mode support.
- **Visual Analytics**: Integrated **Chart.js** for visualizing team performance and task distribution.

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API & TanStack Query
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Networking**: Axios / Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Security**: JWT (JSON Web Tokens), bcryptjs, cors

**Why It Matters**
Teams are the backbone of innovation. When team members waste time switching between tools, searching for information, or recommunicating context, we lose that creative spark. WorkSync eliminates those barriers.
By bringing project management, task tracking, and real-time chat into one cohesive platform, WorkSync allows teams to focus on what actually matters—doing great work together.

