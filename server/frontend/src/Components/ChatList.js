import React, { useState, useEffect } from 'react'
import Chat from './Chat'

function ChatList () {
  const [activeUsers, setActiveUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [anyoneOnline, setAnyoneOnline] = useState(false)

  const currentUser = JSON.parse(sessionStorage.getItem('userInfo'))

  useEffect(() => {
    fetchActiveUsers()
  }, [])

  function fetchActiveUsers () {
    fetch('http://localhost:8080/get-active-users', {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
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
      <h2>Active Users</h2>
      {anyoneOnline > 0 ? (
        <div>
          <ul>
            {activeUsers.map(user => (
              <li key={user.id} onClick={() => handleUserSelect(user)}>
                {user.username}
              </li>
            ))}
          </ul>
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
