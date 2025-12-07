
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatMessage, MessageType, Language, MessageStatus } from '../types';
import { translations } from '../services/translations';

interface ChatProps {
  user: User;
  language: Language;
  messages: ChatMessage[];
  onSendMessage: (msg: ChatMessage) => void;
  onClearChat: () => void;
  onReportUser: () => void;
}

export const Chat: React.FC<ChatProps> = ({ user, language, messages, onSendMessage, onClearChat, onReportUser }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSimulatingAudio, setIsSimulatingAudio] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = translations[language];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = () => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.email,
      senderName: `${user.firstName} ${user.lastName}`,
      content: inputText,
      mediaType: MessageType.TEXT,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: MessageStatus.SENT
    };
    onSendMessage(msg);
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const isAudio = file.type.startsWith('audio');
        const msg: ChatMessage = {
          id: Date.now().toString(),
          senderId: user.email,
          senderName: `${user.firstName} ${user.lastName}`,
          mediaUrl: reader.result as string,
          mediaType: isAudio ? MessageType.AUDIO : MessageType.VIDEO, 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: true,
          status: MessageStatus.SENT
        };
        onSendMessage(msg);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media API not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const msg: ChatMessage = {
            id: Date.now().toString(),
            senderId: user.email,
            senderName: `${user.firstName} ${user.lastName}`,
            mediaUrl: audioUrl,
            mediaType: MessageType.AUDIO,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: MessageStatus.SENT
        };
        onSendMessage(msg);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsSimulatingAudio(false);

    } catch (err: any) {
      console.warn("Error accessing microphone:", err);
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.message.includes('not found') || err.message === "Media API not supported") {
          setIsSimulatingAudio(true);
          setIsRecording(true);
          return;
      }
      alert("Microphone access denied or error: " + err.message);
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;

    if (isSimulatingAudio) {
        setIsRecording(false);
        setIsSimulatingAudio(false);
        
        // Simulating the message without explicit "Demo" text
        const msg: ChatMessage = {
            id: Date.now().toString(),
            senderId: user.email,
            senderName: `${user.firstName} ${user.lastName}`,
            content: "🎤 [Voice Message]",
            mediaType: MessageType.TEXT, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: MessageStatus.SENT
        };
        onSendMessage(msg);
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleClearChat = () => {
      onClearChat();
      setShowOptions(false);
  };

  const handleReport = () => {
      onReportUser();
      setShowOptions(false);
  }

  const getStatusIcon = (status?: MessageStatus) => {
    if (!status) return null;
    switch (status) {
      case MessageStatus.SENT:
        return <span className="material-symbols-outlined text-[14px] text-white/70">check</span>;
      case MessageStatus.DELIVERED:
        return <span className="material-symbols-outlined text-[14px] text-white/70">done_all</span>;
      case MessageStatus.READ:
        return <span className="material-symbols-outlined text-[14px] text-blue-200 font-bold" style={{ textShadow: '0 0 2px rgba(0,0,0,0.2)' }}>done_all</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm z-10 sticky top-0 border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex justify-between items-center">
             <div className="flex items-center space-x-3">
                <div className="relative">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        G
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                </div>
                <div>
                    <h2 className="font-bold text-gray-800 dark:text-white">Community Chat</h2>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center">
                        <span className="relative flex h-2 w-2 mr-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        {t.online} (124)
                    </p>
                </div>
             </div>
             
             <div className="relative">
                <button 
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                    <span className="material-symbols-outlined">more_vert</span>
                </button>
                
                {/* Dropdown Menu */}
                {showOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <button 
                          onClick={handleClearChat}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">delete_sweep</span>
                            Clear Chat
                        </button>
                        <button 
                          onClick={handleReport}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">flag</span>
                            Report User
                        </button>
                    </div>
                )}
             </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl p-3 shadow-sm transition-colors relative group ${
                msg.isMe 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
            }`}>
               {!msg.isMe && (
                   <p className="text-[10px] font-bold opacity-60 mb-1">{msg.senderName}</p>
               )}

               {msg.mediaType === MessageType.TEXT && (
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
               )}
               
               {msg.mediaType === MessageType.AUDIO && msg.mediaUrl && (
                   <div className="flex items-center space-x-2 min-w-[150px] bg-white/10 p-2 rounded-lg">
                       <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                           <span className="material-symbols-outlined text-lg">play_arrow</span>
                       </button>
                       <div className="h-1 bg-white/30 flex-1 rounded-full overflow-hidden">
                           <div className="h-full bg-white w-1/3"></div>
                       </div>
                       <audio src={msg.mediaUrl} controls className="hidden" /> 
                   </div>
               )}

               {msg.mediaType === MessageType.VIDEO && msg.mediaUrl && (
                   <div className="rounded-lg overflow-hidden mt-1">
                       {msg.mediaUrl.startsWith('data:image') ? (
                           <img src={msg.mediaUrl} alt="Shared" className="max-w-full h-auto max-h-48" />
                       ) : (
                           <video src={msg.mediaUrl} controls className="max-w-full h-auto max-h-48" />
                       )}
                   </div>
               )}

               <div className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${msg.isMe ? 'text-emerald-100' : 'text-gray-400'}`}>
                   <span>{msg.timestamp}</span>
                   {msg.isMe && getStatusIcon(msg.status)}
               </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 p-3 shadow-lg border-t border-gray-200 dark:border-gray-700 sticky bottom-0 z-20 transition-colors">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide">
             {t.quickReplies.map((reply: string) => (
                 <button 
                    key={reply}
                    onClick={() => {
                        const msg: ChatMessage = {
                            id: Date.now().toString(),
                            senderId: user.email,
                            senderName: `${user.firstName} ${user.lastName}`,
                            content: reply,
                            mediaType: MessageType.TEXT,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            isMe: true,
                            status: MessageStatus.SENT
                        };
                        onSendMessage(msg);
                    }}
                    className="whitespace-nowrap px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                 >
                     {reply}
                 </button>
             ))}
        </div>

        <div className="flex items-center space-x-2">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="video/*,image/*"
                className="hidden" 
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined text-2xl">attach_file</span>
            </button>
            
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center px-4 py-2 transition-colors">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder={isRecording ? (isSimulatingAudio ? "Recording..." : t.recording) : t.chatPlaceholder}
                    disabled={isRecording}
                    className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-white placeholder-gray-400"
                />
            </div>

            {inputText ? (
                 <button 
                    onClick={handleSendText}
                    className="p-3 bg-primary text-white rounded-full shadow-md hover:bg-emerald-700 transition-colors"
                 >
                    <span className="material-symbols-outlined text-xl">send</span>
                 </button>
            ) : (
                 <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={`p-3 rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${
                        isRecording 
                        ? 'bg-red-500 text-white scale-110 animate-pulse' 
                        : 'bg-primary text-white hover:bg-emerald-700'
                    }`}
                 >
                    <span className="material-symbols-outlined text-xl">{isRecording ? 'mic_off' : 'mic'}</span>
                 </button>
            )}
        </div>
        <div className="text-center mt-1">
             <span className="text-[10px] text-gray-400 dark:text-gray-500">
                 {isRecording ? t.recording : t.tapToRecord}
             </span>
        </div>
      </div>
    </div>
  );
};
