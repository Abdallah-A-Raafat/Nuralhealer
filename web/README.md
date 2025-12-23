# 🎨 Web Application - Frontend

React-based web application for NeuralHealer platform.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

### Development

```bash
npm run dev
```

Open: http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── common/         # Common UI components
│   └── ...
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── patient/        # Patient pages
│   └── doctor/         # Doctor pages
├── services/           # API services
│   ├── apiClient.js    # Axios instance
│   ├── authService.js
│   ├── chatService.js
│   └── bookingService.js
├── hooks/              # Custom React hooks
├── store/              # State management (Zustand)
├── utils/              # Utility functions
├── i18n/               # Internationalization
└── assets/             # Images, fonts, etc.
```

---

## 🔧 Tech Stack

- **React** 19
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **React Hook Form** - Forms
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

---

## 🎨 Features

- ✅ User authentication (Patient/Doctor)
- ✅ AI chat interface
- ✅ Doctor browsing and booking
- ✅ Profile management
- ✅ Session history
- ✅ Multi-language support (Arabic/English)
- ✅ Dark mode
- ✅ Responsive design

---

## 🧪 Testing

```bash
npm test
```

---

## 📦 Build

```bash
npm run build
```

Output in `dist/` folder.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy
```

---

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

---

## 🔗 Related

- [API Documentation](../docs/api/API_CONTRACT.md)
- [Backend Setup](../backend/README.md)
- [Integration Guide](../docs/integration/INTEGRATION_GUIDE.md)

---

## 📞 Support

For issues or questions, open an issue on GitHub or contact the team.
