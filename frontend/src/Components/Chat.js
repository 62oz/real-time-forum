import React, { useState, useEffect, useRef } from 'react'
import '../style.css'

function Chat (props) {
  const [me, setMe] = useState(null)
  const [other, setOther] = useState(null)
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState('')
  const [anyMessages, setAnyMessages] = useState(false)

  const connectToWebSocket = async () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('Attempting to connect to WebSocket...')
        const newSocket = new WebSocket('ws://localhost:8080/get-messages')

        // Handle errors that occur during the connection process
        newSocket.onerror = event => {
          console.error('WebSocket error:', event)
          reject(event)
        }

        // Handle when the WebSocket connection is open
        newSocket.onopen = () => {
          console.log('WebSocket connection established.')
          resolve(newSocket)
        }
      } catch (e) {
        console.log('Error establishing WebSocket connection:', e.message)
        reject(e)
      }
    })
  }
  useEffect(() => {
    let meBefore = me
    let otherBefore = other
    // Get sender and receiver from props
    setMe(props.currentUser)
    setOther(props.otherUser)
    // Create a new WebSocket connection
    if (socket === null) {
      connectToWebSocket()
        .then(newSocket => {
          // Handle messages received from the server
          newSocket.onmessage = event => {
            let msgs = JSON.parse(event.data)
            //Reverse order of msgs
            msgs = msgs.reverse()
            setMessages(msgs)
          }

          // Save the socket connection to state
          setSocket(newSocket)

          // Send message after the connection is established
          if (me != null && other != null) {
            console.log('Preliminary message')
            newSocket.send(
              JSON.stringify({
                senderId: me.id,
                receiverId: other.id,
                sender: me.username,
                receiver: other.username,
                message: ''
              })
            )
          }
        })
        .catch(error => console.error('Failed to connect to WebSocket:', error))
    } else {
      // Handle when sender and receiver are updated
      if (
        meBefore != null &&
        otherBefore != null &&
        me !== meBefore &&
        other !== otherBefore
      ) {
        // Close the WebSocket connection when the component is unmounted
        return () => {
          console.log('Closing WebSocket connection')
          socket.close()
        }
      }
    }
  }, [props.currentUser, props.otherUser, socket, me, other, messages])

  useEffect(() => {
    if (messages !== null && messages.length > 0) {
      setAnyMessages(true)
    } else {
      setAnyMessages(false)
    }
  }, [messages])

  const handleSendMessage = event => {
    event.preventDefault()
    // Send message to server
    socket.send(
      JSON.stringify({
        senderId: me.id,
        receiverId: other.id,
        sender: me.username,
        receiver: other.username,
        message: message,
        date: Date.now()
      })
    )
    // Update local messages state with new message
    if (messages == null) {
      setMessages([])
    }
    setMessages([
      {
        sender: me.username,
        receiver: other.username,
        message: message
      },
      ...messages
    ])

    setMessage('')
  }

  return (
    <div>
      <div>
        <div
          className='chatArea'
          style={{ height: '200px', overflow: 'scroll' }}
        >
          <div>
            {anyMessages ? (
              messages.map((msg, index) => (
                <div className='individualMessage' key={index}>
                  <div className='messageSender'>{msg.sender}:</div>{' '}
                  <div className='messageContent'>{msg.message}</div>
                </div>
              ))
            ) : (
              <p>No messages</p>
            )}
          </div>
        </div>
        <form onSubmit={handleSendMessage}>
          <input
            className='chatTextInput'
            type='text'
            value={message}
            onChange={event => setMessage(event.target.value)}
          />
          <button className='chatSendButton' type='submit'>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat
