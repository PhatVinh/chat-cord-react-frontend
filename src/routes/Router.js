import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Join from '../pages/join/Join';
import Chat from '../pages/chat/Chat';

const Router = () => {
    return (
        <Routes>
            <Route path="/" element={ <Join /> } />
            <Route path="/chat/:room" element={ <Chat /> } />
        </Routes>
    )
}

export default Router;