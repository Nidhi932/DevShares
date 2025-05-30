import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import speech from '@google-cloud/speech';

const router = express.Router();
const upload = multer();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Speech-to-Text client
const speechClient = new speech.SpeechClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

// Helper function to convert image to base64
const getImageMimeType = async (buffer) => {
    const fileType = await fileTypeFromBuffer(buffer);
    return fileType ? fileType.mime : null;
};

// Chat endpoint with image support
router.post('/chat', upload.single('image'), async (req, res) => {
    try {
        const message = req.body.message || '';

        if (!message && !req.file) {
            return res.status(400).json({
                error: 'No message or image provided',
                response: 'Please provide a message or image to process.'
            });
        }

        let result;
        try {
            if (req.file) {
                // If image is included, use the vision model
                const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
                const mimeType = await getImageMimeType(req.file.buffer);

                if (!mimeType) {
                    return res.status(400).json({
                        error: 'Invalid image format',
                        response: 'The provided image format is not supported.'
                    });
                }

                const imageData = {
                    inlineData: {
                        data: req.file.buffer.toString('base64'),
                        mimeType
                    }
                };

                result = await visionModel.generateContent([message, imageData]);
            } else {
                // Text-only chat
                const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
                result = await model.generateContent(message);
            }

            const response = await result.response;
            const text = response.text();

            return res.json({
                success: true,
                response: text
            });
        } catch (error) {
            console.error('Gemini API error:', error);
            return res.status(500).json({
                error: 'AI Processing Error',
                response: 'The AI model encountered an error processing your request. Please try again.'
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Server Error',
            response: 'An unexpected error occurred. Please try again later.'
        });
    }
});

// Speech-to-text endpoint
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No audio file provided',
                text: 'Please provide an audio file to transcribe.'
            });

        }

        const audioBytes = req.file.buffer.toString('base64');
        const audio = {
            content: audioBytes,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };
        const request = {
            audio: audio,
            config: config,
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        return res.json({
            success: true,
            text: transcription
        });
    } catch (error) {
        console.error('Speech-to-text error:', error);
        return res.status(500).json({
            error: 'Speech Processing Error',
            text: 'Failed to convert speech to text. Please try again.'
        });
    }
});

export default router; 