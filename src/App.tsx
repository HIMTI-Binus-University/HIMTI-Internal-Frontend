import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { publicRoutes } from './config/routes'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes.map((route) => {
          if (route.children && route.children.length > 0) {
            return (
              <Route
                path={route.path}
                element={<route.component />}
                key={route.key}
              >
                {route.children.map((childRoute) => (
                  <Route
                    path={childRoute.path}
                    element={<childRoute.component />}
                    key={childRoute.key}
                  />
                ))}
              </Route>
            )
          }
          return (
            <Route
              path={route.path}
              element={<route.component />}
              key={route.key}
            />
          )
        })}
      </Routes>
    </BrowserRouter>
  )
}

export default App
