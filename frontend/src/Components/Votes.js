import { Component } from 'react'
import Card from 'react-bootstrap/Card'
import { HandThumbsUp, HandThumbsDown, Chat } from 'react-bootstrap-icons'

const Votes = props => {
  let isLoggedIn = props.isLoggedIn
  let post = props.post

  function getCookie (name) {
    var value = document.cookie
    var parts = value.split('=')
    if (parts.length === 2) return parts[1]
  }

  function AddLike (postID, isLoggedIn) {
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
            postID: Number(postID),
            commentID: 0
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

  function AddDislike (postID, isLoggedIn) {
    if (isLoggedIn) {
      try {
        fetch('http://localhost:8080/add-reaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            likeOrDislike: Number(-1),
            session: getCookie('sessionID'),
            postID: Number(postID),
            commentID: 0
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

  return (
    <div className='d-inline-flex'>
      <Card.Text className='me-3'>
        <HandThumbsUp
          type='button'
          onClick={() => AddLike(post.id, isLoggedIn)}
        />{' '}
        {getN(post.Likes)} Likes
      </Card.Text>
      <Card.Text className='me-3'>
        <HandThumbsDown
          type='button'
          onClick={() => AddDislike(post.id, isLoggedIn)}
        />{' '}
        {getN(post.Dislikes)} Dislikes
      </Card.Text>
      <Card.Text className='me-3'>
        <Chat /> {getN(post.comments)} Comments
      </Card.Text>
    </div>
  )
}

export default Votes

function getN (i) {
  if (i === null || i === undefined) {
    return 0
  } else {
    return i.length
  }
}
