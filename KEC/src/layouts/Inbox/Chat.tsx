import React, { useState } from "react";

import { MdOutlinePhoneInTalk } from "react-icons/md";
import { FiSend } from "react-icons/fi";
import { GoDeviceCameraVideo } from "react-icons/go";
import { GoPaperclip } from "react-icons/go";
import { BsEmojiSmile } from "react-icons/bs";
import { MdInfoOutline } from "react-icons/md";

interface ChatProps {
  onToggleRightSidebar: () => void;
}

const Chat: React.FC<ChatProps> = ({ onToggleRightSidebar }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Ish Amani",
      text: "Hello how are you?",
      time: "10hr ago",
      type: "text",
      prof:"/images/image.png"
    },
    {
      id: 2,
      sender: "You",
      text: "We have lake-front vacation rentals. No specific liability.",
      time: "10hr ago",
      type: "text",
      
    },
    {
      id: 3,
      sender: "You",
      text: "",
      time: "10hr ago",
      type: "image",
      image: "/images/chat.png", // Replace with actual image path
    },
    {
      id: 4,
      sender: "Ish Amani",
      text: "We have lake-front vacation rentals. No specific liability.",
      time: "10hr ago",
      type: "text",
      prof:"/images/image.png"
    },
    {
      id: 5,
      sender: "You",
      text: "elements.envato.com/close-up-... (link shortened)",
      time: "10hr ago",
      type: "link",
    },
    {
      id: 6,
      sender: "You",
      text: "",
      time: "3 days ago",
      type: "image",
      image: "/images/chat.png", // Replace with actual image path

    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "You",
          text: newMessage,
          time: "just now",
          type: "text",
        },
      ]);
      setNewMessage("");
    }
  };

  return (
    <div className="flex w-full flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4  bg-white text-black">
        <div className="flex items-center gap-2">
          <img
            src="/images/chat.png" // Replace with actual avatar path
            alt="Ish Amani"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">Ish Amani</h3>
            <p className="text-xs">Last seen today</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xl">
          <GoDeviceCameraVideo className="cursor-pointer" />
          <MdOutlinePhoneInTalk className="cursor-pointer" />
          <MdInfoOutline
            className="cursor-pointer"
            onClick={onToggleRightSidebar}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-2 p-4 scroll-hide items-center justify-center gap-1 overflow-y-auto bg-white">
  {messages.map((message) => (
    <div
      key={message.id}
      className={`flex items-start gap-2 my-3 ${
        message.sender === "You" ? "justify-end" : "justify-start"
      }`}
    >
      {message.sender !== "You" && (
        <img
          src="/images/chat.png"
          className="h-10 w-10 rounded-full"
          alt="Sender Avatar"
        />
      )}

      <div className={`max-w-[70%]`}>
        <div
          className={`${message.type === 'text' && message.text && 'p-2'} rounded-lg ${
            message.sender === "You"
              ? "bg-[#ECEDF3] text-black text-right"
              : "bg-[#e7ebfc] text-black text-left"
          }`}
        >
          {message.type === "text" && message.text}
          {message.type === "image" && (
            <img
              src={message.image}
              alt="Chat"
              className="max-w-[200px] rounded-md"
            />
          )}
          {message.type === "link" && (
            <a
              href={message.text}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline p-2 block"
            >
              {message.text}
            </a>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {message.time}
        </p>
      </div>
    </div>
  ))}
</div>


      {/* Input Area */}
      <div className="py-2 px-2  flex items-center gap-2 bg-gray-50">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write your message..."
          className="flex-1 p-1 rounded-md border border-gray-300 focus:outline-none "
        />
        <span className="text-gray-500 cursor-pointer"><BsEmojiSmile/></span>
        <span className="text-gray-500 cursor-pointer"><GoPaperclip/></span>
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white items-center justify-center p-2 rounded-md"
        >
          <FiSend/>
        </button>
      </div>
    </div>
  );
};

export default Chat;