import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { SERVER_URL } from '../config/config';

function FileShare() {
    const [files, setFiles] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showNearbyDialog, setShowNearbyDialog] = useState(false);
    const [downloadCode, setDownloadCode] = useState('');
    const [error, setError] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            acceptedFiles.forEach(file => formData.append('files', file));

            const response = await fetch(`${SERVER_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setFiles({
                    list: data.files,
                    code: data.code
                });
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true
    });

    const handleNearbyDownload = async () => {
        if (downloadCode.length !== 4) {
            setError('Please enter a valid 4-digit code');
            return;
        }

        try {
            const response = await fetch(`${SERVER_URL}/download/${downloadCode}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'shared-files.zip';
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setShowNearbyDialog(false);
            setDownloadCode('');
            setError('');

        } catch (error) {
            console.error(error);
            setError('Failed to download files');
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-black/50 backdrop-blur-sm border-b border-white/10"
            >
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-medium">DevShares Files</span>
                        <span className="text-white/40">Quick and secure file sharing</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNearbyDialog(true)}
                        className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                        Nearby Devices
                    </motion.button>
                </div>
            </motion.nav>

            {/* Main Content */}
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-4"
            >
                {!files ? (
                    // Upload Area
                    <div className="w-full max-w-xl text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-white text-4xl mb-8"
                        >
                            Share files directly from your device
                        </motion.h1>
                        <motion.div
                            {...getRootProps()}
                            whileHover={{ scale: 1.02 }}
                            className={`border-2 border-dashed border-white/20 rounded-lg p-12 cursor-pointer transition-all
                                ${isDragActive ? 'border-white/40 bg-white/5' : 'hover:border-white/30 hover:bg-white/5'}`}
                        >
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <motion.div
                                    animate={{ opacity: [0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="text-white/60"
                                >
                                    Uploading...
                                </motion.div>
                            ) : (
                                <div className="text-white/60">
                                    Click to browse or drag multiple files here
                                </div>
                            )}
                        </motion.div>
                        <div className="mt-8 flex justify-center gap-8 text-white/60">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>No file size limit</span>
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>End-to-end encrypted</span>
                            </motion.div>
                        </div>
                    </div>
                ) : (
                    // Share Code Display
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 rounded-lg p-8 w-full max-w-md text-center backdrop-blur-sm border border-white/10"
                    >
                        <div className="mb-6">
                            <h2 className="text-white text-xl font-medium mb-4">Uploaded Files</h2>
                            {files.list.map((file, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="mb-2"
                                >
                                    <p className="text-white">{file.name}</p>
                                    <p className="text-white/40">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mb-8">
                            <div className="text-white/60 text-sm mb-4">Share this code with nearby devices:</div>
                            <div className="flex justify-center gap-2">
                                {files.code.split('').map((digit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center text-white text-2xl font-bold border border-white/10"
                                    >
                                        {digit}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFiles(null)}
                            className="bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-lg transition-all duration-200"
                        >
                            Share Another File
                        </motion.button>
                    </motion.div>
                )}
            </motion.main>

            {/* Nearby Devices Dialog */}
            {showNearbyDialog && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/5 rounded-lg p-8 w-full max-w-md border border-white/10"
                    >
                        <h2 className="text-white text-xl font-medium mb-6">Enter sharing code</h2>

                        <input
                            type="text"
                            value={downloadCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setDownloadCode(value);
                                setError('');
                            }}
                            placeholder="Enter 4-digit code"
                            className="w-full bg-white/5 text-white placeholder-white/40 border border-white/10 rounded-lg px-4 py-3 mb-4 text-center text-2xl tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                            maxLength={4}
                        />

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mb-4"
                            >
                                {error}
                            </motion.p>
                        )}

                        <div className="flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNearbyDownload}
                                className="flex-1 bg-white/10 hover:bg-white/15 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                                disabled={downloadCode.length !== 4}
                            >
                                Download
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowNearbyDialog(false);
                                    setDownloadCode('');
                                    setError('');
                                }}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                            >
                                Cancel
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default FileShare;