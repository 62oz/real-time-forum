import { Card, Col } from 'react-bootstrap'
import { HandThumbsUp, HandThumbsDown } from 'react-bootstrap-icons'

const image = {
  width: '5%',
  height: '4vw',
  objectFit: 'cover'
}
const Comment = props => {
  let coms = props.coms

  let postID = props.postID
  let isLoggedIn = props.isLoggedIn

  function getCookie (name) {
    var value = document.cookie
    var parts = value.split('=')
    if (parts.length === 2) return parts[1]
  }

  function AddLike (comID, isLoggedIn) {
    if (isLoggedIn) {
      try {
        fetch('http://localhost:8080/add-reaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            likeOrDislike: 1,
            session: getCookie('sessionID'),
            commentID: Number(comID),
            postID: postID
          })
        })
          .then(response => response.text())
          .then(text => {
            if (text === 'true') {
              console.log('Like successful')
            } else {
              console.log('Error with like.')
            }
          })
      } catch (err) {
        console.log(err)
      }
    } else {
      alert('Login to leave a like.')
    }
  }

  function AddDislike (comID, isLoggedIn) {
    if (isLoggedIn) {
      try {
        fetch('http://localhost:8080/add-reaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            likeOrDislike: -1,
            session: getCookie('sessionID'),
            postID: postID,
            commentID: Number(comID)
          })
        })
          .then(response => response.text())
          .then(text => {
            if (text === 'true') {
              console.log('Dislike successful')
            } else {
              console.log('Error with dislike.')
            }
          })
      } catch (err) {
        console.log(err)
      }
    } else {
      alert('Login to leave a dislike.')
    }
  }

  return coms ? (
    <div>
      {coms.map(com => (
        <Col key={com.id}>
          <Card className='mb-3'>
            <Card.Body>
              <div className='d-flex mb-3'>
                <Card.Img
                  style={image}
                  src='http://bootdey.com/img/Content/user_1.jpg'
                  alt='user profile image'
                  className='me-2'
                />
                <Card.Text className='d-inline-flex'>
                  <span className='fw-bold me-2'>{com.author}</span>
                  <span className='fw-light'> made a comment</span>
                </Card.Text>
              </div>
              <Card.Text>{com.content}</Card.Text>
              <div className='d-flex flex-row-reverse'>
                <p className='me-3'>
                  <HandThumbsUp
                    type='button'
                    onClick={() => AddLike(com.id, isLoggedIn)}
                  />{' '}
                  {getN(com.likes)} Likes
                </p>
                <p className='me-3'>
                  <HandThumbsDown
                    type='button'
                    onClick={() => AddDislike(com.id, isLoggedIn)}
                  />{' '}
                  {getN(com.dislikes)} Dislikes
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </div>
  ) : (
    <div>No comments.</div>
  )
}

export default Comment

function getN (i) {
  if (i === null || i === undefined) {
    return 0
  } else {
    return i.length
  }
}
