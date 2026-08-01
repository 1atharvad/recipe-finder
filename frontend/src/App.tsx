import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.scss'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { Navbar } from '@/components/Navbar'
import { DashboardLayout } from '@/components/DashboardLayout'
import { LandingPage } from '@/pages/LandingPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { FeaturesPage } from '@/pages/FeaturesPage'
import { DashboardHomePage } from '@/pages/DashboardHomePage'
import { SearchPage } from '@/pages/SearchPage'
import { RecommenderPage } from '@/pages/RecommenderPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { RecipePage } from '@/pages/RecipePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { MyRecipesPage } from '@/pages/MyRecipesPage'
import { HistoryPage } from '@/pages/HistoryPage'

// These routes render their own LandingHeader (or DashboardLayout) instead
// of the app-wide Navbar.
const LANDING_STYLED_PATHS = ['/', '/how-it-works', '/features', '/login', '/signup']

const AppNavbar = () => {
  const location = useLocation()
  if (
    LANDING_STYLED_PATHS.includes(location.pathname) ||
    location.pathname.startsWith('/recipe/') ||
    location.pathname.startsWith('/dashboard')
  ) return null
  return <Navbar />
}

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppNavbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin — discrete, no nav link */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          {/* Dashboard portal — requires login, own sidebar layout */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="recommender" element={<RecommenderPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Protected user routes */}
          <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipesPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
