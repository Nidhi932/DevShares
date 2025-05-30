import { Link, useLocation } from 'react-router-dom';
import { generateRoomId } from '../utils/roomUtils';

const Navigation = () => {
    const location = useLocation();
    const newRoomId = generateRoomId();

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex space-x-4">
                    <Link
                        to={`/room/${newRoomId}`}
                        className={`px-3 py-2 rounded-md ${
                            location.pathname.startsWith('/room') 
                                ? 'bg-gray-900' 
                                : 'hover:bg-gray-700'
                        }`}
                    >
                        Screen Share
                    </Link>
                    <Link
                        to="/files"
                        className={`px-3 py-2 rounded-md ${
                            location.pathname === '/files' 
                                ? 'bg-gray-900' 
                                : 'hover:bg-gray-700'
                        }`}
                    >
                        File Share
                    </Link>
                    <Link
                        to="/chat"
                        className={`px-3 py-2 rounded-md ${
                            location.pathname === '/chat' 
                                ? 'bg-gray-900' 
                                : 'hover:bg-gray-700'
                        }`}
                    >
                        AI Chat
                    </Link>
                    <Link
                        to={`/music/${newRoomId}`}
                        className={`px-3 py-2 rounded-md ${
                            location.pathname.startsWith('/music') 
                                ? 'bg-gray-900' 
                                : 'hover:bg-gray-700'
                        }`}
                    >
                        Music Room
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navigation; 