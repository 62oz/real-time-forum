import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { Card, Button, Row, Col } from 'react-bootstrap'
import { ArrowLeft } from 'react-bootstrap-icons'

import TopNav from '../Components/TopNav'
import Votes from '../Components/Votes'
import Comment from '../Components/Comment'

const image = {
  width: '5%',
  height: '4vw',
  objectFit: 'cover'
}

const Article = () => {
  let { id } = useParams()

  const [thisPost, setPost] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')

  function getCookie (name) {
    var value = document.cookie
    var parts = value.split('=')
    if (parts.length === 2) return parts[1]
  }

  const checkSession = async () => {
    let sessionID = await getCookie('sessionID')
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
        sessionStorage.setItem('userInfo', JSON.stringify(data.user))
        sessionStorage.setItem('isLoggedIn', true)
      }
    }
  }

  let handleSubmit = async e => {
    e.preventDefault()
    try {
      await fetch('http://localhost:8080/add-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          postID: Number(id),
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
            console.log('comment successful')
            //reset e.target.value
            setContent('')
            setMessage('Comment posted!')
          } else {
            setMessage('Invalid comment')
            console.log('Error with posting comment.')
          }
        })
    } catch (err) {
      console.log(err)
    }
  }

  async function getData () {
    await fetch('http://localhost:8080')
      .then(res => {
        if (res.status === 400) {
          window.location.href = '/bad-request'
        } else if (res.status === 500) {
          window.location.href = '/internal-server-error'
        }
        return res.json()
      })
      .then(json => json.posts)
      .then(posts => {
        if (posts !== undefined) {
          for (let i = 0; i < posts.length; i++) {
            if (posts[i].id === Number(id)) {
              setPost(posts[i])
              break
            }
          }
        }
      })
  }

  useEffect(() => {
    checkSession()
    getData()
    if (!isLoggedIn) {
      sessionStorage.setItem('isLoggedIn', false)
    }
  }, [])

  useEffect(() => {
    fetch('http://localhost:8080')
      .then(res => {
        if (res.status === 400) {
          window.location.href = '/bad-request'
        } else if (res.status === 500) {
          window.location.href = '/internal-server-error'
        }
        return res.json()
      })
      .then(json => json.posts)
      .then(posts => {
        if (posts !== undefined) {
          for (let i = 0; i < posts.length; i++) {
            if (posts[i].id === Number(id)) {
              setPost(posts[i])
              break
            }
          }
        }
      })
  }, [thisPost, thisPost.comments])

  let date = new Date(thisPost.date * 1000)

  return (
    <Row>
      <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>

      <Col lg={8} md={10} xs={12}>
        <TopNav isLoggedIn={isLoggedIn} />
        <div>
          <h2 className='mb-1'>{thisPost.title}</h2>
          <p className=''>
            {date.toLocaleDateString()} by <a href='#'>{thisPost.author}</a>
          </p>

          <p>{thisPost.content}</p>
          <Votes isLoggedIn={isLoggedIn} post={thisPost} />
        </div>
        <hr />
        {isLoggedIn && (
          <Card className='mb-3'>
            <Card.Body>
              <div className='d-flex mb-3'>
                <Card.Img
                  style={image}
                  src='http://bootdey.com/img/Content/user_1.jpg'
                  alt='user profile image'
                  className='me-2'
                />
                <div className='input-group'>
                  <textarea
                    className='form-control'
                    aria-label='With textarea'
                    placeholder='Write a comment...'
                    value={content}
                    onChange={e => setContent(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className='d-flex flex-row-reverse'>
                <Button variant='outline-dark' onClick={handleSubmit}>
                  Comment
                </Button>
              </div>
              {message}
            </Card.Body>
          </Card>
        )}
        <Comment
          coms={thisPost.comments}
          isLoggedIn={isLoggedIn}
          postID={Number(id)}
        />
        <div className='d-flex' type='button' onClick={() => getBack()}>
          <p className='fw-bold'>
            <ArrowLeft /> Back
          </p>
        </div>
      </Col>

      <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>
    </Row>
  )
  // }
}

export default Article

function getBack () {
  window.location.href = '/'
}
