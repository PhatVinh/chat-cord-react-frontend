import './chat.css';
import { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import { makeRequest } from '../../utils/API';


const Chat = () => {
    // Num of message load more
    const limit = 20;
    const socket = useContext(SocketContext);
    const bottomDiv = useRef();
    const chatRef = useRef();
    const { room, username } = useParams();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [roomUsers, setRoomUsers] = useState([]);
    const [roomName, setRoomName] = useState('');
    // Num of skip when load more mess
    const [skip, setSkip] = useState(0);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
    const [chatDivHeight, setChatDivHeight] = useState();

    const submitChat = (e) => {
        e.preventDefault();
        socket.emit('chatMessage', messageText);
        setMessageText('');
        setShouldScrollToBottom(true);
    }

    function scrollHandler (){
        if(chatRef.current.scrollTop <= 50) {
            setShouldScrollToBottom(false);
            loadMoreMessages();
            chatRef.current.scroll({
                top: chatRef.current.scrollHeight - chatDivHeight,
                behavior: 'instant'
            })
        }
    }

    const userLeaveHandler = () => {
        socket.emit('leaveRoom');
        // Navigate to chat page 
        navigate(`/`);
    }

    const loadMoreMessages = () => {
        // Get the height of chat div so in the scrollHandler we can scroll back right into the coord where the user were
        setChatDivHeight(chatRef.current.scrollHeight);
        // Get room name 
        makeRequest({
            url: `message/${room}/${skip}/${limit}`,
            successCallback: (res) => {
                const { messages } = res;
                console.log(chats);
                let messagesReverse = messages.reverse();
                let chatsClone = [...chats];
                setChats([...messagesReverse, ...chatsClone]);
                setSkip(preState =>  preState + limit);
            },
            failureCallback: (err) => {
                console.log('Failed ', err);
            },
            requestType: 'GET'
        });
    }

    useEffect(() => {
        // Check username exits (in case user get into chat page with url)
        makeRequest({
            url: `user/check-username/${username}`,
            successCallback: (res) => {
                if(res.isValid === false){
                    // Navigate to chat page 
                    navigate(`/`, {state: username});
                    return;
                }
                // Join room 
                socket.emit('joinRoom', { userName: username, roomId: room });
                
                // Get username
                socket.on('userName', (userName) => {
                    setUserName(userName);
                });
                
                // Get room name 
                makeRequest({
                    url: `room/${room}`,
                    successCallback: (res) => {
                        const { room } = res;
                        setRoomName(room.name);
                    },
                    failureCallback: (err) => {
                        console.log('Failed ', err);
                    },
                    requestType: 'GET'
                });

                // Get room messages 
                loadMoreMessages();  
                
                // Scroll to bottom
                bottomDiv.current.scrollIntoView({
                    behavior: 'smooth',
                });   
                
            },
            failureCallback: (err) => {
                console.log('Failed ', err);
            },
            requestType: 'GET'
        });

        // // Add scroll event listener
        // chatRef.current.addEventListener('scroll', scrollHandler);

        return () => {
            // Remove all listener when use leave page
            socket.removeAllListeners();
            // chatRef.current.removeEventListener('scroll', scrollHandler);
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
            console.log(message);   
            let chatsClone = [...chats];
            chatsClone.push(message);
            setChats(chatsClone);
        });
        if(shouldScrollToBottom) {
            bottomDiv.current.scrollIntoView({
                behavior: 'smooth',
            });
        }
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
                <h2 id="room-name" className='active'>{roomName}</h2>
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
                <div ref={chatRef} className="chat-messages" onScroll={() => scrollHandler()}>
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