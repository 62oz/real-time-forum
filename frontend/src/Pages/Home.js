import React, { useState, useEffect } from 'react'

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner
} from 'react-bootstrap'
import { PlusLg } from 'react-bootstrap-icons'

import TopNav from '../Components/TopNav'
import Toggles from '../Components/Toggles'
import PostCards from '../Components/PostCards'
import ChatList from '../Components/ChatList'

const Home = () => {
  const [categories, setDataFromToggle] = useState([])
  const [postTypes, setPostTypes] = useState([])
  const reactCommentedPosts = { reactedPosts: [], commentedPosts: [] }
  const [items, setItems] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeUser, setActiveUser] = useState({})
  const [switchReactToogle, setSwitchState] = useState(false)
  const [cookie, setCookie] = useState('')

  if (activeUser !== undefined) {
    if (
      activeUser.reactedPosts !== undefined &&
      activeUser.reactedPosts !== null
    ) {
      reactCommentedPosts.reactedPosts = activeUser.reactedPosts.map(
        item => item.id
      )
    }
    if (
      activeUser.commentedPosts !== undefined &&
      activeUser.commentedPosts !== null
    ) {
      reactCommentedPosts.commentedPosts = activeUser.commentedPosts.map(
        item => item.id
      )
    }
  }

  const handleChange = function (e, value) {
    if (e.target.checked === true) {
      setPostTypes([...postTypes, value])
    } else {
      setPostTypes(postTypes.filter(item => item !== value))
    }
    setSwitchState(!switchReactToogle)
  }

  const receiveCategoryFromToggle = data => {
    if (data.condition === true) {
      setDataFromToggle([...categories, data.value])
    } else {
      setDataFromToggle(categories.filter(item => item !== data.value))
    }
  }

  const getCookie = async name => {
    var value = document.cookie
    var parts = value.split('=')
    if (parts.length === 2) return parts[1]
  }

  const checkSession = async () => {
    let sessionID = await getCookie('sessionID')
    setCookie(sessionID)
    console.log('sessionID', sessionID)
    if (sessionID !== undefined) {
      const res = await fetch('http://localhost:8080/check-session', {
        method: 'GET',
        credentials: 'include'
      })
      if (res.status === 400) {
        window.location.href = '/bad-request'
      } else if (res.status === 500) {
        window.location.href = '/internal-server-error'
      }
      const data = await res.json()
      console.log(data.status)
      if (data.status === 'success') {
        setIsLoggedIn(true)
        setActiveUser(data.user)
        sessionStorage.setItem('userInfo', JSON.stringify(data.user))
        sessionStorage.setItem('isLoggedIn', true)
      }
    }
  }

  function getData () {
    fetch('http://localhost:8080', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 400) {
          window.location.href = '/bad-request'
        } else if (res.status === 500) {
          window.location.href = '/internal-server-error'
        }
        return res.json()
      })
      .then(json => {
        setItems(json)
      })
  }

  useEffect(() => {
    checkSession()
    getData()
    if (!isLoggedIn) {
      sessionStorage.setItem('isLoggedIn', false)
      sessionStorage.setItem('userInfo', null)
    }
  }, [cookie])

  useEffect(() => {
    fetch('http://localhost:8080', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 400) {
          window.location.href = '/bad-request'
        } else if (res.status === 500) {
          window.location.href = '/internal-server-error'
        }
        return res.json()
      })
      .then(json => {
        setItems(json)
      })
  }, [items])

  return (
    <Container fluid>
      <Row>
        <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>
        <Col lg={8} md={10} xs={12}>
          <TopNav isLoggedIn={isLoggedIn} userInfo={activeUser} />
          <Toggles sendData={receiveCategoryFromToggle} />
          {isLoggedIn && (
            <div className='text-end mb-4'>
              <Button variant='outline-primary' onClick={CreatePost}>
                <PlusLg /> Create Post
              </Button>
            </div>
          )}
          <Row>
            <Col lg={3} className='mb-4'>
              <Card bg={'light'} className='mb-4'>
                <Card.Body>
                  <Card.Title>About</Card.Title>
                  <Card.Text>
                    This blog is a place to share food recipes. Made by Ali,
                    Jacob, Gin, Nafi and Ashley.
                  </Card.Text>
                </Card.Body>
              </Card>

              {isLoggedIn && (
                <Card border='dark'>
                  <Card.Body>
                    <Form>
                      <Form.Check
                        type='switch'
                        id='custom-switch'
                        label='My React Posts'
                        defaultChecked={switchReactToogle}
                        onChange={e => handleChange(e, 'ReactedPosts')}
                      />
                      <Form.Check
                        type='switch'
                        id='custom-switch'
                        label='My Commented Posts'
                        defaultChecked={switchReactToogle}
                        onChange={e => handleChange(e, 'CommentedPosts')}
                      />
                    </Form>
                  </Card.Body>
                </Card>
              )}
              <ChatList></ChatList>
            </Col>
            <Col lg={9} xs={12} md={12}>
              {items ? (
                <PostCards
                  isLoggedIn={isLoggedIn}
                  items={items.posts}
                  userInfo={activeUser}
                  categoriesFromToggle={categories}
                  postTypesFromToggle={postTypes}
                  reactCommentedPosts={reactCommentedPosts}
                />
              ) : (
                <Spinner animation='border' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </Spinner>
              )}
            </Col>
          </Row>
        </Col>

        <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>
      </Row>
    </Container>
  )
}

export default Home

function CreatePost () {
  window.location.href = '/create-post'
}
