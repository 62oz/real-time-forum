
import React, { Component } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './Pages/Home'
import MyAccountPage from './Pages/MyAccountPage'
import Signin from './Pages/Sigin-copy'
import CreatePost from './Pages/CreatePost';
import MyLikes from './Components/MyLikes';
import LogIn from './Pages/LogIn'
//import MyPosts from './Pages/MyPosts';
//import SinglePost from './Pages/SinglePost';



class App extends Component {
  render () {
    return (
      <Router>
        <Routes>
          <Route exact path='/' element={<LogIn/>} />
          <Route exact path='/account' element={<MyAccountPage/>} />
          <Route exact path='/signin' element={<Signin/>} />
          <Route exact path='/create-post' element={<CreatePost/>} />
          <Route exact path='/my-likes' element={<MyLikes/>} />
{/*           
          <Route exact path='/my-posts' element={<MyPosts/>} />
          
          <Route exact path='/single-post' element={<SinglePost/>} /> */}
          
        </Routes>
      </Router>
    );
  }
}

export default App;