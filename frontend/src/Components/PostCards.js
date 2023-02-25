import { Card, Col, Row, Spinner } from 'react-bootstrap'

import {
  HandThumbsUp,
  HandThumbsDown,
  Chat,
  ArrowRight
} from 'react-bootstrap-icons'

const PostCards = props => {
  let isLoggedIn = props.isLoggedIn
  let items = props.items

  let categories = props.categoriesFromToggle
  let postTypes = props.postTypesFromToggle
  let reactCommentedPosts = props.reactCommentedPosts

  let currentPage = document.URL.split('/')[document.URL.split('/').length - 1]

  if (items !== undefined && categories !== undefined) {
    if (categories.length === 0 && postTypes.length === 0) {
    } else {
      items = items.filter(item => {
        if (categories.length > 0 && postTypes.length === 0) {
          let found = categories.some(category =>
            item.categories.includes(category)
          )
          if (found) {
            return item
          }
        } else if (categories.length === 0 && postTypes.length > 0) {
          if (postTypes.length === 1) {
            if (postTypes[0] === 'ReactedPosts') {
              return reactCommentedPosts.reactedPosts.includes(item.id)
            } else if (postTypes[0] === 'CommentedPosts') {
              return reactCommentedPosts.commentedPosts.includes(item.id)
            }
          } else if (postTypes.length === 2) {
            return (
              reactCommentedPosts.reactedPosts.includes(item.id) &&
              reactCommentedPosts.commentedPosts.includes(item.id)
            )
          }
        } else if (categories.length > 0 && postTypes.length > 0) {
          let found = categories.some(category =>
            item.categories.includes(category)
          )
          if (found) {
            if (postTypes.length === 1) {
              if (postTypes[0] === 'ReactedPosts') {
                return reactCommentedPosts.reactedPosts.includes(item.id)
              } else if (postTypes[0] === 'CommentedPosts') {
                return reactCommentedPosts.commentedPosts.includes(item.id)
              }
            } else if (postTypes.length === 2) {
              return (
                reactCommentedPosts.reactedPosts.includes(item.id) &&
                reactCommentedPosts.commentedPosts.includes(item.id)
              )
            }
          } else {
            return
          }
        }
      })
    }
  }

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
            postID: postID,
            commentID: 0
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
            likeOrDislike: -1,
            session: getCookie('sessionID'),
            postID: postID,
            commentID: 0
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

  function Comment () {
    window.location.href = '/single-post'
  }
  return items ? (
    <Row xs={1} md={1} lg={1} className='g-4'>
      {items
        .slice()
        .reverse()
        .map(item => (
          <Col key={item.id}>
            <Card>
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <small className='text-muted'>Posted by: {item.author}</small>
                <Card.Text>{item.content}</Card.Text>
                <div className='d-inline-flex'>
                  <Card.Text className='me-3'>
                    <HandThumbsUp
                      type='button'
                      onClick={() => AddLike(item.id, isLoggedIn)}
                    />{' '}
                    {getN(item.Likes)} Likes
                  </Card.Text>
                  <Card.Text className='me-3'>
                    <HandThumbsDown
                      type='button'
                      onClick={() => AddDislike(item.id, isLoggedIn)}
                    />{' '}
                    {getN(item.Dislikes)} Dislikes
                  </Card.Text>
                  <Card.Text className='me-3' onClick={Comment}>
                    <Chat /> {getN(item.comments)} Comments
                  </Card.Text>
                </div>
                <div
                  className='d-flex justify-content-end'
                  type='button'
                  onClick={() => getArticle(item.id, isLoggedIn)}
                >
                  <p className='fw-bold'>
                    {' '}
                    ...Read more <ArrowRight />
                  </p>
                </div>
              </Card.Body>
              <Card.Footer>
                <small className='text-muted'>{item.categories}</small>
              </Card.Footer>
            </Card>
          </Col>
        ))}
    </Row>
  ) : currentPage !== 'account' ? (
    <Spinner animation='border' role='status'>
      <span className='visually-hidden'>Loading...</span>
    </Spinner>
  ) : (
    <div>Nothing yet!</div>
  )
}

export default PostCards

function getN (i) {
  if (i === null || i === undefined) {
    return 0
  } else {
    return i.length
  }
}

function getArticle (id, isLoggedIn) {
  console.log('getArticle')
  if (isLoggedIn) {
    window.location.href = '/articles/' + id
  } else {
    alert('Login to read articles.')
  }
}
