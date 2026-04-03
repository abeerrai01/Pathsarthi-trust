import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { Trash2, Edit2, Plus, UploadCloud, X } from 'lucide-react';

const SCHEMAS = {
  board_of_trustees: {
    label: "Board of Trustees",
    collectionName: "board_of_trustees",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "joinedDate", label: "Joined Date (YYYY-MM-DD)", type: "date" },
      { name: "image", label: "Profile Photo", type: "image" },
    ]
  },
  members: {
    label: "Members",
    collectionName: "members",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"], required: true },
      { name: "district", label: "District", type: "text", required: true },
      { name: "state", label: "State", type: "text", required: true },
      { name: "image", label: "Profile Photo", type: "image" },
    ]
  },
  supporters: {
    label: "Supporters / Pillars of Support",
    collectionName: "supporters",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "since", label: "Since (Year)", type: "text" },
      { name: "description", label: "Short Description", type: "text" },
      { name: "story", label: "Full Story", type: "textarea" },
      { name: "image", label: "Logo / Photo", type: "image" },
    ]
  },
  advisory_volunteers: {
    label: "Advisory Volunteers",
    collectionName: "advisory_volunteers",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "type", label: "Advisory Type", type: "select", options: ["Legal", "Health", "General"], required: true },
      { name: "role", label: "Role / Qualification", type: "text" },
      { name: "image", label: "Profile Photo", type: "image" },
    ]
  }
};

const TeamManager = () => {
  const [activeTab, setActiveTab] = useState('board_of_trustees');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const currentSchema = SCHEMAS[activeTab];

  // Fetch Items on Tab Change
  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const fetchItems = async (tabKey) => {
    setLoading(true);
    try {
      const colName = SCHEMAS[tabKey].collectionName;
      const snap = await getDocs(collection(db, colName));
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetched);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({});
    setSelectedImage(null);
    setMessage('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setSelectedImage(null); // Keep old image unless selected anew
    setMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, currentSchema.collectionName, id));
      setItems(items.filter(item => item.id !== id));
      alert("Deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error deleting record");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      let imageUrlStr = formData.image || ''; // existing image

      if (selectedImage) {
        setMessage('Uploading image to Cloudinary... please wait.');
        const { imageUrl } = await uploadToCloudinary(selectedImage);
        imageUrlStr = imageUrl;
      }

      const payload = {
        ...formData,
        image: imageUrlStr,
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        setMessage('Updating record...');
        await updateDoc(doc(db, currentSchema.collectionName, editingId), payload);
        setMessage('Updated Successfully!');
      } else {
        setMessage('Creating new record...');
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, currentSchema.collectionName), payload);
        setMessage('Added Successfully!');
      }

      // Refresh list
      fetchItems(activeTab);
      
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSaving(false);
        setMessage('');
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setMessage(`Error: ${error.message}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Team & Supporters Manager</h2>
          <p className="text-slate-500 mt-1">Easily update team members, trustees, and supporters content.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center font-semibold transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New
        </button>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-xl">
        {Object.keys(SCHEMAS).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {SCHEMAS[key].label}
          </button>
        ))}
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading data...</div>
      ) : (
        <div className="overflow-x-auto">
          {items.length === 0 ? (
            <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No records found. Click "Add New" to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="py-4 px-4 font-semibold text-slate-600">Photo</th>
                  {currentSchema.fields.filter(f => f.type !== 'image' && f.type !== 'textarea').map(field => (
                    <th key={field.name} className="py-4 px-4 font-semibold text-slate-600">{field.label}</th>
                  ))}
                  <th className="py-4 px-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      {item.image ? (
                        <img src={item.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-lg">
                          {(item.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </td>
                    {currentSchema.fields.filter(f => f.type !== 'image' && f.type !== 'textarea').map(field => (
                      <td key={field.name} className="py-3 px-4 text-slate-700 max-w-[200px] truncate">
                        {item[field.name]}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-right space-x-2">
                      <button 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded bg-white border border-blue-200 transition" 
                        title="Edit"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded bg-white border border-red-200 transition" 
                        title="Delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          <div className="bg-white rounded-2xl w-full max-w-xl z-10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit" : "Add New"} {currentSchema.label}
              </h3>
              <button 
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="team-form" onSubmit={handleSave} className="space-y-5">
                {currentSchema.fields.map(field => {
                  if (field.type === 'text') {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                        <input 
                          type="text" 
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                      </div>
                    );
                  }
                  if (field.type === 'date') {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                        <input 
                          type="date" 
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    );
                  }
                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                        <textarea 
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    );
                  }
                  if (field.type === 'select') {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">{field.label}</label>
                        <select 
                          name={field.name}
                          required={field.required}
                          value={formData[field.name] || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                          <option value="" disabled>Select {field.label}</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                    );
                  }
                  if (field.type === 'image') {
                    return (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                        <div className="flex items-center gap-4">
                          {formData.image && !selectedImage && (
                            <img src={formData.image} alt="preview" className="w-16 h-16 rounded-lg object-cover border" />
                          )}
                          <div className="flex-1 relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Uploading a new image will replace the old one automatically.</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </form>
              
              {message && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm text-center font-medium border border-blue-200">
                  {message}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button 
                type="button" 
                disabled={isSaving}
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="team-form"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-semibold flex items-center justify-center min-w-[120px] disabled:opacity-70"
              >
                {isSaving ? 'Processing...' : 'Save Details'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
