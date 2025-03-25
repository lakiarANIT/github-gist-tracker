# Github Gist Tracker

# GitHub Gist Tracker (GGT)

## Overview
GitHub Gist Tracker (GGT) is an advanced tool designed to enhance the way developers manage, search, and organize their GitHub Gists. Unlike the default GitHub Gist system, GGT offers a structured and feature-rich experience for handling gists more efficiently. 

## Key Features
- **GitHub Login Integration**: Since all gists are managed by GitHub, users must log in with their GitHub accounts. This ensures secure access to their gists and enables seamless CRUD operations.
- **Advanced Gist Search & Filtering**: Users can quickly find gists based on keywords, programming languages, and other attributes.
- **Organized Gist Viewing**: Gists are displayed in a more structured layout, making it easier to browse and manage code snippets.
- **Gist Grouping**: Unlike GitHub’s default gist system, GGT allows users to create and manage groups of related gists, which are stored in MongoDB.
- **CRUD Operations on Gists**: Users can create, update, and delete their gists directly within GGT.
- **Star Feature**: Users can star their favorite gists for quick access.
- **Gist Creator Location**: View the geographical location of a gist’s creator, adding a social and collaborative aspect to the platform.
- **User Profiles**: Users must register via `/profile` to fully utilize the system.
- **Dark & Light Mode**: The site supports both dark and light themes for a comfortable user experience.

GGT enhances GitHub Gist management with improved organization, searchability, and additional features that make working with gists more efficient and intuitive.


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

Here is the folder structure of this project:

```
D:.
|   .gitignore
|   eslint.config.mjs
|   file_structure.txt
|   next.config.ts
|   package-lock.json
|   package.json
|   postcss.config.mjs
|   README.md
|   tsconfig.json
|   
+---public
|       file.svg
|       globe.svg
|       next.svg
|       vercel.svg
|       window.svg
|       
\---src
    |   middleware.ts
    |   
    +---app
    |   |   favicon.ico
    |   |   globals.css
    |   |   layout.tsx
    |   |   page.tsx
    |   |   providers.tsx
    |   |   site.webmanifest
    |   |   
    |   +---api
    |   |   +---auth
    |   |   |   \---[...nextauth]
    |   |   |           route.ts
    |   |   +---profile
    |   |   |       route.ts
    |   |   \---register
    |   |           route.ts
    |   +---auth
    |   |   +---login
    |   |   |       page.tsx
    |   |   \---register
    |   |           page.tsx
    |   +---profile
    |       |   page.tsx
    |       \---edit
    |               page.tsx
    +---components
    |   \---ui
    |       |   Body.tsx
    |       |   Footer.tsx
    |       |   LoadingSpinner.tsx
    |       |   Navbar.tsx
    +---context
    |       ThemeContext.tsx
    +---hooks
    |   \---profile
    |           useProfileActions.ts
    +---lib
    |       auth.ts
    |       database.ts
    +---models
    |       User.ts
    +---types
    |       index.ts
    +---utils
            userUtils.ts
```

### Key Directories and Files
- **`app/`**: Contains pages and layout components.
- **`components/`**: Stores reusable UI components.
- **`hooks/`**: Custom React hooks for managing state and data fetching.
- **`lib/`**: Authentication and database connection utilities.
- **`models/`**: Defines data models.
- **`types/`**: TypeScript type definitions.
- **`utils/`**: Utility functions.

## Setting Up Environment Variables

To configure your local environment, create a `.env.local` file in the root directory and add the following variables:

```
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_api_key
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run the deployment command:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project and deploy.

### Deploy to Other Platforms
- **Docker**: Build a Docker image and deploy to a container platform.
- **DigitalOcean**: Use their App Platform for Next.js hosting.
- **AWS**: Deploy using AWS Amplify or Lambda with API Gateway.

# GitHub Gists API Usage in Project

## 1. Using GitHub Gists API via Octokit.js

This project utilizes the GitHub Gists API through the Octokit.js library to perform various operations, including creating, fetching, updating, and deleting gists. 

### Features Implemented:

- **Create a Gist:**
  - Uses `POST /gists` to create a new private or public gist with specified files and content.
- **List Starred Gists:**
  - Uses `GET /gists/starred` to fetch the gists the authenticated user has starred.
- **Get a Specific Gist:**
  - Uses `GET /gists/{gist_id}` to retrieve details of a specific gist.
- **Update a Gist:**
  - Uses `PATCH /gists/{gist_id}` to modify an existing gist.
- **Delete a Gist:**
  - Uses `DELETE /gists/{gist_id}` to remove a gist.
- **Check If a Gist is Starred:**
  - Uses `GET /gists/{gist_id}/star` to determine if the gist is starred.
- **Star a Gist:**
  - Uses `PUT /gists/{gist_id}/star` to mark a gist as starred.
- **Unstar a Gist:**
  - Uses `DELETE /gists/{gist_id}/star` to remove the star from a gist.

These operations are handled using Octokit.js with authentication via a GitHub personal access token.

---
## 2. Custom Gist API Created in the Project
## API: `api/all-gists`

This API endpoint retrieves all GitHub Gists associated with a logged-in user. It first checks user authentication using `next-auth`. If authorized, it connects to the database and fetches the Gist groups linked to the user. The API then gathers unique Gist IDs and retrieves a GitHub token to make authenticated requests to GitHub's API using `Octokit`. For each Gist ID, it fetches the corresponding Gist details, filtering out invalid or deleted Gists. If any Gists are found to be missing, the database is updated accordingly. The final response returns the list of valid Gists, including metadata such as URLs, descriptions, files, timestamps, and ownership details.
## API: `api/auth/[...nextauth]`

This API endpoint handles authentication using `NextAuth.js`. It imports authentication options from `@lib/authOptions` and initializes NextAuth with these settings. The handler is exported for both `GET` and `POST` requests, allowing users to sign in, sign out, and manage authentication sessions. This route is crucial for handling user authentication across the application.
## API: `api/gist-groups/[gist-id]/gists`

This API manages gists within a specific gist group. It requires authentication via `NextAuth` and interacts with a MongoDB database.

- **`POST`**: Adds a given `gistId` to a specified group (`groupId`), ensuring the user owns the group before updating it.
- **`GET`**: Retrieves all gists associated with a given group, returning a list of `gistIds`.

The API ensures secure access by verifying user authentication and ownership before performing any operations.
## API: `api/gist-groups/add`

This API endpoint allows authenticated users to create a new gist group.

- **`POST`**: Creates a new gist group with a provided `name`. The user must be authenticated, and the group name must be a non-empty string. The newly created group is saved to the database with an empty list of `gistIds`.

The API ensures secure access and validation before storing data in MongoDB.
## API: `api/gist-groups/delete/[groupGistId]`

This API endpoint allows authenticated users to delete a gist group.  

- **`DELETE`**: Removes the specified gist group if it belongs to the authenticated user. If the user has a GitHub token, associated gists are also deleted from GitHub.  

The API ensures secure access and proper validation before deletion.  
## API: `api/gist-groups/edit/[groupGistId]`

This API endpoint allows authenticated users to edit a gist group.  

- **`PATCH`**: Updates the name of a specified gist group if it belongs to the authenticated user. The new name must be a non-empty string.  

The API ensures secure access and validation before updating the group.  

## API: `api/gist-groups`

This API endpoint allows authenticated users to manage gist groups.  

- **`POST`**: Creates a new gist group with a provided `name`. The user must be authenticated, and the group name must be a non-empty string.  
- **`GET`**: Retrieves all gist groups belonging to the authenticated user, along with their associated GitHub gists.  

The API ensures secure access, validation, and integration with GitHub.  

## API: `api/github-token`

This API endpoint retrieves the authenticated user's GitHub token.  

- **`GET`**: Returns the user's GitHub token if they are authenticated. If the user is not logged in or the token is missing, an error response is returned.  

The API ensures secure session handling before providing the token.  

## API: `api/profile/delete`

This API deletes the user's profile along with associated gist groups and gists.

- **`DELETE`**: Deletes the user account, all gist groups, and GitHub gists.
  - **Process**:
    1. Fetches the user and their gist groups.
    2. Deletes associated gists from GitHub (if the user has a GitHub token).
    3. Deletes the user's gist groups.
    4. Deletes the user account.
  - **Response**: `{ "message": "Account and gists deleted successfully" }`
  - **Errors**: Unauthorized (401), User not found (404), Internal Server Error (500)

Ensures complete cleanup of user data.
## API: `api/profile/updatelocation`

This API updates the authenticated user's location.  

- **`PUT`**: Updates the user's latitude and longitude if they are authenticated.  
- Requires a JSON body with `lat` and `lng` as numbers.  
- Returns the updated location on success or an error if unauthorized or invalid data is provided.  
- Ensures database connection and validation before updating the user's record.  

## API: `api/profile`

This API updates the authenticated user's profile.  

- **`PUT`**: Allows users to update their name, email, bio, password, and avatar.  
- Supports both file uploads and direct avatar URLs.  
- Ensures authentication and securely hashes passwords before updating.  
- Saves uploaded avatars to the `/uploads/` directory and updates the profile accordingly.  
- Returns the updated user details or an error if unauthorized or invalid data is provided.  

## API: `api/public-gist-groups`

This API fetches and returns public Gist groups along with their associated Gists.

- **`GET`**: Retrieves all public Gist groups and fetches public Gists using individual GitHub tokens.  
- Caches results for 5 minutes to optimize performance.  
- Ensures only authenticated users' tokens are used for GitHub API requests.  
- Filters and returns only public Gists while preserving ownership details.  
- Handles database connections, errors, and caching efficiently.  

## API: `api/users`

This API retrieves user details based on their login.

- **`GET`**: Fetches a user by their `login` query parameter.  
- Returns the user's login and location if found.  
- Requires a `login` parameter; responds with `400` if missing.  
- Returns `404` if the user does not exist.  
- Handles database connection and errors gracefully.  


