import React from 'react'
import { Container, Row, Button } from 'react-bootstrap'

const BadRequest = () => {
  return (
    <Container>
      <Row className='justify-content-center mt-5'>
        <h1>400 Bad Request</h1>
      </Row>
      <Row className='justify-content-center'>
        <p>Uh-oh!.</p>
      </Row>
      <Button href='/' variant='primary'>
        Go to Homepage
      </Button>
    </Container>
  )
}

export default BadRequest
