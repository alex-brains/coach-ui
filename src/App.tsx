import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Study from './pages/Study'
import './App.css'

function App() {
  return (
      <BrowserRouter>
        <div className="app">
          <nav className="nav">
            <div className="nav__brand">Coach</div>
            <div className="nav__links">
              <NavLink to="/" end className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
                Учить
              </NavLink>
              <NavLink to="/questions" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
                Вопросы
              </NavLink>
              <NavLink to="/language" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
                Слова
              </NavLink>
              <NavLink to="/topics" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
                Топики
              </NavLink>
            </div>
          </nav>
          <main className="main">
            <Routes>
              <Route path="/" element={<Study />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
  )
}

export default App
