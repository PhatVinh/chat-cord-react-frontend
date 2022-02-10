import './chat.css';
import { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';


const Chat = () => {
    const socket = useContext(SocketContext);
    const bottomDiv = useRef();
    const { room } = useParams();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [roomUsers, setRoomUsers] = useState([]);

    const submitChat = (e) => {
        e.preventDefault();
        socket.emit('chatMessage', messageText);
        setMessageText('');
    } 

    const userLeaveHandler = () => {
        socket.emit('leaveRoom');
        // Navigate to chat page 
        navigate(`/`);
    }

    // Get user name 
    useEffect(() => {
        socket.on('userName', (userName) => {
            setUserName(userName);
        });

        return () => {
            // Remove all listener when use leave page
            socket.removeAllListeners();
        }
    }, []);

    // Get room users 
    useEffect(() => {
        socket.on('roomUsers', (usersData) => {
            setRoomUsers(usersData);
        });
        
        return () => {
            socket.removeAllListeners("roomUsers");
        }
    }, [roomUsers]);

    useEffect(() => {
        socket.on('message', (message) => {
            let chatsClone = [...chats];
            chatsClone.push(message);
            setChats(chatsClone);
        });

        // Scroll to bottom
        bottomDiv.current.scrollIntoView({ behavior: "smooth" });

        return () => {
            socket.removeAllListeners("message");
        }
    }, [chats]);

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile" /> ChatCord</h1>
                <button onClick={() => {userLeaveHandler()}} className="btn">Leave Room</button>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                <h3><i className="fas fa-comments" /> Room Name:</h3>
                <h2 id="room-name" className='active'>{room}</h2>
                <h3><i className="fas fa-users" /> Users</h3>
                <ul id="users">
                    {
                        roomUsers.map((user, index) => {
                            return user.userName === userName ?
                            (
                                <li key={index} className="active">
                                    {user.userName}
                                </li>
                            )
                            :
                            (
                                <li key={index}>
                                    {user.userName}
                                </li>
                            )
                        })
                    }
                </ul>
                </div>
                <div className="chat-messages">
                    {
                        chats.map((chat, index) => {
                            return (
                                <div key={ index } className='message'>
                                    <p className="meta">{chat.username} <span>{chat.time}</span></p>
                                    <p className="text">
                                        {chat.text}
                                    </p>
                                </div>
                            )
                    
                        })
                    }
                    {/* use for scroll down every a new mess show up */}
                    <div ref={bottomDiv}></div>
                </div>
            </main>
            <div className="chat-form-container">
                <form id="chat-form" onSubmit={(e) => submitChat(e)}>
                    <input id="msg" type="text" placeholder="Enter Message" required autoComplete="off" value={messageText} onChange={(e) => setMessageText(e.target.value)}/>
                    <button className="btn"><i className="fas fa-paper-plane" /> Send</button>
                </form>
            </div>
        </div>
    );
}

export default Chat;