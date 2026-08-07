import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/context/ThemeContext'
import { AppDataProvider } from '@/context/AppDataContext'
import { router } from '@/router/routes'

export default function App() {
  return (
    <ThemeProvider>
      <AppDataProvider>
        <RouterProvider router={router} />
      </AppDataProvider>
    </ThemeProvider>
  )
}
