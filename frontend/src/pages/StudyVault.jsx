import React, { useState, useEffect } from 'react';
import { Upload, FileText, Tag, MessageSquare, BrainCircuit, Sparkles, X } from 'lucide-react';
import { apiRequest } from '../api';

export default function StudyVault() {
    const [documents, setDocuments] = useState([]);
    const [uploading, setUploading] = useState(false);

    // Interactive Document States
    const [activeDoc, setActiveDoc] = useState(null);
    const [chatQuestion, setChatQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const docs = await apiRequest('/documents');
            setDocuments(docs);
        } catch (err) {
            console.error('Error fetching documents', err);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { uploadUrl, s3Key } = await apiRequest('/documents/upload-url', {
                method: 'POST',
                body: JSON.stringify({ fileName: file.name, fileType: file.type }),
            });

            const s3Response = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            });

            if (!s3Response.ok) throw new Error('S3 upload failed');

            await apiRequest('/documents', {
                method: 'POST',
                body: JSON.stringify({
                    title: file.name,
                    s3Key,
                    fileType: file.type,
                    fileSize: file.size,
                    tags: ['PDF Study'],
                }),
            });

            fetchDocuments();
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // 1. Contextual Document Chat
    const handleDocChat = async (e) => {
        e.preventDefault();
        if (!chatQuestion.trim() || chatLoading) return;

        const userMsg = chatQuestion;
        setChatHistory((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setChatQuestion('');
        setChatLoading(true);

        try {
            const data = await apiRequest('/ai/doc-chat', {
                method: 'POST',
                body: JSON.stringify({ documentId: activeDoc._id, question: userMsg }),
            });
            setChatHistory((prev) => [...prev, { sender: 'ai', text: data.response }]);
        } catch (err) {
            setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Failed to retrieve information from document.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    // 2. Flashcard / Quiz Generator
    const generateStudyAsset = async (type) => {
        setGenerating(true);
        try {
            // Generate structured JSON content via Gemini
            const aiResponse = await apiRequest('/ai/generate', {
                method: 'POST',
                body: JSON.stringify({ text: activeDoc.extractedText || activeDoc.title, type }),
            });

            // Save asset in Database
            await apiRequest('/assets', {
                method: 'POST',
                body: JSON.stringify({
                    documentId: activeDoc._id,
                    type,
                    title: `AI Generated ${type === 'quiz' ? 'Quiz' : 'Flashcards'} - ${activeDoc.title}`,
                    content: aiResponse.data,
                    tags: ['AI Generated'],
                }),
            });

            alert(`Success! Generated and saved study ${type} items to your Assets.`);
        } catch (err) {
            alert('Generation failed: ' + err.message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="flex-1 bg-slate-50 min-h-screen p-10 ml-64 flex">
            {/* Main Left Section: Upload & Docs List */}
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Study Vault</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage documents and use AI to generate contextual study materials.</p>
                    </div>
                    <label className="flex items-center gap-2 bg-brand-blue hover:bg-brand-darkBlue text-white px-5 py-3 rounded-xl font-semibold cursor-pointer shadow-sm transition-all text-sm">
                        <Upload size={16} />
                        {uploading ? 'Parsing PDF...' : 'Upload Document'}
                        <input type="file" onChange={handleUpload} disabled={uploading} className="hidden" accept=".pdf" />
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documents.map((doc) => (
                        <div
                            key={doc._id}
                            onClick={() => { setActiveDoc(doc); setChatHistory([]); }}
                            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer ${activeDoc?._id === doc._id ? 'border-brand-blue ring-2 ring-brand-lightBlue' : 'border-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-brand-lightBlue text-brand-blue rounded-xl">
                                    <FileText size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-900 truncate" title={doc.title}>{doc.title}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4">
                                <div className="flex items-center gap-1.5 text-xs text-brand-blue bg-brand-lightBlue px-2.5 py-1 rounded-full font-semibold">
                                    <Tag size={12} />
                                    {doc.tags[0] || 'Doc'}
                                </div>
                                <span className="text-xs text-brand-blue font-semibold hover:underline">Select to Study &rarr;</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Drawer Panel: Document Context Interactive Tool */}
            {activeDoc && (
                <div className="w-96 bg-white border-l border-gray-100 p-6 flex flex-col justify-between h-[calc(100vh-80px)] sticky top-10 ml-8 rounded-2xl shadow-sm">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-slate-900 truncate pr-4">{activeDoc.title}</h3>
                            <button onClick={() => setActiveDoc(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        {/* AI Generation Tools */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => generateStudyAsset('flashcard')}
                                disabled={generating}
                                className="flex items-center justify-center gap-1.5 bg-purple-50 text-purple-600 border border-purple-100 py-2.5 rounded-xl text-xs font-semibold hover:bg-purple-100 transition-all"
                            >
                                <Sparkles size={14} /> Flashcards
                            </button>
                            <button
                                onClick={() => generateStudyAsset('quiz')}
                                disabled={generating}
                                className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 py-2.5 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-all"
                            >
                                <BrainCircuit size={14} /> Practice Quiz
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Chat with document</h4>

                            {/* Context Chat History */}
                            <div className="space-y-3 h-80 overflow-y-auto mb-4 text-xs pr-1">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`p-3 rounded-xl leading-relaxed ${msg.sender === 'user' ? 'bg-brand-lightBlue text-brand-blue font-medium' : 'bg-gray-50 text-gray-700'}`}>
                                        <strong>{msg.sender === 'user' ? 'You: ' : 'AI: '}</strong>{msg.text}
                                    </div>
                                ))}
                                {chatLoading && <div className="text-gray-400 text-xs animate-pulse">Reading document details...</div>}
                                {chatHistory.length === 0 && <p className="text-gray-400 text-center py-6">Ask a question about this document content.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Chat Form */}
                    <form onSubmit={handleDocChat} className="flex gap-2 border-t border-gray-100 pt-4">
                        <input
                            type="text"
                            value={chatQuestion}
                            onChange={(e) => setChatQuestion(e.target.value)}
                            placeholder="Ask context question..."
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-blue"
                        />
                        <button type="submit" className="px-4 bg-brand-blue hover:bg-brand-darkBlue text-white text-xs font-semibold rounded-xl transition-all">
                            Ask
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}