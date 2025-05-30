import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, Image, StopCircle } from 'lucide-react';

const AiChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const handleSendMessage = async () => {
        if (!input.trim() && !selectedImage) return;

        const newMessage = {
            type: 'user',
            content: input,
            image: selectedImage,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', input);

            if (selectedImage) {
                // Convert base64 to blob
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                formData.append('image', blob);
            }

            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setMessages(prev => [...prev, {
                type: 'ai',
                content: data.response,
                timestamp: new Date().toISOString()
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
                // TODO: Implement speech-to-text conversion
                const formData = new FormData();
                formData.append('audio', audioBlob);

                try {
                    const response = await fetch('/api/speech-to-text', {
                        method: 'POST',
                        body: formData,
                    });
                    const data = await response.json();
                    setInput(data.text);
                } catch (error) {
                    console.error('Speech to text error:', error);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-screen bg-black/95"
        >
            {/* Header */}
            <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
                <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-lg ${message.type === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-white/90'
                                }`}
                        >
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Uploaded"
                                    className="max-w-full h-auto rounded-lg mb-2"
                                />
                            )}
                            <p>{message.content}</p>
                            <span className="text-xs opacity-50 mt-1 block">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white/10 text-white/90 p-3 rounded-lg">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
                <div className="p-2 border-t border-white/10">
                    <div className="relative inline-block">
                        <img
                            src={selectedImage}
                            alt="Selected"
                            className="h-20 w-auto rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                        >
                            <span className="text-white text-xs">×</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-white/10 p-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/5 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 bg-white/5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                    >
                        <Image className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 rounded-lg ${isRecording
                            ? 'bg-red-500 text-white'
                            : 'bg-white/5 text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {isRecording ? (
                            <StopCircle className="w-5 h-5" />
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSendMessage}
                        className="p-2 bg-blue-500 rounded-lg text-white"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default AiChat; 