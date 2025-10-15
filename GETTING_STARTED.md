# Getting Started with ReliefLink

## Quick Start Guide

### 1. Installation

```bash
cd /Volumes/MAC_OPTION/CODE_DZ_2/RELIEFLINK
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 3. Access the Dashboards

#### Master Admin Dashboard
- URL: `http://localhost:3000/master-admin`
- Full administrative access
- Complete system management
- Analytics and reporting

#### User Portal
- URL: `http://localhost:3000/user`
- User-specific dashboard
- Relief request management
- Personal profile and activity

## Project Structure Overview

```
ReliefLink/
├── Master Admin Section (/master-admin)
│   ├── Dashboard - Ecommerce overview
│   ├── Calendar - Event management
│   ├── User Management - Manage platform users
│   ├── Forms - Form elements
│   ├── Tables - Data tables
│   ├── Charts - Line & Bar charts
│   └── UI Components - Full component library
│
└── User Section (/user)
    ├── Dashboard - Personal overview
    ├── My Requests - Relief requests
    ├── Profile - User profile
    └── Resources - Access relief resources
```

## Key Differences Between Roles

### Master Admin
- **Navigation**: Extended menu with all features
- **Access**: Full system access
- **Features**: 
  - User management
  - System analytics
  - Resource allocation
  - Advanced reporting
  - Full UI component library

### User
- **Navigation**: Simplified menu for daily tasks
- **Access**: Personal data and requests only
- **Features**:
  - Personal dashboard
  - Request submission
  - Donation tracking
  - Profile management
  - Resource access

## Development Tips

### 1. Adding New Pages

For Master Admin:
```typescript
// Create: src/app/master-admin/new-page/page.tsx
export default function NewPage() {
  return <div>New Master Admin Page</div>
}
```

For User:
```typescript
// Create: src/app/user/new-page/page.tsx
export default function NewPage() {
  return <div>New User Page</div>
}
```

### 2. Updating Navigation

Edit: `src/layout/AppSidebar.tsx`

Update the `getNavItems` or `getOthersItems` functions for the specific role.

### 3. Adding Components

Place new components in `src/components/` with appropriate subdirectories:
- `common/` - Shared components
- `master-admin/` - Master admin specific
- `user/` - User specific

### 4. Styling

- Global styles: `src/app/globals.css`
- Use Tailwind CSS utility classes
- Theme variables defined in globals.css

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npx tsc --noEmit
```

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Update the variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Theme Customization

### Colors
Edit the theme section in `src/app/globals.css`:
```css
@theme {
  --color-brand-500: #465fff;  /* Primary brand color */
  --color-success-500: #12b76a; /* Success color */
  --color-error-500: #f04438;   /* Error color */
  /* ... more colors */
}
```

### Breakpoints
Custom breakpoints are defined in globals.css:
```css
--breakpoint-2xsm: 375px;
--breakpoint-xsm: 425px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
--breakpoint-3xl: 2000px;
```

## Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3001 npm run dev
```

### Clear Cache
```bash
rm -rf .next
npm run dev
```

### Type Errors
```bash
# Regenerate types
rm -rf .next
npm run build
```

## Next Steps

1. **Configure API endpoints** in `.env.local`
2. **Set up authentication** using NextAuth.js (if needed)
3. **Connect to database** (PostgreSQL, MongoDB, etc.)
4. **Customize branding** (colors, logo, fonts)
5. **Add business logic** to components and pages
6. **Implement real data fetching** from your backend

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)

## Support

For issues or questions:
1. Check the main README.md
2. Review the documentation
3. Create an issue in the repository

---

Happy coding with ReliefLink! 🚀

