import React from 'react'
import { useState, useEffect } from 'react'
import { Row, Col, Nav, Tab, Card, Form, Button } from 'react-bootstrap'
import TopNav from '../Components/TopNav'
import PostCards from '../Components/PostCards'

function MyAccountPage () {
  // fetch user info from backend
  const [userInfo, setUserInfo] = useState(null)
  useEffect(() => {
    fetch('http://localhost:8080/my-account', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (response.status === 400) {
          window.location.href = '/bad-request'
        } else if (response.status === 500) {
          window.location.href = '/internal-server-error'
        }
        return response.json()
      })
      .then(data => {
        setUserInfo(data)
      })
      .catch(error => {
        // Handle any errors
        console.error(error)
      })
  }, [userInfo])

  return userInfo ? (
    <Row>
      <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>

      <Col lg={8} md={10} xs={12}>
        <TopNav isLoggedIn={sessionStorage.getItem('isLoggedIn')} />
        <Tab.Container id='left-tabs-example' defaultActiveKey='myAccount'>
          <Row>
            <Col sm={3}>
              <Nav variant='pills' className='flex-column'>
                <Nav.Item>
                  <Nav.Link className='bg-light text-dark' eventKey='myAccount'>
                    Account
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link className='bg-light text-dark' eventKey='myPosts'>
                    My Posts
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className='bg-light text-dark'
                    eventKey='myReactedPosts'
                  >
                    My Reacted Posts
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    className='bg-light text-dark'
                    eventKey='MyCommentedPosts'
                  >
                    My Commented Posts
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey='myAccount'>
                  <Card>
                    <Card.Body>
                      <Form>
                        <Form.Group className='mb-3'>
                          <Form.Label>Email</Form.Label>
                          <Form.Control placeholder={userInfo.email} disabled />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            placeholder={userInfo.username}
                            disabled
                          />
                        </Form.Group>
                      </Form>
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey='myPosts'>
                  <h1>My Posts</h1>
                  {/* items range later here */}
                  <PostCards isLoggedIn={true} items={userInfo.createdPosts} />
                </Tab.Pane>
                <Tab.Pane eventKey='myReactedPosts'>
                  <h1>My Reacted Posts</h1>
                  {/* items range later here */}
                  <PostCards isLoggedIn={true} items={userInfo.reactedPosts} />
                </Tab.Pane>
                <Tab.Pane eventKey='MyCommentedPosts'>
                  <h1>My Commented Posts</h1>
                  {/* items range later here */}
                  <PostCards
                    isLoggedIn={true}
                    items={userInfo.commentedPosts}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Col>

      <Col lg={2} md={1} className='d-none d-lg-block d-md-block'></Col>
    </Row>
  ) : (
    <div>
      <h1>Not logged in</h1>
      <Button href='/login' variant='primary'>
        Go to Login page
      </Button>
    </div>
  )
}

export default MyAccountPage
