import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Row, Col, Form, Button } from 'react-bootstrap'
import Toggles from '../Components/Toggles'
import TopNav from '../Components/TopNav'
import Login from './LogIn'

async function getCookie (name) {
  var value = '; ' + document.cookie
  var parts = value.split('; ' + name + '=')
  if (parts.length === 2) return parts.pop().split(';').shift()
}

async function checkSession () {
  const sessionID = await getCookie('sessionID')
  if (sessionID !== undefined) {
    const res = await fetch('http://localhost:8080/check-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        mode: 'cors'
      },
      body: JSON.stringify({ sessionID })
    })
    if (res.status === 400) {
      window.location.href = '/bad-request'
    } else if (res.status === 500) {
      window.location.href = '/internal-server-error'
    }
    const data = await res.json()
    if (data.status === 'success') {
      return true
    }
  }
  return false
}

function CreatePost () {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categories, setDataFromToggle] = useState('')
  const [message, setMessage] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  //CHECKING NOT LOGGED --> THEN REDIRECT TO HOME
  useEffect(() => {
    async function checkSessionAndNavigate () {
      if (await checkSession()) {
        setIsLoggedIn(true)
      } else {
        //NAVIGATE TO LOGIN PAGE
      }
    }
    checkSessionAndNavigate()
  }, [navigate])
  //////////////////////

  function getCookie (name) {
    var value = document.cookie
    var parts = value.split('=')
    if (parts.length === 2) return parts[1]
  }

  let handleSubmit = async e => {
    e.preventDefault()
    try {
      await fetch('http://localhost:8080/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: content,
          categories: categories,
          session: getCookie('sessionID')
        })
      })
        .then(response => {
          if (response.status === 400) {
            window.location.href = '/bad-request'
          } else if (response.status === 500) {
            window.location.href = '/internal-server-error'
          }
          return response.text()
        })
        .then(text => {
          if (text === 'true') {
            navigate('/', { replace: true })
            console.log('Post successful')
          } else {
            setMessage('Invalid Post')
            console.log('Error with posting post.')
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  const receiveCategoryFromToggle = data => {
    let newCategories = categories
    if (data.condition === true) {
      newCategories = categories ? categories + ', ' + data.value : data.value
    } else {
      newCategories = categories
        .split(', ')
        .filter(item => item !== data.value)
        .join(', ')
    }
    setDataFromToggle(newCategories)
  }

  return isLoggedIn ? (
    <div>
      <Row>
        <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>

        <Col lg={8} md={10} xs={12}>
          <TopNav isLoggedIn={isLoggedIn} />
          <br></br>
          <div className='mb-3'>
            <Form.Label className='fs-3'>Recipe Categories</Form.Label>
            <Toggles sendData={receiveCategoryFromToggle} />
          </div>
          <Form className='mt-5'>
            <Form.Group className='mb-3' controlId='postForm.ControlInput'>
              <Form.Label className='fs-3'>Recipe Title</Form.Label>
              <Form.Control
                size='lg'
                type='title'
                placeholder='Write a title'
                onChange={e => setTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='postForm.ControlTextarea'>
              <Form.Label className='fs-3'>Recipe Content</Form.Label>
              <Form.Control
                size='lg'
                as='textarea'
                rows={5}
                placeholder='Write a recipe...'
                onChange={e => setContent(e.target.value)}
              />
            </Form.Group>
            <div>{message}</div>
            <div className='d-flex flex-row justify-content-end'>
              <Button
                variant='outline-primary'
                type='submit'
                className='me-2'
                onClick={handleSubmit}
              >
                Post
              </Button>
              <Button variant='outline-danger' onClick={Cancel}>
                Cancel
              </Button>
            </div>
          </Form>
        </Col>

        <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>
      </Row>
    </div>
  ) : (
    <Login />
  )
}

export default CreatePost

function Cancel () {
  window.location.href = '/'
}
