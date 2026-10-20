import { SendHorizonal } from 'lucide-react';
import React, { useState } from 'react';
import Markdown, { type Components } from 'react-markdown';
import apiClient from '../api/axiosClient';

// Tailwind resets default browser styles, so give each Markdown element its look here
const markdownStyles: Components = {
    h1: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
    h2: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
    h3: ({ children }) => <h4 className="font-semibold mt-3 mb-1">{children}</h4>,
    p: ({ children }) => <p className="my-1">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-5 my-1 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-5 my-1 space-y-1">{children}</ol>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    code: ({ children }) => <code className="bg-background rounded px-1 text-sm">{children}</code>
};

// One chat bubble: either something the user typed or the assistant's reply
interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const Assistant: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const sendPrompt = async () => {
        const question = prompt.trim(); // clean extra whitespace to help with token usage and prompt clarity
        if (!question || loading) return;

        // Show the user's message right away and clear the input
        setMessages(previous => [...previous, { role: 'user', text: question }]);
        setPrompt('');
        setLoading(true);

        try {
            const response = await apiClient.post('/api/assistant/chat', { prompt: question });
            setMessages(previous => [...previous, { role: 'assistant', text: response.data.answer }]);
        } catch (error) {
            console.error('Assistant request failed:', error);
            setMessages(previous => [
                ...previous,
                { role: 'assistant', text: `Sorry, something went wrong. Please try again. ${error}` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-background h-[92vh] items-center">
            <div className="flex flex-col gap-3 flex-1 w-[80%] overflow-y-auto mt-10 rounded-sm p-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`max-w-[75%] p-3 rounded-lg text-text-primary ${
                            message.role === 'user'
                                ? 'self-end whitespace-pre-wrap bg-subsection-3 rounded-md border border-subsection-4/50'
                                : 'self-start bg-white rounded-md border border-border'
                        }`}
                    >
                        {/* Assistant replies are Markdown; user messages are shown as typed */}
                        {message.role === 'assistant' ? (
                            <Markdown components={markdownStyles}>{message.text}</Markdown>
                        ) : (
                            <>{message.text}</>
                        )}
                    </div>
                ))}
                {loading && <p className="self-start text-text-primary/60 animate-pulse">Thinking...</p>}
            </div>
            <div className="flex flex-row gap-2 items-center w-[80%] py-4">
                <input
                    value={prompt}
                    onChange={event => setPrompt(event.target.value)}
                    onKeyDown={event => {
                        if (event.key === 'Enter') sendPrompt();
                    }}
                    placeholder="Ask about the platform, datasets, and visualizations."
                    className="border border-border/50 rounded-lg w-full text-bodyLg text-text-primary bg-white px-2 py-2 focus:outline-none focus:border-subsection-3"
                />
                <button
                    onClick={sendPrompt}
                    disabled={loading}
                    className="p-3 rounded-md cursor-pointer bg-white border border-border/50 hover:bg-subsection-1 hover:border-subsection-3 focus:outline-none focus:border-subsection-3 focus:bg-subsection-1 group"
                >
                    <SendHorizonal className="w-4 h-4 text-text-primary group-hover:text-primary group-focus:text-primary" />
                </button>
            </div>
        </div>
    );
};

export default Assistant;
