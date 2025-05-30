import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import MonacoEditor from '@monaco-editor/react';
import { motion } from 'framer-motion';

function CodeShare() {
    const { roomId } = useParams();
    const socket = useSocket();
    const [code, setCode] = useState('// Start coding here...');
    const [language, setLanguage] = useState('javascript');
    const [isConnected, setIsConnected] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const editorRef = useRef(null);
    const skipNextChangeRef = useRef(false);
    const [selections, setSelections] = useState({});

    const languages = [
        'javascript', 'python', 'java', 'cpp', 'typescript',
        'html', 'css', 'json', 'sql', 'markdown'
    ];

    useEffect(() => {
        if (!socket) return;

        socket.emit('join-code-room', roomId);

        socket.on('room-state', ({ code: initialCode, language: initialLanguage }) => {
            skipNextChangeRef.current = true;
            setCode(initialCode);
            setLanguage(initialLanguage);
        });

        socket.on('code-change', ({ newCode, source }) => {
            if (source !== socket.id) {
                skipNextChangeRef.current = true;
                setCode(newCode);
            }
        });

        socket.on('language-change', ({ newLanguage, source }) => {
            if (source !== socket.id) {
                setLanguage(newLanguage);
            }
        });

        socket.on('code-users-update', (users) => {
            setConnectedUsers(users);
            setIsConnected(true);
        });

        socket.on('selection-change', ({ selections, source }) => {
            if (source !== socket.id && editorRef.current) {
                const model = editorRef.current.getModel();
                const decorations = [];

                editorRef.current.removeDecorations(
                    editorRef.current
                        .getModel()
                        .getAllDecorations()
                        .filter(d => d.options.className === `selection-${source}`)
                        .map(d => d.id)
                );

                selections.forEach(selection => {
                    const startPos = model.getPositionAt(selection.start);
                    const endPos = model.getPositionAt(selection.end);

                    decorations.push({
                        range: new monaco.Range(
                            startPos.lineNumber,
                            startPos.column,
                            endPos.lineNumber,
                            endPos.column
                        ),
                        options: {
                            className: `selection-${source}`,
                            hoverMessage: { value: `Selected by User ${source.slice(0, 4)}` }
                        }
                    });
                });

                editorRef.current.deltaDecorations([], decorations);
            }
        });

        return () => {
            socket.off('room-state');
            socket.off('code-change');
            socket.off('language-change');
            socket.off('code-users-update');
            socket.off('selection-change');
        };
    }, [socket, roomId]);

    const handleEditorChange = (value) => {
        if (skipNextChangeRef.current) {
            skipNextChangeRef.current = false;
            return;
        }
        setCode(value);
        socket.emit('code-change', { roomId, newCode: value });
    };

    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        setLanguage(newLanguage);
        socket.emit('language-change', { roomId, newLanguage });
    };

    const copyRoomLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert('Room link copied to clipboard!');
    };

    const handleSelectionChange = () => {
        if (editorRef.current) {
            const selections = editorRef.current.getSelections().map(selection => ({
                start: editorRef.current.getModel().getOffsetAt(selection.getStartPosition()),
                end: editorRef.current.getModel().getOffsetAt(selection.getEndPosition())
            }));

            socket.emit('selection-change', {
                roomId,
                selections
            });
        }
    };

    return (
        <div className="min-h-screen h-screen bg-black flex flex-col">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="h-14 bg-black/50 backdrop-blur-sm border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium">DevShares Code</span>
                        <span className="text-white/40 text-sm">Room: {roomId}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.select
                            whileHover={{ scale: 1.05 }}
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            {languages.map(lang => (
                                <option key={lang} value={lang} className="bg-black">
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                            ))}
                        </motion.select>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={copyRoomLink}
                            className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                            Share
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Editor */}
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 relative"
            >
                <div className="absolute inset-0">
                    <MonacoEditor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={handleEditorChange}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 10 },
                        }}
                        onMount={(editor, monaco) => {
                            editorRef.current = editor;
                            editor.onDidChangeCursorSelection(handleSelectionChange);

                            const styleElement = document.createElement('style');
                            document.head.appendChild(styleElement);
                            styleElement.textContent = `
                                .selection-${socket.id} {
                                    background-color: rgba(255, 255, 255, 0.1);
                                    border-radius: 3px;
                                }
                            `;
                        }}
                    />
                </div>
            </motion.main>

            {/* Footer */}
            <motion.footer
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="h-12 bg-black/50 backdrop-blur-sm border-t border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {connectedUsers.map((user, index) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs border border-white/10"
                                    title={user.id === socket.id ? 'You' : `User ${index + 1}`}
                                >
                                    {user.id === socket.id ? 'Y' : index + 1}
                                </motion.div>
                            ))}
                        </div>
                        <span className="text-white/40 text-sm">
                            {connectedUsers.length} connected
                        </span>
                    </div>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/40 text-sm"
                    >
                        {isConnected ? 'Connected' : 'Connecting...'}
                    </motion.span>
                </div>
            </motion.footer>
        </div>
    );
}

export default CodeShare; 