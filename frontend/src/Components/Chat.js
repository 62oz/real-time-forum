import React, { useState, useEffect, useRef } from 'react'

function Chat (props) {
  const [sender, setSender] = useState(null)
  const [receiver, setReceiver] = useState(null)
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
    let senderBefore = sender
    let receiverBefore = receiver
    // Get sender and receiver from props
    setSender(props.currentUser)
    setReceiver(props.otherUser)

    // Create a new WebSocket connection
    if (socket === null) {
      connectToWebSocket()
        .then(newSocket => {
          // Handle messages received from the server
          newSocket.onmessage = event => {
            let msgs = JSON.parse(event.data)
            /*             if (msgs !== null && msgs.length > 10) {
              msgs = msgs.slice(msgs.length - 10, msgs.length)
            } */
            console.log('msgs', msgs)
            //Reverse order of msgs
            msgs = msgs.reverse()
            setMessages(msgs)
          }

          // Save the socket connection to state
          setSocket(newSocket)

          // Send message after the connection is established
          if (sender != null && receiver != null) {
            console.log('Preliminary message')
            newSocket.send(
              JSON.stringify({
                senderId: sender.id,
                receiverId: receiver.id,
                message: ''
              })
            )
          }
        })
        .catch(error => console.error('Failed to connect to WebSocket:', error))
    } else {
      // Handle when sender and receiver are updated
      if (
        senderBefore != null &&
        receiverBefore != null &&
        sender != senderBefore &&
        receiver != receiverBefore
      ) {
        // Close the WebSocket connection when the component is unmounted
        return () => {
          console.log('Closing WebSocket connection')
          socket.close()
        }
      }
    }
  }, [
    props.currentUser,
    props.otherUser,
    socket,
    sender,
    receiver,
    messages,
    setMessages
  ])

  useEffect(() => {
    console.log('messages', messages)
    if (messages !== null && messages.length > 0) {
      setAnyMessages(true)
      /*       if (messages.length > 10) {
        setMessages(messages.slice(messages.length - 10, messages.length))
      } */
    } else {
      setAnyMessages(false)
    }
  }, [messages])

  const handleSendMessage = event => {
    event.preventDefault()
    // Send message to server
    socket.send(
      JSON.stringify({
        senderId: sender.id,
        receiverId: receiver.id,
        message: message,
        date: Date.now()
      })
    )
    // Update local messages state with new message
    if (messages == null) {
      setMessages([])
    }
    setMessages([
      { senderId: sender.id, receiverId: receiver.id, message: message },
      ...messages
    ])
    /*     if (messages.length > 10) {
      setMessages(messages.slice(messages.length - 10, messages.length))
    } */
    setMessage('')
  }

  return (
    <div>
      <div>
        <div style={{ height: '200px', overflow: 'scroll' }}>
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
        </div>
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
