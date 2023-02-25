import React, { useState, useEffect, useRef } from 'react'

function Chat (props) {
  const [sender, setSender] = useState(null)
  const [receiver, setReceiver] = useState(null)
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState('')
  const [anyMessages, setAnyMessages] = useState(false)

  useEffect(() => {
    let senderBefore = sender
    let receiverBefore = receiver
    // Get sender and receiver from props
    setSender(props.currentUser)
    setReceiver(props.otherUser)

    // Create a new WebSocket connection
    let newSocket
    try {
      newSocket = new WebSocket('ws://localhost:8080/get-messages')
    } catch (e) {
      console.log('Error establishing WebSocket connection:', e.message)
      return
    }
    // Handle errors that occur during the connection process
    newSocket.onerror = event => {
      console.error('WebSocket error:', event)
    }

    // Handle messages received from the server
    newSocket.onmessage = event => {
      let msgs = JSON.parse(event.data)
      if (msgs.length > 10) {
        msgs = msgs.slice(msgs.length - 10, msgs.length)
      }
      setMessages(msgs)
      if (messages !== null && messages.length > 0) {
        setAnyMessages(true)
        if (messages.length > 10) {
          setMessages(messages.slice(messages.length - 10, messages.length))
        }
      } else {
        setAnyMessages(false)
      }
    }

    // Save the socket connection to state
    setSocket(newSocket)
    // Send message after the connection is established

    if (sender != null && receiver != null) {
      newSocket.onopen = () => {
        newSocket.send(
          JSON.stringify({
            senderId: sender.id,
            receiverId: receiver.id,
            message: ''
          })
        )
      }
    }

    if (
      senderBefore != null &&
      receiverBefore != null &&
      sender != senderBefore &&
      receiver != receiverBefore
    ) {
      // Close the WebSocket connection when the component is unmounted
      return () => {
        newSocket.close()
      }
    }
  }, [props.currentUser, props.otherUser])

  const handleSendMessage = event => {
    event.preventDefault()
    // Send message to server
    socket.send(
      JSON.stringify({
        senderId: sender.id,
        receiverId: receiver.id,
        message: message
      })
    )
    // Update local messages state with new message
    if (messages == null) {
      messages = []
    }
    setMessages([
      ...messages,
      { senderId: sender.id, receiverId: receiver.id, message: message }
    ])
    if (messages.length > 10) {
      setMessages(messages.slice(messages.length - 10, messages.length))
    }
    setMessage('')
  }

  return (
    <div>
      <div>
        <ul>
          {anyMessages ? (
            messages.map((msg, index) => (
              <li key={index}>
                {msg.sender}: {msg.message}
              </li>
            ))
          ) : (
            <p>No messages</p>
          )}
        </ul>
        <form onSubmit={handleSendMessage}>
          <input
            type='text'
            value={message}
            onChange={event => setMessage(event.target.value)}
          />
          <button type='submit'>Send</button>
        </form>
      </div>
    </div>
  )
}

export default Chat
