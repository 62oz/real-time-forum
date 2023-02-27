import React, { useState, useEffect } from 'react'
import Chat from './Chat'
import '../style.css'

function ChatList () {
  const [activeUsers, setActiveUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [anyoneOnline, setAnyoneOnline] = useState(false)

  const currentUser = JSON.parse(sessionStorage.getItem('userInfo'))

  useEffect(() => {
    fetchActiveUsers()
    let unreadNotifications = document.getElementsByClassName('unreadMessages')
    for (let i = 0; i < unreadNotifications.length; i++) {
      if (unreadNotifications[i].innerHTML === '0') {
        unreadNotifications[i].style.display = 'none'
      }
    }
  }, [activeUsers])

  function fetchActiveUsers () {
    let id = 0
    if (currentUser) {
      id = currentUser.id
    }
    // Send current user to the server then get list of active users
    fetch('http://localhost:8080/get-active-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    })
      .then(response => response.json())
      .then(data => {
        setActiveUsers(data)
        if (data !== null && data.length > 0) {
          setAnyoneOnline(true)
        } else {
          setAnyoneOnline(false)
        }
      })
      .catch(error => console.error(error))
  }

  function handleUserSelect (user) {
    if (selectedUser && user.id === selectedUser.id) {
      // Deselect the user if they're already selected
      setSelectedUser(null)
    } else {
      // Select the clicked user
      setSelectedUser(user)
    }
  }

  return (
    <div>
      <h2>Online</h2>
      {anyoneOnline > 0 ? (
        <div className='chatList'>
          <div>
            {activeUsers.map(user => (
              <div
                className='onlineUser'
                key={user.id}
                onClick={() => handleUserSelect(user)}
              >
                <div className='onlineUsername'>{user.username}</div>{' '}
                <div className='unreadMessages'>{user.unread}</div>
              </div>
            ))}
          </div>
          {selectedUser && (
            <Chat currentUser={currentUser} otherUser={selectedUser} />
          )}
        </div>
      ) : (
        <p>No active users</p>
      )}
    </div>
  )
}

export default ChatList
