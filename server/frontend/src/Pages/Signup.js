import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Form, Button } from 'react-bootstrap'

const styles = {
  back: {
    backgroundColor: 'white',
    width: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0
  },
  divCenter: {
    width: 400,
    height: 400,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    margin: 'auto',
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'auto',
    padding: '1em 2em',
    borderBottom: '2px solid #ccc',
    display: 'table'
  },
  divContent: {
    display: 'table-cell',
    verticalAlign: 'middle'
  }
}

function Signup () {
  const [username, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [age, setAge] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  let handleSignup = async e => {
    e.preventDefault()
    try {
      let res = await fetch('http://localhost:8080/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          mobile: mobileNumber,
          age: age,
          firstName: firstName,
          lastName: lastName
        })
      })

      let json = await res.json()
      console.log(json)
      if (json.success === true) {
        setName('')
        setEmail('')
        setMobileNumber('')
        setPassword('')
        setAge(0)
        setFirstName('')
        setLastName('')
        setMessage('User logged in successfully')
        navigate('/', { replace: true })
      } else {
        if (json.wrong.includes('username')) {
          setMessage(`Username must only include alphanumericals and '_'.`)
        }
        if (json.wrong.includes('password')) {
          setMessage('Password must be at least 4 characters long.')
        }
        if (json.wrong.includes('email')) {
          setMessage('Invalid e-mail.')
        }
        if (json.wrong.includes('exists')) {
          setMessage('Username is taken.')
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div style={styles.back}>
      <div
        style={styles.divCenter}
        className='border border-light shadow bg-white rounded'
      >
        <div style={styles.divContent}>
          <Form onSubmit={handleSignup}>
            <Form.Group className='mb-3' controlId='formBasicEmail'>
              <Form.Label className='fs-4'>Email</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='formBasicUsername'>
              <Form.Label className='fs-4'>Username</Form.Label>
              <Form.Control
                type='username'
                placeholder='Enter username'
                value={username}
                onChange={e => setName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicFirstName'>
              <Form.Label className='fs-4'>First name</Form.Label>
              <Form.Control
                type='firstname'
                placeholder='Enter first name'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicLastName'>
              <Form.Label className='fs-4'>Last name</Form.Label>
              <Form.Control
                type='lastname'
                placeholder='Enter last name'
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='formAgeSelector'>
              <Form.Label>Age</Form.Label>
              <Form.Control
                type='number'
                placeholder='Enter age'
                min='0'
                max='120'
                step='1'
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='formBasicPassword'>
              <Form.Label className='fs-4'>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Password'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Text>
              {message}
              <br></br>
            </Form.Text>
            <Button variant='outline-primary' type='submit' className='me-2'>
              Sign Up
            </Button>
            <Button variant='outline-danger' onClick={Cancel}>
              Cancel
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Signup

function Cancel () {
  window.location.href = '/'
}
