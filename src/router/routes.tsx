import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { MainTabLayout } from '@/components/layout/MainTabLayout'
import { useAppData } from '@/context/AppDataContext'

import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen'
import { AuthScreen } from '@/screens/auth/AuthScreen'
import { SkillTestScreen } from '@/screens/skilltest/SkillTestScreen'
import { TodayScreen } from '@/screens/today/TodayScreen'
import { PlanScreen } from '@/screens/plan/PlanScreen'
import { ProgressScreen } from '@/screens/progress/ProgressScreen'
import { SettingsScreen } from '@/screens/settings/SettingsScreen'
import { ShootingSkillScreen } from '@/screens/skilltest/shooting/ShootingSkillScreen'

// --- استيراد جميع اختبارات الدقة الستة ---
import { AccuracyTestScreen } from '@/screens/skilltest/shooting/accuracy/AccuracyTestScreen'
import { CornerPlacementScreen } from '@/screens/skilltest/shooting/accuracy/CornerPlacementScreen'
import { DistanceAccuracyScreen } from '@/screens/skilltest/shooting/accuracy/DistanceAccuracyScreen'
import { TwoFootAccuracyScreen } from '@/screens/skilltest/shooting/accuracy/TwoFootAccuracyScreen'
import { MovingAccuracyScreen } from '@/screens/skilltest/shooting/accuracy/MovingAccuracyScreen'
import { PressureAccuracyScreen } from '@/screens/skilltest/shooting/accuracy/PressureAccuracyScreen'

/** Index route ("/"): sends the person to the right place based on what's already saved on this device. */
function StartGate() {
  const { data } = useAppData()
  // إذا كانت البيانات موجودة، اذهب لـ today، وإلا اذهب لـ onboarding بدلاً من إجبار المستخدم على حلقة مغلقة
  return <Navigate to={data ? '/today' : '/onboarding'} replace />
}

/** Guards the main tabs: bounces back to auth/onboarding if there's no active account yet. */
function RequireApp() {
  const { data } = useAppData()
  // إذا لم تكن البيانات موجودة، وجهه لصفحة تسجيل الدخول (/auth) بدلاً من الـ onboarding مباشرة
  if (!data) return <Navigate to="/auth" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <StartGate /> },
      { path: 'onboarding', element: <OnboardingScreen /> },
      { path: 'auth', element: <AuthScreen /> },
      { path: 'skill-test', element: <SkillTestScreen /> },
      { path: 'skill-test/shooting', element: <ShootingSkillScreen /> },
      
      // --- مسارات اختبارات الدقة (Accuracy Tests) الستة ---
      { path: 'skill-test/shooting/accuracy', element: <AccuracyTestScreen /> },
      { path: 'skill-test/shooting/corner-placement', element: <CornerPlacementScreen /> },
      { path: 'skill-test/shooting/distance-accuracy', element: <DistanceAccuracyScreen /> },
      { path: 'skill-test/shooting/two-foot-accuracy', element: <TwoFootAccuracyScreen /> },
      { path: 'skill-test/shooting/moving-accuracy', element: <MovingAccuracyScreen /> },
      { path: 'skill-test/shooting/pressure-accuracy', element: <PressureAccuracyScreen /> },

      {
        element: <RequireApp />,
        children: [
          {
            element: <MainTabLayout />,
            children: [
              { path: 'today', element: <TodayScreen /> },
              { path: 'plan', element: <PlanScreen /> },
              { path: 'progress', element: <ProgressScreen /> },
              { path: 'settings', element: <SettingsScreen /> },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])