import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from 'advi-ui'
import './App.scss'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
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
import { AdminLayout } from '@/components/AdminLayout'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { AdminPublicRecipesPage } from '@/pages/AdminPublicRecipesPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage'
import { AdminEmbeddingsPage } from '@/pages/AdminEmbeddingsPage'
import { MyRecipesPage } from '@/pages/MyRecipesPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage'
import { TermsPage } from '@/pages/TermsPage'
import { RemindersPage } from '@/pages/RemindersPage'
import { ShoppingListPage } from '@/pages/ShoppingListPage'
import { MealPrepPage } from '@/pages/MealPrepPage'

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
              <Route index element={<DashboardHomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="recommender" element={<RecommenderPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="my-recipes" element={<MyRecipesPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="reminders" element={<RemindersPage />} />
              <Route path="shopping-list" element={<ShoppingListPage />} />
              <Route path="meal-prep" element={<MealPrepPage />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
