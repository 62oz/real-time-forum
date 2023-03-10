import React, { useState, useEffect } from 'react'
import Chat from './Chat'
import '../style.css'

let anyoneOnline2 = FontFaceSetLoadEvent

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
    if (!anyoneOnline) {
      let chatWindow = document.getElementById('chatWindow')
      chatWindow.style.display = 'none'
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
          anyoneOnline2 = true
        } else {
          setAnyoneOnline(false)
          anyoneOnline2 = false
        }
      })
      .catch(error => console.error(error))
  }

  function handleUserSelect (user) {
    if (selectedUser && user.id === selectedUser.id) {
      // Deselect the user if they're already selected.
      setSelectedUser(null)
    } else {
      // Select the clicked user
      setSelectedUser(user)
    }
  }

  return (
    <div className='chatContainer'>
      <button className='collapsible-button'>Messages</button>
      <div>
        {' '}
        <div id='chatList'>
          {anyoneOnline > 0 ? (
            <div className='chatListContent'>
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
          ) : (
            <p className='chatListContent'>No active users</p>
          )}
        </div>
        <div id='chatWindow'>
          {selectedUser && (
            <Chat currentUser={currentUser} otherUser={selectedUser} />
          )}
        </div>
      </div>
      <div id='clear'></div>
    </div>
  )
}

export default ChatList

let tries = 0

function Elements () {
  let collapsibleButton =
    document.getElementsByClassName('collapsible-button')[0]
  console.log(collapsibleButton)
  if (collapsibleButton !== null && collapsibleButton !== undefined) {
    console.log(collapsibleButton)
    collapsibleButton.addEventListener('click', () => {
      console.log("I'm clicked")
      const content = document.getElementById('chatList')
      collapsibleButton.classList.toggle('active')
      setTimeout(() => {
        content.style.display =
          content.style.display === 'block' ? 'none' : 'block'
      }, 10)
      if (anyoneOnline2) {
        const content2 = document.getElementById('chatWindow')
        setTimeout(() => {
          content2.style.display =
            content2.style.display === 'block' ? 'none' : 'block'
        }, 10)
      }
    })
  } else {
    setTimeout(Elements, 500)
  }
}

Elements()
