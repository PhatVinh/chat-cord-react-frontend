import './chat.css';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';


const Chat = () => {
    const socket = useContext(SocketContext);
    const { room } = useParams();

    const [chats, setChats] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState("Phat");
    const [roomUsers, setRoomUsers] = useState([]);

    const submitChat = (e) => {
        e.preventDefault();
        socket.emit('chatMessage', messageText);
        setMessageText('');
    } 

    useEffect(() => {
        socket.on('message', (message) => {
            let chatsClone = [...chats];
            chatsClone.push(message);
            setChats(chatsClone);
        });
    }, [chats]);

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile" /> ChatCord</h1>
                <a href="index.html" className="btn">Leave Room</a>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                <h3><i className="fas fa-comments" /> Room Name:</h3>
                <h2 id="room-name">{room}</h2>
                <h3><i className="fas fa-users" /> Users</h3>
                <ul id="users">
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