import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import Home from './Pages/Home'
import MyAccountPage from './Pages/MyAccountPage'
import CreatePost from './Pages/CreatePost'
import LogIn from './Pages/LogIn'
import Signup from './Pages/Signup'
import Article from './Pages/Article'
import PageNotFound from './Pages/Error404'
import BadRequest from './Pages/Error400'
import InternalServerError from './Pages/Error500'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path='/signup' element={<Signup />} />
        <Route exact path='/' element={<Home />} />
        <Route
          exact
          path='/account'
          element={
            sessionStorage.getItem('isLoggedIn') ? (
              <MyAccountPage />
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route exact path='/login' element={<LogIn />} />
        <Route exact path='/create-post' element={<CreatePost />} />
        <Route exact path='/articles/:id' element={<Article />} />
        <Route exact path='/bad-request' element={<BadRequest />} />
        <Route
          exact
          path='/internal-server-error'
          element={<InternalServerError />}
        />
        <Route path='*' element={<PageNotFound />} />
      </Routes>
    </Router>
  )
}

export default App
