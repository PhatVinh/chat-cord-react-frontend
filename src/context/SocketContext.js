import React from "react";
import { io } from 'socket.io-client';
import { baseURL } from "../utils/API";

export const SocketContext = React.createContext();
export const socket = io(baseURL);