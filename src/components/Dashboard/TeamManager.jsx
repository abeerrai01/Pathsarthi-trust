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
  const [isMigrating, setIsMigrating] = useState(false);

  const currentSchema = SCHEMAS[activeTab];

  // ONE-TIME MIGRATION DATA
  const LEGACY_DATA = {
    board_of_trustees: [
      { name: 'Ravi Prakash Rai', gender: 'Male', designation: 'Chairman', joinedDate: '2022-02-23', image: '/Chairman.jpg' },
      { name: 'Om Prakash Rai', gender: 'Male', designation: 'Accountant', joinedDate: '2022-02-23' },
      { name: 'Arun Kumar Singh', gender: 'Male', designation: 'Secretary', joinedDate: '2022-02-23', image: '/Arun Kumar.jpg' },
      { name: 'Rupesh Kumar Chauhan', gender: 'Male', designation: 'Vice-President', joinedDate: '2022-06-27' },
      { name: 'Sanjay Sharma', gender: 'Male', designation: 'District President', joinedDate: '2024-10-01' },
      { name: 'Srinivas Rai', gender: 'Male', designation: 'State President', district: 'Manali', state: 'Himachal Pradesh', joinedDate: '2024-06-01', image: '/Srinavas.jpg' },
      { name: 'Rajeev Bishnoi', gender: 'Male', designation: 'State Coordinator', joinedDate: '2025-01-22', image: '/Rajeev.jpg' },
      { name: 'Satya Prakash Rai', gender: 'Male', designation: 'Member', joinedDate: '2022-07-14' },
      { name: 'Mridul Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
      { name: 'Priyansh Manas Rai', gender: 'Male', designation: 'Co-Secretary', joinedDate: '2022-07-14' },
      { name: 'Abeer Rai', gender: 'Male', designation: 'Technical Director', joinedDate: '2025-04-01', image: '/abeer.jpg' },
      { name: 'Shreyansh Rai', gender: 'Male', designation: 'Internship Coordinator', joinedDate: '2025-07-01', image: '/Shreyansh.jpg' },
      { name: 'Mehair Tripathi', gender: 'Male', designation: 'Trustee', joinedDate: '2025-06-01' },
      { name: 'Swechha Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2023-01-01', image: '/Swechha.jpg' },
      { name: 'Pramila Rai', gender: 'Female', designation: 'Trustee', joinedDate: '2025-04-01', image: '/Pramila.jpg' },
      { name: 'Deepansh Manas Rai', gender: 'Male', designation: 'Trustee', joinedDate: '2023-01-01' },
    ],
    members: [
      { name: 'Sameer Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Sameer Sharma.jpg' },
      { name: 'Pawan Thakur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
      { name: 'Amrit Agrawal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
      { name: 'Vikas Mathur', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
      { name: 'Bhag Singh', gender: 'Male', district: 'Bijnor', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Bhag Singh.jpg' },
      { name: 'Neeraj Gupta', gender: 'Male', district: 'Bareilly', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
      { name: 'Neeraj Chaturvedi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01' },
      { name: 'Sanjeev Rastogi', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', designation: 'Member', joinedDate: '2023-01-01', image: '/Sanjeev Rastogi.jpg' },
      { name: 'Jatadhari Rai', gender: 'Male', district: 'Jaunpur', state: 'Uttar Pradesh' },
      { name: 'Manoj Sinha', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
      { name: 'Shailendra Singh', gender: 'Male', district: 'Chandausi', state: 'Uttar Pradesh' },
      { name: 'Gaurav Kathuriya', gender: 'Male', district: 'Delhi', state: 'Delhi' },
      { name: 'Sanjay Rai', gender: 'Male', district: 'Ghaziabad', state: 'Uttar Pradesh', image: '/Sanjay rai.jpg' },
      { name: 'Sanjay Rai', gender: 'Male', district: 'Mumbai', state: 'Maharashtra' },
      { name: 'Pradeep Rai', gender: 'Male', district: 'Azamgarh', state: 'Uttar Pradesh' },
      { name: 'Navneet Kumar Saxena', gender: 'Male', district: 'Rampur', state: 'Uttar Pradesh' },
      { name: 'Rajendra Prasad Singh', gender: 'Male', district: 'Varanasi', state: 'Uttar Pradesh' },
      { name: 'Madan Singh Negi', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
      { name: 'Nathi Singh Bartwal', gender: 'Male', district: 'Noida', state: 'Uttar Pradesh' },
      { name: 'Yashu Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
      { name: 'Anil Kumar Sharma', gender: 'Male', district: 'Guna', state: 'Madhya Pradesh' },
      { name: 'Rajendra Kumar Dhingra', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
      { name: 'Kailash Chandra Sharma', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh' },
      { name: 'Parminder Sharma', gender: 'Male', district: 'Ludhiana', state: 'Punjab' },
      { name: 'Amit Kumar Shukla', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/amit kumar.jpg' },
      { name: 'Varun', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/varun.jpg' },
      { name: 'Pradeep Kumar', gender: 'Male', district: 'Barielly', state: 'Uttar Pradesh', image: '/pradeep.jpg' },
      { name: 'Sachin Mittal', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/sachin mittal.jpg' },
      { name: 'Anil Kumar Gupta', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Anil.jpg' },
      { name: 'Ayush Kumar Singh', gender: 'Male', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Ayush.jpg' },
      { name: 'Seema Singh', gender: 'Female', district: 'Moradabad', state: 'Uttar Pradesh', image: '/Seema Singh.jpg' },
    ],
    supporters: [
      { name: "SNR Hotel", since: "2024", description: "Stay with comfort - SNR Hotel, Old Manali", story: "SNR Hotel joined as a supporter in 2024...", image: "/SNR hotel.jpg" },
      { name: "Sachin Tube Company", since: "2024", description: "Supported infrastructure for donation drives", story: "Sachin Tube Company provided essential infrastructure...", image: "/Sachin tube.jpg" },
      { name: "Rastogi Provisional Store", since: "2023", description: "Donated weekly food and ration packs", story: "Rastogi Provisional Store has been a consistent supporter..." },
      { name: "RJS Associates", since: "2024", description: "Provided financial guidance and sponsorship", story: "RJS Associates offered invaluable financial guidance..." },
    ],
    advisory_volunteers: [
      { name: 'Adv.Gurbachan Singh Chawla', gender: 'Male', designation: 'Tax Advisor', type: 'Legal', joinedDate: '2025-07-08', image: '/GURBACHAN SINGH CHAWLA.jpg' },
      { name: 'Adv. Paramveer Singh', gender: 'Male', designation: 'Criminal Lawyer', type: 'Legal', joinedDate: '2025-07-08', image: '/Paramveer singh.jpg' },
      { name: 'Dr. Sandeep Kumar Bharti', gender: 'Male', designation: 'Health Advisor', type: 'Health', joinedDate: '2023-04-01' },
    ]
  };

  const handleMigrate = async () => {
    if (!window.confirm("This will import all existing website members into the database. Continue?")) return;
    setIsMigrating(true);
    let count = 0;
    try {
      for (const [tabKey, tabData] of Object.entries(LEGACY_DATA)) {
        const colName = SCHEMAS[tabKey].collectionName;
        for (const item of tabData) {
          await addDoc(collection(db, colName), { ...item, createdAt: serverTimestamp() });
          count++;
        }
      }
      alert(`Success! Imported ${count} records. Refresing...`);
      fetchItems(activeTab);
    } catch (err) {
      console.error(err);
      alert("Error during migration: " + err.message);
    }
    setIsMigrating(false);
  };

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
        <div className="flex gap-2">
          <button 
            disabled={isMigrating}
            onClick={handleMigrate}
            className="border border-slate-300 hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-lg flex items-center font-semibold transition text-sm disabled:opacity-50"
            title="Import hardcoded data from the website for the first time"
          >
            {isMigrating ? "Importing..." : "Import Existing Data"}
          </button>
          <button 
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center font-semibold transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </button>
        </div>
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
