import React, { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Mail, Send, User, Type, FileText, MessageSquare, CheckCircle, XCircle,
  Loader, Sparkles, ChevronDown, Wand2, Search, CheckSquare, Square,
  UserPlus, Trash2, RotateCcw, Bot, Filter, Plus, ArrowRight, RefreshCw, Check
} from 'lucide-react';

const QUICK_TEMPLATES = [
  {
    label: "🎉 Thank You Message",
    subject: "Thank You from Path Sarthi Trust",
    preview: "We are truly grateful for your support.",
    message: "Dear {name},\n\nWe want to extend our heartfelt gratitude for your continued support and trust in Path Sarthi Trust. Your contribution is making a real and lasting difference in the lives of children, elders, and families across our communities.\n\nBecause of people like you, we are able to continue our mission of service, education, and social welfare.",
    additionalMessage: "We look forward to sharing more updates about our work and impact. Thank you once again for being a valued member of the Path Sarthi Trust family.",
    status: "Thank You",
  },
  {
    label: "📢 Important Update",
    subject: "Important Update from Path Sarthi Trust",
    preview: "A new update from our team.",
    message: "Dear {name},\n\nWe are reaching out with an important update from Path Sarthi Trust. Please read the following carefully.",
    additionalMessage: "If you have any questions or concerns, please do not hesitate to contact us at pathsarthi2022@gmail.com. We are always here to assist you.",
    status: "Update",
  },
  {
    label: "📅 Event Invitation",
    subject: "You Are Invited — Path Sarthi Trust Event",
    preview: "Join us for an upcoming event!",
    message: "Dear {name},\n\nWe are delighted to invite you to an upcoming event organized by Path Sarthi Trust. Your presence would mean a great deal to us and to the community we serve together.",
    additionalMessage: "Kindly confirm your attendance at your earliest convenience. We look forward to seeing you!",
    status: "Invitation",
  },
  {
    label: "💳 Membership Reminder",
    subject: "Your Path Sarthi Trust Membership — A Gentle Reminder",
    preview: "Renew your membership and continue making an impact.",
    message: "Dear {name},\n\nThis is a gentle reminder regarding your membership with Path Sarthi Trust. Your membership plays a vital role in sustaining our programs and helping us reach more beneficiaries.\n\nWe invite you to renew your membership and continue being a part of our growing family of change-makers.",
    additionalMessage: "For any assistance with your membership renewal, please contact us directly. Thank you for your unwavering commitment to our mission.",
    status: "Reminder",
  },
];

const AdminEmailComposer = () => {
  // Main Email Form State
  const [form, setForm] = useState({
    recipientEmail: '',
    recipientName: '',
    subject: '',
    preview: '',
    status: 'Message from Path Sarthi Trust',
    message: '',
    additionalMessage: '',
  });

  // Sending state & batch progress
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Batch progress tracking
  const [batchProgress, setBatchProgress] = useState(null);

  // Database Recipient Selection State
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contactSourceFilter, setContactSourceFilter] = useState('All'); // 'All' | 'Membership' | 'Jan Sampark'
  const [selectedRecipients, setSelectedRecipients] = useState([]); // [{ name, email, source }]
  const [showRecipientSelector, setShowRecipientSelector] = useState(true);

  // Custom Recipient Input State
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  // AI Context Window & Conversational State
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiHistory, setAiHistory] = useState([]); // [{ role: 'user'|'assistant', text: string, parsed: object }]
  const [aiInputPrompt, setAiInputPrompt] = useState('');
  const [latestAiDraft, setLatestAiDraft] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Fetch Contacts from Firestore (memberships & jan_sampark)
  const fetchContacts = async () => {
    setLoadingContacts(true);
    try {
      const contactsMap = new Map();

      // 1. Fetch Memberships
      const memSnap = await getDocs(collection(db, 'memberships'));
      memSnap.forEach((doc) => {
        const data = doc.data();
        const rawEmail = data.email || '';
        const emailKey = rawEmail.trim().toLowerCase();
        if (!emailKey) return;

        let name = data.fullName;
        if (!name && data.firstName) {
          name = `${data.firstName} ${data.lastName || ''}`.trim();
        }
        if (!name) name = 'Member';

        contactsMap.set(emailKey, {
          id: `mem-${doc.id}`,
          name: name.trim(),
          email: rawEmail.trim(),
          sources: ['Membership'],
        });
      });

      // 2. Fetch Jan Sampark
      const janSnap = await getDocs(collection(db, 'jan_sampark'));
      janSnap.forEach((doc) => {
        const data = doc.data();
        const rawEmail = data.email || '';
        const emailKey = rawEmail.trim().toLowerCase();
        if (!emailKey) return;

        let name = data.fullName || data.name || 'Jan Sampark Member';

        if (contactsMap.has(emailKey)) {
          const existing = contactsMap.get(emailKey);
          if (!existing.sources.includes('Jan Sampark')) {
            existing.sources.push('Jan Sampark');
          }
        } else {
          contactsMap.set(emailKey, {
            id: `jan-${doc.id}`,
            name: name.trim(),
            email: rawEmail.trim(),
            sources: ['Jan Sampark'],
          });
        }
      });

      setContacts(Array.from(contactsMap.values()));
    } catch (err) {
      console.error('[AdminEmailComposer] Failed to fetch contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filtered Contacts List
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase());

      if (contactSourceFilter === 'Membership') {
        return matchesSearch && c.sources.includes('Membership');
      }
      if (contactSourceFilter === 'Jan Sampark') {
        return matchesSearch && c.sources.includes('Jan Sampark');
      }
      return matchesSearch;
    });
  }, [contacts, contactSearch, contactSourceFilter]);

  // Recipient Selection Handlers
  const isSelected = (email) =>
    selectedRecipients.some((r) => r.email.toLowerCase() === email.toLowerCase());

  const toggleSelectContact = (contact) => {
    if (isSelected(contact.email)) {
      setSelectedRecipients((prev) =>
        prev.filter((r) => r.email.toLowerCase() !== contact.email.toLowerCase())
      );
    } else {
      setSelectedRecipients((prev) => [
        ...prev,
        { name: contact.name, email: contact.email, source: contact.sources.join(', ') },
      ]);
    }
  };

  const isAllFilteredSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((c) => isSelected(c.email));

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      const filteredEmails = new Set(filteredContacts.map((c) => c.email.toLowerCase()));
      setSelectedRecipients((prev) =>
        prev.filter((r) => !filteredEmails.has(r.email.toLowerCase()))
      );
    } else {
      const newSelected = [...selectedRecipients];
      filteredContacts.forEach((c) => {
        if (!newSelected.some((r) => r.email.toLowerCase() === c.email.toLowerCase())) {
          newSelected.push({ name: c.name, email: c.email, source: c.sources.join(', ') });
        }
      });
      setSelectedRecipients(newSelected);
    }
  };

  const handleAddCustomRecipient = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const emailToAdd = customEmail.trim();
    const nameToAdd = customName.trim() || emailToAdd.split('@')[0];

    if (isSelected(emailToAdd)) {
      setErrorMsg(`Email ${emailToAdd} is already selected.`);
      return;
    }

    setSelectedRecipients((prev) => [
      ...prev,
      { name: nameToAdd, email: emailToAdd, source: 'Custom' },
    ]);
    setCustomEmail('');
    setCustomName('');
    setErrorMsg('');
  };

  const removeRecipient = (emailToRemove) => {
    setSelectedRecipients((prev) =>
      prev.filter((r) => r.email.toLowerCase() !== emailToRemove.toLowerCase())
    );
  };

  const clearAllSelected = () => {
    setSelectedRecipients([]);
  };

  // Conversational AI Generator Handler (Multi-turn Context Window)
  const handleAiGenerateOrRefine = async (overridePrompt) => {
    const promptText = (overridePrompt || aiInputPrompt).trim();
    if (!promptText) return;

    setAiGenerating(true);
    setAiError('');

    const systemInstruction = `You are an email writing assistant for Path Sarthi Trust, an NGO.
Generate a professional, warm email based on the user's prompt and conversation context history.
You MUST respond with ONLY valid JSON — no markdown code fences, no extra text outside the JSON.
The JSON must have exactly these keys:
{
  "subject": "...",
  "preview": "...",
  "status": "...",
  "message": "...",
  "additionalMessage": "..."
}
- subject: email subject line
- preview: short inbox teaser (1 sentence)
- status: badge label like "Thank You", "Update", "Invitation", "Reminder"
- message: main email body (formal, warm, 2-3 paragraphs, use \\n for line breaks)
- additionalMessage: closing note or next steps (1-2 sentences)`;

    // Build multi-turn contents array for /api/chat
    const contents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I will generate or refine the email as valid JSON based on the context history.' }] },
    ];

    // Append prior history
    aiHistory.forEach((turn) => {
      if (turn.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: turn.text }] });
      } else if (turn.role === 'assistant' && turn.rawText) {
        contents.push({ role: 'model', parts: [{ text: turn.rawText }] });
      }
    });

    // Append current user prompt
    contents.push({ role: 'user', parts: [{ text: promptText }] });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'AI API request failed');

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonText = rawText.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(jsonText);

      const newTurnUser = { role: 'user', text: promptText };
      const newTurnAssistant = { role: 'assistant', text: parsed.subject, rawText, parsed };

      setAiHistory((prev) => [...prev, newTurnUser, newTurnAssistant]);
      setLatestAiDraft(parsed);
      setAiInputPrompt('');
    } catch (err) {
      console.error('[AI Generate Context]', err);
      setAiError('Failed to generate email. Please try rephrasing your prompt or check your connection.');
    } finally {
      setAiGenerating(false);
    }
  };

  const applyAiDraftToForm = () => {
    if (!latestAiDraft) return;
    setForm((prev) => ({
      ...prev,
      subject: latestAiDraft.subject || prev.subject,
      preview: latestAiDraft.preview || prev.preview,
      status: latestAiDraft.status || prev.status,
      message: latestAiDraft.message || prev.message,
      additionalMessage: latestAiDraft.additionalMessage || prev.additionalMessage,
    }));
  };

  const resetAiContext = () => {
    setAiHistory([]);
    setLatestAiDraft(null);
    setAiInputPrompt('');
    setAiError('');
  };

  // Form Field Change Handler
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResult(null);
  };

  // Apply Quick Template
  const applyTemplate = (tmpl) => {
    setForm((prev) => ({
      ...prev,
      subject: tmpl.subject,
      preview: tmpl.preview,
      status: tmpl.status,
      message: tmpl.message,
      additionalMessage: tmpl.additionalMessage,
    }));
    setShowTemplates(false);
    setResult(null);
  };

  // Send Email Handler (Single or Batch Multi-recipient)
  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setResult(null);
    setErrorMsg('');
    setBatchProgress(null);

    // Determine target list of recipients
    let targets = [...selectedRecipients];

    // Fallback: If no checkbox recipients selected, use single form input if filled
    if (targets.length === 0) {
      if (form.recipientEmail.trim()) {
        targets.push({
          name: form.recipientName.trim() || 'Valued Recipient',
          email: form.recipientEmail.trim(),
          source: 'Manual Input',
        });
      } else {
        setSending(false);
        setErrorMsg('Please select at least one recipient from the list or enter a recipient email address.');
        setResult('error');
        return;
      }
    }

    try {
      const functions = getFunctions();
      const sendCustomEmail = httpsCallable(functions, 'sendCustomEmail');

      let successCount = 0;
      let failCount = 0;
      const failedItems = [];

      setBatchProgress({
        total: targets.length,
        current: 0,
        sent: 0,
        failed: 0,
        currentEmail: '',
      });

      for (let i = 0; i < targets.length; i++) {
        const recipient = targets[i];
        setBatchProgress({
          total: targets.length,
          current: i + 1,
          sent: successCount,
          failed: failCount,
          currentEmail: recipient.email,
        });

        try {
          // Personalize message if placeholder {name} is present
          const personalizedMessage = form.message.replace(/{name}/g, recipient.name);

          await sendCustomEmail({
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            subject: form.subject.trim(),
            preview: form.preview.trim() || form.subject.trim(),
            status: form.status.trim(),
            message: personalizedMessage,
            additionalMessage: form.additionalMessage.trim(),
          });
          successCount++;
        } catch (err) {
          console.error(`[Send] Failed for ${recipient.email}:`, err);
          failCount++;
          failedItems.push({ email: recipient.email, reason: err?.message || 'Send error' });
        }
      }

      setBatchProgress({
        total: targets.length,
        current: targets.length,
        sent: successCount,
        failed: failCount,
        currentEmail: '',
        completed: true,
        failedItems,
      });

      if (failCount === 0) {
        setResult('success');
      } else if (successCount > 0) {
        setResult('partial');
        setErrorMsg(`Sent ${successCount} of ${targets.length} emails. ${failCount} failed.`);
      } else {
        setResult('error');
        setErrorMsg(`Failed to send emails to all ${targets.length} recipients.`);
      }
    } catch (err) {
      console.error('[AdminEmailComposer] Unexpected send error:', err);
      setErrorMsg(err?.message || 'Failed to dispatch email.');
      setResult('error');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setForm({
      recipientEmail: '',
      recipientName: '',
      subject: '',
      preview: '',
      status: 'Message from Path Sarthi Trust',
      message: '',
      additionalMessage: '',
    });
    setSelectedRecipients([]);
    setResult(null);
    setErrorMsg('');
    setBatchProgress(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #009ba2, #00c8d2)' }}>
              <Mail size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Email Composer</h1>
              <p className="text-slate-500 text-sm">
                Compose, generate with AI context history, and send custom emails to Members & Jan Sampark contacts.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchContacts}
            disabled={loadingContacts}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <RefreshCw size={13} className={loadingContacts ? 'animate-spin' : ''} />
            Refresh Contacts
          </button>
        </div>
      </div>

      {/* Recipient Selection Section (Memberships & Jan Sampark DB + Custom Email) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-teal-600" />
            <h2 className="font-bold text-slate-800 text-base">Select Recipients</h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-semibold px-2.5 py-0.5 rounded-full">
              {selectedRecipients.length} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowRecipientSelector((v) => !v)}
              className="text-xs text-teal-700 hover:underline font-medium flex items-center gap-1"
            >
              {showRecipientSelector ? 'Collapse Panel' : 'Expand Panel'}
              <ChevronDown size={14} className={`transition-transform ${showRecipientSelector ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {showRecipientSelector && (
          <div className="p-5 space-y-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {/* Source Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <Filter size={14} className="text-slate-400 shrink-0" />
                {['All', 'Membership', 'Jan Sampark'].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setContactSourceFilter(src)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 ${
                      contactSourceFilter === src
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>

              {/* Select / Deselect Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleSelectAllFiltered}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition border border-teal-200"
                >
                  {isAllFilteredSelected ? (
                    <>
                      <CheckSquare size={14} /> Deselect Visible ({filteredContacts.length})
                    </>
                  ) : (
                    <>
                      <Square size={14} /> Select All Visible ({filteredContacts.length})
                    </>
                  )}
                </button>

                {selectedRecipients.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllSelected}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition border border-rose-200"
                  >
                    <Trash2 size={13} /> Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Checkbox Contacts Grid/List */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-slate-50/50 p-2 space-y-1">
              {loadingContacts ? (
                <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin text-teal-600" /> Fetching database contacts...
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  {contacts.length === 0 ? 'No contacts found in database.' : 'No matching contacts found.'}
                </div>
              ) : (
                filteredContacts.map((contact) => {
                  const checked = isSelected(contact.email);
                  return (
                    <label
                      key={contact.id}
                      onClick={() => toggleSelectContact(contact)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer text-sm ${
                        checked
                          ? 'bg-teal-50/80 border-teal-300 text-teal-950 font-medium'
                          : 'bg-white border-slate-200 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition shrink-0 ${
                          checked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <Check size={12} strokeWidth={3} />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{contact.name}</div>
                          <div className="text-xs text-slate-500 truncate">{contact.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {contact.sources.map((src) => (
                          <span
                            key={src}
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                              src === 'Membership'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {src}
                          </span>
                        ))}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Custom Email Entry Box (if not in DB) */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5">
              <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <Plus size={14} className="text-amber-600" />
                Add Custom Recipient (if recipient is not in database)
              </div>
              <form onSubmit={handleAddCustomRecipient} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Recipient Name (optional)"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div className="sm:col-span-5">
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="Recipient Email Address *"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Plus size={13} /> Add
                  </button>
                </div>
              </form>
            </div>

            {/* Selected Recipients Badges Summary */}
            {selectedRecipients.length > 0 && (
              <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2">
                <div className="text-xs font-bold text-teal-800 flex items-center justify-between">
                  <span>Selected Recipients List ({selectedRecipients.length})</span>
                  <span className="text-[11px] text-teal-600 font-normal">
                    Emails will be sent individually to each selected recipient
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                  {selectedRecipients.map((rec) => (
                    <span
                      key={rec.email}
                      className="inline-flex items-center gap-1.5 bg-white border border-teal-200 text-teal-900 text-xs px-2.5 py-1 rounded-lg shadow-2xs font-medium"
                    >
                      <span className="font-semibold">{rec.name}</span>
                      <span className="text-slate-400 text-[11px]">({rec.email})</span>
                      <button
                        type="button"
                        onClick={() => removeRecipient(rec.email)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        <XCircle size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Templates Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 transition text-sm font-medium"
        >
          <Sparkles size={16} />
          Quick Email Templates
          <ChevronDown size={14} className={`transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
        </button>

        {showTemplates && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-teal-400 hover:shadow-md transition group"
              >
                <div className="font-medium text-slate-700 group-hover:text-teal-700 text-sm">{tmpl.label}</div>
                <div className="text-xs text-slate-400 mt-0.5 truncate">{tmpl.subject}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversational AI Email Generator (Context Window & Iterative Refinements) */}
      <div className="bg-gradient-to-br from-purple-50/80 via-indigo-50/50 to-slate-50 border border-purple-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-600 text-white rounded-xl shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-purple-900 text-base">Conversational AI Generator</h2>
                <span className="text-[11px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                  Context Window Enabled
                </span>
              </div>
              <p className="text-xs text-purple-700">
                Generate an email draft, then add follow-up instructions to refine context or edit response.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAiPanel((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition"
          >
            <Wand2 size={14} />
            {showAiPanel ? 'Hide Assistant' : 'Open AI Assistant'}
            <ChevronDown size={14} className={`transition-transform ${showAiPanel ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAiPanel && (
          <div className="space-y-4 pt-2">
            {/* Conversation History Context Window */}
            {aiHistory.length > 0 && (
              <div className="border border-purple-200 rounded-xl bg-white p-4 space-y-3 max-h-72 overflow-y-auto">
                <div className="flex items-center justify-between text-xs font-bold text-purple-800 border-b pb-2">
                  <span>Context Window Thread ({Math.ceil(aiHistory.length / 2)} Turns)</span>
                  <button
                    type="button"
                    onClick={resetAiContext}
                    className="text-slate-400 hover:text-rose-600 transition flex items-center gap-1 font-normal"
                  >
                    <RotateCcw size={13} /> Reset AI Context
                  </button>
                </div>

                {aiHistory.map((turn, index) => (
                  <div key={index} className="space-y-1 text-xs">
                    {turn.role === 'user' ? (
                      <div className="bg-purple-50 text-purple-900 p-2.5 rounded-xl border border-purple-100 font-medium">
                        <span className="font-bold text-purple-700 block mb-0.5">Admin Prompt:</span>
                        {turn.text}
                      </div>
                    ) : (
                      <div className="bg-indigo-50/70 text-slate-800 p-2.5 rounded-xl border border-indigo-100">
                        <span className="font-bold text-indigo-700 block mb-0.5">AI Response Generated:</span>
                        <div className="font-semibold text-slate-800">Subject: {turn.parsed?.subject}</div>
                        <div className="text-slate-600 line-clamp-2 mt-1">{turn.parsed?.message}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Generated AI Draft Live Preview Card */}
            {latestAiDraft && (
              <div className="bg-white border-2 border-purple-300 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-600" /> Current AI Generated Draft
                  </span>
                  <button
                    type="button"
                    onClick={applyAiDraftToForm}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-xs"
                  >
                    <ArrowRight size={13} /> Apply to Email Composer Form
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Subject Line:</span>
                    <span className="font-semibold text-slate-800">{latestAiDraft.subject}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Status Badge:</span>
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                      {latestAiDraft.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Preview Teaser:</span>
                  <span className="text-slate-700 italic">{latestAiDraft.preview}</span>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 block font-medium">Main Message Body:</span>
                  <div className="bg-slate-50 p-2.5 rounded-lg border text-slate-700 whitespace-pre-wrap mt-1">
                    {latestAiDraft.message}
                  </div>
                </div>

                {latestAiDraft.additionalMessage && (
                  <div className="text-xs">
                    <span className="text-slate-400 block font-medium">Additional Closing Note:</span>
                    <div className="bg-slate-50 p-2 rounded-lg border text-slate-600 mt-1">
                      {latestAiDraft.additionalMessage}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prompt Input Box (Initial or Follow-up Context Input) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-purple-900">
                {aiHistory.length > 0
                  ? 'Add Context / Refine Current AI Draft (e.g. "Make it more urgent", "Add location: Moradabad Auditorium", "Translate to Hindi")'
                  : 'Describe what you want the email to say (the AI will structure the subject, body, and status)'}
              </label>

              <textarea
                value={aiInputPrompt}
                onChange={(e) => {
                  setAiInputPrompt(e.target.value);
                  setAiError('');
                }}
                rows={3}
                placeholder={
                  aiHistory.length > 0
                    ? 'Enter follow-up instructions to edit/expand the email draft...'
                    : 'e.g. "Draft a thank you email to members who supported our recent book distribution drive, inviting them to our next meeting on Sunday."'
                }
                className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition resize-none placeholder:text-slate-400"
              />

              {aiError && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                  <XCircle size={13} /> {aiError}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                {aiHistory.length > 0 ? (
                  <button
                    type="button"
                    onClick={resetAiContext}
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Clear AI Chat History
                  </button>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => handleAiGenerateOrRefine()}
                  disabled={aiGenerating || !aiInputPrompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition disabled:opacity-60 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {aiGenerating ? (
                    <><Loader size={14} className="animate-spin" /> Processing AI Context...</>
                  ) : (
                    <><Wand2 size={14} /> {aiHistory.length > 0 ? 'Refine & Re-Generate Response' : 'Generate Email Draft'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Email Composer Form */}
      <form onSubmit={handleSend} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Recipient Overview Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Target Recipients ({selectedRecipients.length > 0 ? selectedRecipients.length : 'Single Recipient'})
          </h3>

          {selectedRecipients.length > 0 ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-teal-900">
                  Ready to send to {selectedRecipients.length} selected contact(s)
                </div>
                <div className="text-[11px] text-teal-700 line-clamp-1 mt-0.5">
                  {selectedRecipients.map((r) => r.name).join(', ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRecipientSelector(true)}
                className="text-xs font-semibold text-teal-700 bg-white border border-teal-300 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition shrink-0"
              >
                Modify List
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5"><User size={13} /> Manual Recipient Name</span>
                </label>
                <input
                  name="recipientName"
                  value={form.recipientName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  <span className="flex items-center gap-1.5"><Mail size={13} /> Manual Recipient Email</span>
                </label>
                <input
                  name="recipientEmail"
                  type="email"
                  value={form.recipientEmail}
                  onChange={handleChange}
                  placeholder="e.g. ramesh@example.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Email Subject & Details */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Details</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><Type size={14} /> Subject Line *</span>
            </label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              placeholder="e.g. Thank You from Path Sarthi Trust"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Preview Text <span className="text-slate-400 font-normal">(inbox teaser)</span>
              </label>
              <input
                name="preview"
                value={form.preview}
                onChange={handleChange}
                placeholder="Short teaser shown in email client"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Status Badge Label
              </label>
              <input
                name="status"
                value={form.status}
                onChange={handleChange}
                placeholder="e.g. Thank You / Update / Reminder"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Message Body */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Message Content</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5"><MessageSquare size={14} /> Main Message Body *</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Write your main message here. You can use line breaks for paragraphs. Tip: use {name} to personalize each recipient's name."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-y"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Include <code className="bg-slate-100 px-1 rounded">{'{name}'}</code> in the message body to dynamically substitute each recipient's name.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1.5"><FileText size={14} /> Additional Note / Closing Section</span>
            </label>
            <textarea
              name="additionalMessage"
              value={form.additionalMessage}
              onChange={handleChange}
              rows={3}
              placeholder="Optional closing note or next-step instructions."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-y"
            />
          </div>
        </div>

        {/* Batch Sending Progress Bar & Feedback */}
        {batchProgress && (
          <div className="mx-6 mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>
                {batchProgress.completed
                  ? 'Batch Sending Complete'
                  : `Sending Emails (${batchProgress.current} / ${batchProgress.total})`}
              </span>
              <span>
                {Math.round((batchProgress.current / batchProgress.total) * 100)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
              />
            </div>

            {batchProgress.currentEmail && (
              <p className="text-xs text-slate-500">
                Currently sending to: <span className="font-semibold text-slate-700">{batchProgress.currentEmail}</span>
              </p>
            )}
          </div>
        )}

        {/* Final Feedback Result Banners */}
        {result === 'success' && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            <CheckCircle size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">Email(s) sent successfully!</span> Delivered to target inbox(es).
            </div>
          </div>
        )}

        {result === 'partial' && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <XCircle size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">Partial Send Completion.</span> {errorMsg}
            </div>
          </div>
        )}

        {result === 'error' && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <XCircle size={18} className="shrink-0" />
            <div>
              <span className="font-semibold">Send Failed.</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="p-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition"
          >
            Clear Form
          </button>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition disabled:opacity-60"
            style={{ background: sending ? '#009ba2aa' : 'linear-gradient(135deg, #009ba2, #007f85)' }}
          >
            {sending ? (
              <><Loader size={16} className="animate-spin" /> Sending ({batchProgress?.current || 0}/{batchProgress?.total || 1})...</>
            ) : (
              <><Send size={16} /> Send Email {selectedRecipients.length > 0 ? `(${selectedRecipients.length} Recipients)` : ''}</>
            )}
          </button>
        </div>
      </form>

      {/* Birthday Automation Info Card */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎂</div>
          <div>
            <h3 className="font-bold text-orange-800 mb-1">Birthday Automation Active</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Every day at <strong>12:00 AM IST</strong>, the system scans membership records and sends personalized birthday emails to members whose birthday is today. Ensure members have a valid <code className="bg-orange-100 px-1 rounded text-xs">dob</code> field in Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailComposer;
