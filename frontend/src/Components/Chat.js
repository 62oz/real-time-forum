import React, { useState, useEffect, useRef } from 'react'
import '../style.css'

function Chat (props) {
  const [me, setMe] = useState(null)
  const [other, setOther] = useState(null)
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [message, setMessage] = useState('')
  const [allMessages, setAllMessages] = useState([])
  const [anyMessages, setAnyMessages] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  let initialised = false

  const chatAreaRef = useRef(null)

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
            let allmsgs = JSON.parse(event.data)
            //sort by date
            allmsgs.sort((a, b) => {
              return new Date(a.date) - new Date(b.date)
            })
            setAllMessages(allmsgs)
            // Get top 10 messages
            let msgs = allmsgs.slice(allmsgs.length - 10, allmsgs.length)

            if (!initialised) {
              // sort by date
              msgs.sort((a, b) => {
                return new Date(a.date) - new Date(b.date)
              })
              setMessages(msgs)
              initialised = true
            } else {
              let updatedMessages = [...msgs, ...messages]
              // sort by date
              updatedMessages.sort((a, b) => {
                return new Date(a.date) - new Date(b.date)
              })
              setMessages(updatedMessages)
            }
            const chatArea = chatAreaRef.current
            chatArea.scrollTop = chatArea.scrollHeight
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
  }, [props.currentUser, props.otherUser, socket, me, other])

  useEffect(() => {
    if (messages !== null && messages.length > 0) {
      setAnyMessages(true)
    } else {
      setAnyMessages(false)
    }
  }, [messages])

  const handleScroll = () => {
    const chatArea = chatAreaRef.current
    if (chatArea.scrollTop === 0 && !loading && hasMore) {
      setLoading(true)
      setTimeout(() => {
        // Load more messages
        let newMessages = []
        let updatedMessages = []
        if (allMessages.length > messages.length + 10) {
          newMessages = allMessages.slice(
            allMessages.length - messages.length - 10,
            allMessages.length - messages.length
          )
          updatedMessages = [...messages, ...newMessages]
        } else {
          updatedMessages = allMessages
        }
        // sort updated messages by date
        updatedMessages.sort((a, b) => {
          return new Date(a.date) - new Date(b.date)
        })

        // update state
        setMessages(updatedMessages)

        setLoading(false)
        if (newMessages.length < 10) {
          setHasMore(false)
        }
      }, 500)
    }
  }

  useEffect(() => {
    const chatArea = chatAreaRef.current

    if (chatArea) {
      chatArea.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (chatArea) {
        chatArea.removeEventListener('scroll', handleScroll)
      }
    }
  }, [handleScroll])

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

    setMessage('')
  }

  useEffect(() => {
    const chatArea = chatAreaRef.current
    if (chatArea) {
      // Scroll to the bottom of the chat area on initial load
      chatArea.scrollTop = chatArea.scrollHeight
      // Add event listener for scrolling
      chatArea.addEventListener('scroll', handleScroll)
    }
    return () => {
      if (chatArea) {
        // Remove event listener when component is unmounted
        chatArea.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])
  return (
    <div id='personalChatContainer'>
      <div className='chatArea' ref={chatAreaRef}>
        {loading && <p>Loading messages...</p>}
        {anyMessages ? (
          messages.map((msg, index) => (
            <div
              className={`individualMessage ${
                msg.sender == me.username ? 'sent-message' : 'received-message'
              }`}
              key={index}
            >
              {' '}
              <div className='messageContent'>{msg.message}</div>
            </div>
          ))
        ) : (
          <p>No messages</p>
        )}
        {!loading && !hasMore && (
          <p>You have reached the end of the chat history</p>
        )}
      </div>
      <form onSubmit={handleSendMessage} className='sendMessageForm'>
        <button className='chatSendButton' type='submit'>
          Send
        </button>
        <input
          className='chatTextInput'
          type='textArea'
          value={message}
          onChange={event => setMessage(event.target.value)}
        />
      </form>
    </div>
  )
}

export default Chat
