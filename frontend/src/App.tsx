import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from 'advi-ui'
import './App.scss'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { LandingPage } from '@/pages/LandingPage'
import { HowItWorksPage } from '@/pages/HowItWorksPage'
import { FeaturesPage } from '@/pages/FeaturesPage'
import { RecipePage } from '@/pages/RecipePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { TermsPage } from '@/pages/TermsPage'

// Dashboard and admin are behind a login wall and only ever needed by users
// who reach them, so they're split into their own chunks instead of
// bloating the marketing/landing bundle every visitor downloads up front.
const DashboardLayout = lazy(() => import('@/components/DashboardLayout').then(m => ({ default: m.DashboardLayout })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })))
const RecommenderPage = lazy(() => import('@/pages/RecommenderPage').then(m => ({ default: m.RecommenderPage })))
const InventoryPage = lazy(() => import('@/pages/InventoryPage').then(m => ({ default: m.InventoryPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })))
const MyRecipesPage = lazy(() => import('@/pages/MyRecipesPage').then(m => ({ default: m.MyRecipesPage })))
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then(m => ({ default: m.HistoryPage })))
const RemindersPage = lazy(() => import('@/pages/RemindersPage').then(m => ({ default: m.RemindersPage })))
const NutritionPage = lazy(() => import('@/pages/NutritionPage').then(m => ({ default: m.NutritionPage })))
const ShoppingListPage = lazy(() => import('@/pages/ShoppingListPage').then(m => ({ default: m.ShoppingListPage })))
const MealPrepPage = lazy(() => import('@/pages/MealPrepPage').then(m => ({ default: m.MealPrepPage })))

const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })))
const AdminLayout = lazy(() => import('@/components/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })))
const AdminPublicRecipesPage = lazy(() => import('@/pages/AdminPublicRecipesPage').then(m => ({ default: m.AdminPublicRecipesPage })))
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })))
const AdminAnalyticsPage = lazy(() => import('@/pages/AdminAnalyticsPage').then(m => ({ default: m.AdminAnalyticsPage })))
const AdminEmbeddingsPage = lazy(() => import('@/pages/AdminEmbeddingsPage').then(m => ({ default: m.AdminEmbeddingsPage })))

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<div className="route-loading">Loading…</div>}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/recipe/:id" element={<RecipePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Admin — discrete, no nav link */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="public-recipes" element={<AdminPublicRecipesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="embeddings" element={<AdminEmbeddingsPage />} />
              </Route>

              {/* Dashboard portal — requires login, own sidebar layout */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<SearchPage />} />
                <Route path="recommender" element={<RecommenderPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="favorites" element={<FavoritesPage />} />
                <Route path="my-recipes" element={<MyRecipesPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="reminders" element={<RemindersPage />} />
                <Route path="nutrition" element={<NutritionPage />} />
                <Route path="shopping-list" element={<ShoppingListPage />} />
                <Route path="meal-prep" element={<MealPrepPage />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
