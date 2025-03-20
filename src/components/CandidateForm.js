import React, { useState } from "react";
import axios from "axios";
import "./CandidateForm.css";
import { useNavigate } from "react-router-dom";

const CandidateForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    residentialStreet1: "",
    residentialStreet2: "",
    sameAsResidential: false,
    permanentStreet1: "",
    permanentStreet2: "",
      profilePhoto: null,
  });

  const [documents, setDocuments] = useState([{ id: Date.now(), fileName: "", fileType: "", file: null }]);
  const [errors, setErrors] = useState({});
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;

  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: type === "checkbox" ? checked : value,
  }));

  // ✅ Remove error when user corrects input
  setErrors((prevErrors) => {
    const newErrors = { ...prevErrors };
    if (value.trim()) {
      delete newErrors[name];
    }
    return newErrors;
  });
};
const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0]; // Get the first selected file
    if (file) {
      setFormData({
        ...formData,
        profilePhoto: file, // Store the file in state
      });
    }
  };

const handleFileChange = (index, e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileExtension = file.name.split(".").pop().toLowerCase();
  const selectedType = documents[index]?.fileType || "";

  let valid = false;
  if (selectedType === "image" && ["jpg", "jpeg", "png"].includes(fileExtension)) {
    valid = true;
  } else if (selectedType === "pdf" && fileExtension === "pdf") {
    valid = true;
  }

  const newDocuments = [...documents];

  if (!valid) {
    // ❌ Incorrect file warning (do NOT remove file input)
    setErrors((prevErrors) => ({
  ...prevErrors,
  [`documents-${index}`]: "Incorrect file type selected. Please upload a valid file.",
}));
  } else {
    newDocuments[index].file = file;
    
    // ✅ Remove error when user selects a valid file
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[`documents-${index}`]; 
      return newErrors;
    });
  }

  setDocuments(newDocuments);
};


  // Update document row field
const handleDocumentChange = (index, field, value) => {
  const newDocuments = [...documents];
  newDocuments[index][field] = value;
  setDocuments(newDocuments);

  // ✅ Remove warning if at least 2 documents are uploaded
  setErrors((prevErrors) => {
    const newErrors = { ...prevErrors };
    if (documents.length >= 2) {
      delete newErrors.documents;
    }
    return newErrors;
  });
};
const addDocumentRow = () => {
  setDocuments((prevDocs) => {
    const updatedDocs = [
      ...prevDocs,
      { id: Date.now(), fileName: "", fileType: "", file: null }
    ];

    // ✅ Show warning if fewer than 2 documents exist
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (updatedDocs.length < 2) {
        newErrors.documents = "At least 2 documents must be uploaded.";
      } else {
        delete newErrors.documents;
      }
      return newErrors;
    });

    return updatedDocs;
  });
};
const removeDocumentRow = (index) => {
  if (documents.length <= 1) {
    console.warn("At least one document row must remain.");
    return;
  }

  setDocuments((prevDocs) => {
    const updatedDocs = prevDocs.filter((_, i) => i !== index);

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (updatedDocs.length < 2) {
        newErrors.documents = "At least 2 documents must be uploaded.";
      } else {
        delete newErrors.documents;
      }
      return newErrors;
    });

    return updatedDocs;
  });
};
const handleSubmit = async (e) => {
  e.preventDefault();
  const isValid = validateForm(); // Validate the form first
  if (!isValid) return; // If not valid, stop further execution

  // Form submission logic
  const formDataObj = new FormData();
  Object.keys(formData).forEach((key) => {
    formDataObj.append(key, formData[key]);
  });
  documents.forEach((doc) => {
    if (doc.file) {
      formDataObj.append("documents", doc.file);
    }
  });

  try {
    const response = await axios.post("http://localhost:5000/api/candidates", formDataObj, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 201) {
      alert("Form submitted successfully!");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Error submitting form. Please try again.");
  }
};

 
 // Validate form fields
  const validateForm = (updatedFormData = formData) => {
  let newErrors = {};

  if (!updatedFormData.firstName.trim()) newErrors.firstName = "First name is required.";
  if (!updatedFormData.lastName.trim()) newErrors.lastName = "Last name is required.";
  if (!updatedFormData.email.trim() || !/^\S+@\S+\.\S+$/.test(updatedFormData.email))
    newErrors.email = "Enter a valid email.";
  if (!updatedFormData.dob) {
    newErrors.dob = "Date of Birth is required.";
  } else {
    const age = new Date().getFullYear() - new Date(updatedFormData.dob).getFullYear();
    if (age < 18) newErrors.dob = "You must be at least 18 years old.";
  }
  if (!updatedFormData.residentialStreet1.trim()) newErrors.residentialStreet1 = "Street 1 is required.";
  if (!updatedFormData.residentialStreet2.trim()) newErrors.residentialStreet2 = "Street 2 is required.";
  if (!updatedFormData.sameAsResidential) {
    if (!updatedFormData.permanentStreet1.trim()) newErrors.permanentStreet1 = "Street 1 is required.";
    if (!updatedFormData.permanentStreet2.trim()) newErrors.permanentStreet2 = "Street 2 is required.";
  }
  if (documents.length < 2) newErrors.documents = "At least two documents must be uploaded.";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0; // Return true if no errors
};

  
  return (
    <div className="form-container">
      <h2>CANDIDATE'S DOCUMENT SUBMISSION FORM</h2>
      <form>
<div className="form-group">
  <label htmlFor="profilePhoto" className="form-label">
    Profile Photo
  </label>
  <input
    type="file"
    
    name="profilePhoto"
    accept="image/*"
    onChange={handleProfilePhotoChange}
  />
  {errors.profilePhoto && <p className="error">{errors.profilePhoto}</p>}
</div>



        {/* First Row: First Name, Last Name */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name *</label>
            <input type="text" name="firstName" placeholder="Enter your first name here.." value={formData.firstName} onChange={handleInputChange} />
            {errors.firstName && <p className="error">{errors.firstName}</p>}
          </div>
          <div className="form-group">
            <label>Last Name *</label>
            <input type="text" name="lastName" placeholder="Enter your last name here.." value={formData.lastName} onChange={handleInputChange} />
            {errors.lastName && <p className="error">{errors.lastName}</p>}
          </div>
        </div>

        {/* Second Row: Email, DOB */}
        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input type="email" name="email" placeholder="e.g., myname@example.com" value={formData.email} onChange={handleInputChange} />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label>Date of Birth *</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
            {errors.dob && <p className="error">{errors.dob}</p>}
          </div>
        </div>

        {/* Residential Address */}
        <div className="form-group full-width">
          <label>Residential Address *</label>
          <input type="text" name="residentialStreet1" placeholder="Street 1" value={formData.residentialStreet1} onChange={handleInputChange} />
          {errors.residentialStreet1 && <p className="error">{errors.residentialStreet1}</p>}
          <input type="text" name="residentialStreet2" placeholder="Street 2" value={formData.residentialStreet2} onChange={handleInputChange} />
 {errors.residentialStreet2 && <p className="error">{errors.residentialStreet2}</p>}
        </div>

        {/* Same as Residential Checkbox */}
        <div className="form-group full-width">
          <label>
            <input type="checkbox" name="sameAsResidential" checked={formData.sameAsResidential} onChange={handleInputChange} /> Same as Residential Address
          </label>
        </div>

        {/* Permanent Address (conditionally required) */}
        {/* Permanent Address (conditionally required) */}
{!formData.sameAsResidential && (
  <div className="form-group full-width">
    <label>Permanent Address *</label>
    
    <input 
      type="text" 
      name="permanentStreet1" 
      placeholder="Street 1" 
      value={formData.permanentStreet1} 
      onChange={handleInputChange} 
    />
    {errors.permanentStreet1 && <p className="error">{errors.permanentStreet1}</p>}

    <input 
      type="text" 
      name="permanentStreet2" 
      placeholder="Street 2" 
      value={formData.permanentStreet2} 
      onChange={handleInputChange} 
    />
    {errors.permanentStreet2 && <p className="error">{errors.permanentStreet2}</p>}
  </div>
)}
{/* Upload Documents Section */}
<div className="form-group full-width">
  <label>Upload Documents (At least 2) *</label>
  {errors.documents && <p className="error">{errors.documents}</p>}
</div>

{/* Document Upload Fields */}
{documents.map((doc, index) => (
  <div className="document-row" key={doc.id}>
    {/* File Name Input */}
    <input 
      type="text" 
      placeholder="Enter file name" 
      value={doc.fileName} 
      onChange={(e) => handleDocumentChange(index, "fileName", e.target.value)} 
    />

    {/* File Type Dropdown */}
    <select 
      value={doc.fileType} 
      onChange={(e) => handleDocumentChange(index, "fileType", e.target.value)} 
    >
      <option value="">Select type</option>
      <option value="image">Image</option>
      <option value="pdf">PDF</option>
    </select>

    {/* File Upload Input */}
    <input 
      type="file" 
      name="documents"
      accept="image/*,application/pdf" 
      onChange={(e) => handleFileChange(index, e)} 
    />

    {/* Show warning if file type is incorrect */}
    {errors[`documents-${index}`] && <p className="error">{errors[`documents-${index}`]}</p>}

    {/* Add and Remove Buttons */}
    <div className="doc-actions">
      {documents.length > 1 && (
        <button type="button" onClick={() => removeDocumentRow(index)}>Delete</button>
      )}
      {index === documents.length - 1 && (
        <button type="button" onClick={addDocumentRow}>+</button>
      )}
    </div>
  </div>
))}


<div className="button-container">
<button type="submit" onClick={handleSubmit}>
          Submit
        </button></div>
      </form>
    </div>
      
  );
};

export default CandidateForm;