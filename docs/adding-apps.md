# Adding New Applications

This guide explains how to add a new application to Pi-Play.

## Overview

Applications in Pi-Play are modular components displayed in the sidebar. Each app consists of:

- **Content Component** - The main UI displayed in the center
- **Background Component** - Background layer displayed behind the content and sidebar
- **Icon** - Displayed in the sidebar app list
- **Registry Entry** - Metadata for routing and display

## Architecture

```
renderer/features/
├── apps/                       # App system
│   ├── components/
│   │   ├── AppIcon.tsx         # Individual app icon
│   │   └── AppList.tsx         # Sidebar app list
│   ├── config/
│   │   ├── appRegistry.ts      # App definitions
│   │   └── route.ts            # Base path config
│   └── routes/
│       └── index.tsx           # Route generation
│
└── appYourApp/                 # Your new app feature
    ├── index.tsx               # Exports components
    └── ...                     # Other app files
```

## Step-by-Step Guide

### 1. Create App Feature Folder

Create a new folder for your app in `src/renderer/features/`:

> Note: Use the prefix `app` for the folder name.

```
src/renderer/features/appMyApp/
├── index.tsx           # Component exports
├── MyComponent.tsx     # Additional components (optional)
└── ...
```

### 2. Create App Components

Create your content and background components in `index.tsx`:

> Note: add size-full class to the root divs to ensure proper sizing.

```tsx
// src/renderer/features/appMyApp/index.tsx

// Background component
export const AppMyAppBackground = () => {
    return (
        <div className='size-full bg-gradient-to-br from-blue-500 to-purple-600'>
            {/* Your background content */}
        </div>
    )
}

// Main content component
export const AppMyAppContent = () => {
    return (
        <div className='size-full'>
            <h1 className='text-2xl font-bold text-white'>My New App</h1>
            {/* Your app content */}
        </div>
    )
}
```

### 3. Add App Icon

Place your app icon image in `src/renderer/assets/`:

```
src/renderer/assets/my-app-icon.png
```

### 4. Register the App

Add your app to the registry in `src/renderer/features/apps/config/appRegistry.ts`:

```tsx
import MyAppIcon from '@renderer/assets/my-app-icon.png'

import { AppMyAppBackground, AppMyAppContent } from '@renderer/features/appMyApp'

const APP_REGISTRY: AppRegistryItem[] = [
    {
        name: 'My New App',
        id: 'my-app', // Unique ID (used in URL path `/apps/{id}`)
        icon: MyAppIcon,
        contentComponent: AppMyAppContent,
        backgroundComponent: AppMyAppBackground,
    },
]

export default APP_REGISTRY
```

## Registry Item Properties

| Property              | Type                  | Description                                        |
| --------------------- | --------------------- | -------------------------------------------------- |
| `name`                | `string`              | Display name shown under the app icon              |
| `id`                  | `string`              | Unique identifier, used in URL path (`/apps/{id}`) |
| `icon`                | `string`              | Path to icon image                                 |
| `contentComponent`    | `React.ComponentType` | Main app content component                         |
| `backgroundComponent` | `React.ComponentType` | Background decoration component                    |

## How Routing Works

Routes are automatically generated from the app registry:

1. `appRegistry.ts` defines all apps
2. `routes/index.tsx` maps each app to a route
3. Each app gets the path: `/apps/{app.id}`

```tsx
// Generated route structure
{
    path: 'apps',
    children: [
        { path: 'reverse-camera', element: <ReverseCamera /> },
        { path: 'my-app', element: <MyApp /> },
    ]
}
```

## Tips

1. **Naming Convention**: Use `app` prefix for feature folders (e.g., `appSettings`, `appMusic`)
2. **Component Exports**: Export both `Background` and `Content` components from `index.tsx`
3. **Styling**: Use Tailwind CSS classes, `size-full` for full-size containers
