# Sports Mini Platform - Frontend

Frontend application for the Sports/Casino Games Platform built with React.

## Tech Stack

- React 18
- React Router DOM
- Axios for API calls
- CSS3 for styling

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Backend server running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend root directory (optional):
```env
REACT_APP_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Features

- User Authentication (Login/Register)
- Games/Matches List with filtering
- Favorites Management
- Responsive Design
- Protected Routes
- Loading States
- Error Handling

## Project Structure

```
src/
  ├── components/      # Reusable components
  │   ├── GameCard.js
  │   ├── FilterBar.js
  │   ├── Navbar.js
  │   └── ProtectedRoute.js
  ├── context/         # React Context
  │   └── AuthContext.js
  ├── pages/           # Page components
  │   ├── Login.js
  │   ├── Register.js
  │   ├── GamesList.js
  │   └── Favorites.js
  ├── services/        # API services
  │   └── api.js
  ├── App.js           # Main app component
  ├── App.css
  ├── index.js         # Entry point
  └── index.css        # Global styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

