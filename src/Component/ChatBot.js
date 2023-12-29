import { useEffect, useState } from "react";
import { PaperAirplaneIcon , UserCircleIcon } from '@heroicons/react/24/outline'

import LoadingImage from '../Assets/typing.gif'
import EpisycheLogo from '../Assets/episyche_logo.svg'
import GettrsearchLogo from '../Assets/searchlogo.svg'
import BotIcon from '../Assets/bot-icon-1.png'

// const backendApi = 'http://127.0.0.1:8000'

const backendApi = 'http://44.209.41.243:8000'

export default function ChatBot() {


    const [roomId, setRoomId] = useState(null)
    const [inputMessage, setInputMessage] = useState("");
    const [messages, setMessages] = useState([])
    const [typing, setTyping] = useState(false);

    const [loadingGif, setLoadingGif] = useState(false)

    const [createsocket, setcreatesocket] = useState(null)

    useEffect(() => {
        let roomId_tmp = localStorage.getItem('roomId')
        if (roomId_tmp) {
            setRoomId(roomId_tmp)
        } else {
            createRoom()
        }
    }, [])

    useEffect(() => {
        if (roomId) {
            // let socket = new WebSocket(
            //     `ws://127.0.0.1:8000/ws/${roomId}/chat/`
            // );
            let socket = new WebSocket(
                `ws://44.209.41.243:8000/ws/${roomId}/chat/`
            );
            setcreatesocket(socket)
        }
    }, [roomId])

    useEffect(() => {
        if (createsocket) {
            createsocket.onmessage = (event) => {
                const data = JSON.parse(event.data)
                if ((data.length !== 0) && (data.length !== undefined)) {
                    for (let index = 0; index < data.length; index++) {
                        const element = data[index];
                        if (roomId === element.roomId) {
                            if (element.action === "message") {
                                setTyping(false);
                            } else if (data.action === "typing") {
                                setTyping(data.typing);
                            }
                        }
                    }
                } else {
                    if (roomId === data.roomId) {
                        if (data.action === "message") {
                            const updateData = [...messages]
                            updateData.push(data)
                            setMessages(updateData)
                            setLoadingGif(false)
                            setTyping(false);
                        } else if (data.action === "typing") {
                            setTyping(data.typing);
                        }
                    }
                }
            }
        }
    }, [createsocket, messages])



    async function getMessagesByChatRooms(roomId) {
        await fetch(`${backendApi}/chat/room/${roomId}/messages`, {
            method: 'GET'
        }
        ).then((response) => {
            return response.json()
        }).then(data => {
            setMessages(data)
        }).catch(error => {
            console.log('error----- ', error)
        });
    }

    async function createRoom() {
        await fetch(`${backendApi}/chat/room`, {
            method: 'POST'
        }
        ).then((response) => {
            return response.json()
        }).then(data => {
            localStorage.setItem('roomId', data.roomId)
            setRoomId(data.roomId)
        }).catch(error => {
            console.log('error----- ', error)
        });
    }

    useEffect(() => {
        getMessagesByChatRooms(roomId)
    }, [roomId])

    const messageSubmitHandler = (event) => {
        event.preventDefault();
        if (roomId !== null) {
            if (inputMessage) {
                console.log('inputMessage --- ', inputMessage)
                createsocket.send(
                    JSON.stringify({
                        action: "message",
                        message: inputMessage,
                        roomId: roomId,
                    })
                );
            }
            const prevMessage = [...messages]
            console.log(prevMessage)
            prevMessage.push({
                action: "message",
                message: inputMessage,
                roomId: roomId,
                system: false
            })
            setMessages(prevMessage)
            setLoadingGif(true)
            setInputMessage("");
        }
    };

    return (
        <>
            <div className="bg-black py-10">
                <div className="w-[1100px] mx-auto">
                    <div className="mx-10 ">
                        <div className="bg-[#2f2f2f] rounded-t-lg px-8 py-4 flex gap-5 items-center">
                            <img src={GettrsearchLogo} alt="logo" width={70} height={100} />
                            <div>
                                <h1 className="text-white font-bold text-xl">Gettrsearch ChatBot</h1>
                            </div>
                        </div>
                        <div className=" bg-white h-[600px] overflow-y-scroll">
                            {messages.length !== 0 ?
                                <div className="px-4 py-6">
                                    {messages.map((data) => (
                                        <>
                                            {data.system === false ?
                                                <div>
                                                    <div className="rounded px-4 py-4 text-wrap flex justify-end items-center">
                                                        <div className="max-w-[50%] min-w-[50%]  px-4 text-right">
                                                            {data.message}
                                                        </div>
                                                        <UserCircleIcon width={40} height={40}/>
                                                    </div>
                                                </div>
                                                :
                                                <div className="flex gap-3 ">
                                                    <div>
                                                        <img src={BotIcon} alt="bot icon" width={50} height={50} />
                                                    </div>
                                                    <div className="rounded bg-gray-200 px-4 w-fit">
                                                        <div className="py-4">
                                                            {data.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </>
                                    ))}
                                </div>
                                : <div className="mx-auto w-fit">No messages</div>}
                            {loadingGif === true ?
                                <div className="pl-12">
                                    <img src={LoadingImage} alt="My GIF" width={100} height={100} />
                                </div>
                                : ""
                            }
                        </div>
                        <div className=" bg-white border">
                            <div className="flex px-[100px] min-w-[50%] py-4 items-center gap-2">
                                <input
                                    type="text"
                                    className="w-full border rounded-[12px] h-10 px-3"
                                    placeholder="Send a message..."
                                    onChange={(event) => setInputMessage(event.target.value)}
                                    value={inputMessage}
                                ></input>
                                <div className="bg-[#2f2f2f] rounded-full p-2" onClick={(e) => messageSubmitHandler(e)}>
                                    <PaperAirplaneIcon width={25} height={25} className="text-white" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#2f2f2f] rounded-b-lg h-[25px]">
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}