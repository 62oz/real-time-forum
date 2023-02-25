import React from 'react'
import { Container, Row, Button } from 'react-bootstrap'

const InternalServerError = () => {
  return (
    <Container>
      <Row className='justify-content-center mt-5'>
        <h1>500 Internal Server Error</h1>
      </Row>
      <Row className='justify-content-center'>
        <p>Whoops! This one's pretty bad..</p>
      </Row>
      <Button href='/' variant='primary'>
        Go to Homepage
      </Button>
    </Container>
  )
}

export default InternalServerError
