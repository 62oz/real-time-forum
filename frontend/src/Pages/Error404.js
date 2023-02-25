import React from 'react'
import { Container, Row, Button } from 'react-bootstrap'

const PageNotFound = () => {
  return (
    <Container>
      <Row className='justify-content-center mt-5'>
        <h1>404 Page Not Found</h1>
      </Row>
      <Row className='justify-content-center'>
        <p>The page you are looking for could not be found.</p>
      </Row>
      <Button href='/' variant='primary'>
        Go to Homepage
      </Button>
    </Container>
  )
}

export default PageNotFound
