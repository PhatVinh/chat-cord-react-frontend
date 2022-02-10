import './App.css';
import { BrowserRouter } from 'react-router-dom';
import Router from './routes/Router';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { SocketContext, socket } from './context/SocketContext';

function App() {

	return (
		<>	
			<SocketContext.Provider value = {socket} >
				<BrowserRouter>
					<Router />
				</BrowserRouter>
			</SocketContext.Provider>
		</>
	);
}

export default App;
