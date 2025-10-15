# ReliefLink

A comprehensive relief and aid management platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

ReliefLink provides two distinct user interfaces:

### Master Admin Dashboard
- **Full System Control**: Complete overview and management of the entire platform
- **User Management**: Manage all users and their permissions
- **Analytics & Reports**: Comprehensive statistics and demographic insights
- **Resource Allocation**: Track and manage relief resources
- **Calendar Management**: Schedule and coordinate relief activities
- **Advanced Charts**: Line charts, bar charts, and data visualization
- **UI Components**: Full suite of alerts, avatars, badges, buttons, images, and videos

### User Portal
- **Personal Dashboard**: View individual relief requests and donations
- **Request Management**: Submit and track relief requests
- **Donation Tracking**: Monitor contributions and impact
- **Profile Management**: Update personal information and preferences
- **Activity Feed**: View recent activities and updates
- **Impact Score**: Track community ranking and contributions
- **Resources**: Access relief resources and information

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom components with shadcn/ui patterns
- **Charts**: ApexCharts & React-ApexCharts
- **Calendar**: FullCalendar
- **Maps**: React JVectorMap
- **Forms**: React Dropzone, Flatpickr
- **Drag & Drop**: React DnD
- **Carousel**: Swiper

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RELIEFLINK
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Routes

### Master Admin Routes
- `/master-admin` - Master Admin Dashboard
- `/master-admin/calendar` - Calendar Management
- `/master-admin/users` - User Management
- `/master-admin/form-elements` - Form Elements
- `/master-admin/basic-tables` - Tables
- `/master-admin/line-chart` - Line Charts
- `/master-admin/bar-chart` - Bar Charts
- `/master-admin/alerts` - Alert Components
- `/master-admin/avatars` - Avatar Components
- `/master-admin/badge` - Badge Components
- `/master-admin/buttons` - Button Components
- `/master-admin/images` - Image Gallery
- `/master-admin/videos` - Video Components

### User Routes
- `/user` - User Dashboard
- `/user/requests` - Relief Requests
- `/user/profile` - User Profile
- `/user/resources` - Resource Center

## 🎨 Theme Support

ReliefLink supports both light and dark themes:
- Toggle theme using the theme switcher in the header
- Theme preference is saved automatically
- Dark mode optimized for better readability

## 📱 Responsive Design

The platform is fully responsive and works seamlessly on:
- Desktop (1920px and above)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Tailwind Configuration

The project uses Tailwind CSS v4 with custom theme configuration in `src/app/globals.css`.

## 📂 Project Structure

```
RELIEFLINK/
├── public/
│   └── images/          # Static images and assets
├── src/
│   ├── app/
│   │   ├── master-admin/   # Master admin routes
│   │   ├── user/           # User routes
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Home page (redirects)
│   │   ├── not-found.tsx   # 404 page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── calendar/       # Calendar components
│   │   ├── charts/         # Chart components
│   │   ├── common/         # Common/shared components
│   │   ├── ecommerce/      # Dashboard components
│   │   ├── form/           # Form components
│   │   ├── header/         # Header components
│   │   ├── tables/         # Table components
│   │   ├── ui/             # UI components
│   │   └── videos/         # Video components
│   ├── context/
│   │   ├── SidebarContext.tsx  # Sidebar state management
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── hooks/              # Custom React hooks
│   ├── icons/              # SVG icons
│   └── layout/
│       ├── AppHeader.tsx   # Application header
│       ├── AppSidebar.tsx  # Application sidebar
│       ├── Backdrop.tsx    # Mobile overlay
│       └── SidebarWidget.tsx  # Sidebar widget
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features Implementation

### Role-Based Access Control
The platform implements role-based routing:
- Master Admin users access `/master-admin/*` routes
- Regular users access `/user/*` routes
- Each role has customized sidebar navigation and dashboard

### Responsive Sidebar
- Expandable/collapsible sidebar
- Hover expand feature on desktop
- Mobile-friendly drawer
- Dynamic width adjustments
- Persistent state management

### Dark Mode
- System-wide dark mode support
- Smooth transitions between themes
- Optimized colors for both modes
- Icon adaptations for theme

## 🔐 Authentication

The platform includes authentication pages:
- Sign In: `/signin`
- Sign Up: `/signup`

## 📊 Dashboard Components

### Master Admin Dashboard
- Ecommerce metrics cards
- Monthly sales charts
- Statistics visualization
- Recent orders table
- Demographic distribution map

### User Dashboard
- Relief request counter
- Donation tracking
- Impact score display
- Recent activity timeline

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🙏 Acknowledgments

- Built on top of a Next.js admin dashboard template
- Icons and assets from various open-source projects
- Tailwind CSS for styling framework

---

**ReliefLink** - Connecting communities with relief resources efficiently and transparently.

