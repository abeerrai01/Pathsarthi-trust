import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Target, Save, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';

const MissionManager = () => {
    const [mission, setMission] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchMission = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'website_content', 'mission');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setMission(docSnap.data().text || '');
                }
            } catch (error) {
                console.error("Error fetching mission:", error);
            }
            setLoading(false);
        };
        fetchMission();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!mission.trim()) {
            setMessage({ text: 'Please enter your mission statement.', type: 'error' });
            return;
        }
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const docRef = doc(db, 'website_content', 'mission');
            await setDoc(docRef, {
                text: mission.trim(),
                updatedAt: serverTimestamp()
            }, { merge: true });
            setMessage({ text: 'Mission Statement updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 4000);
        } catch (error) {
            console.error("Error saving mission:", error);
            setMessage({ text: 'Failed to update. Error: ' + error.message, type: 'error' });
        }
        setSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white">
                <h2 className="text-3xl font-black flex items-center gap-3">
                    <Target className="w-10 h-10" />
                    Update Trust Mission
                </h2>
                <p className="text-rose-50 mt-2 opacity-90 font-medium text-lg">Define the core goals and vision of Path Sarthi Trust.</p>
            </div>

            <div className="p-8 md:p-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
                        <span className="font-bold">Loading mission...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex gap-4 text-rose-800">
                           <Info className="shrink-0" />
                           <p className="text-sm font-bold italic leading-relaxed">Your mission statement is shown on the Homepage and About Us page. Keep it concise, inspiring, and clear about who you help and how.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-extrabold text-slate-700 mb-3 uppercase tracking-wider">Mission Statement Text</label>
                            <textarea 
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 md:p-10 focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all placeholder:text-slate-300 font-bold text-slate-800 shadow-inner text-lg leading-relaxed min-h-[300px]"
                                value={mission}
                                onChange={(e) => setMission(e.target.value)}
                                placeholder="Enter the mission statement here..."
                            />
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-10 py-5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-xl shadow-rose-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:bg-rose-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xl"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6" />
                                        Save Mission Statement
                                    </>
                                )}
                            </button>

                            {message.text && (
                                <div className={`flex-1 p-5 rounded-2xl flex items-center gap-4 font-bold border animate-in slide-in-from-right-4 duration-300 ${
                                    message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                    {message.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MissionManager;
