import React, { useEffect, useState } from 'react';
import { apiUrl } from './config/api';

const ReportIssue = ({ reporter, onCreateIssue }) => {
  const MAX_PHOTOS = 4;
  const currentReporter = reporter || 'Armaan';
  const [formData, setFormData] = useState({
    title: '',
    category: 'IT',
    priority: 'Medium',
    location: '',
    description: ''
  });
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [photos]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      reporter: currentReporter,
      photos: photos.map((photo) => photo.file.name)
    };

    try {
      console.log('[ReportIssue] Submitting payload:', payload);
      
      // Send to Flask backend
      const response = await fetch(apiUrl('/api/report'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[ReportIssue] Response status:', response.status);
      
      const result = await response.json();
      console.log('[ReportIssue] Server response:', result);

      if (!result.success) {
        alert('Server error: ' + (result.message || 'Unknown error'));
        return;
      }

      console.log('[ReportIssue] Issue created with ID:', result.issue_id);
      
      onCreateIssue({ ...payload, id: result.issue_id || Date.now(), status: 'Pending' });
      alert(`Complaint #${result.issue_id} submitted successfully! 🚀\nStatus: Pending`);

    } catch (error) {
      console.error('[ReportIssue] Error submitting complaint:', error);
      alert('Failed to connect to the server. Is the backend running?');
      return;
    }

    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2600);
    setFormData((prev) => ({ ...prev, title: '', location: '', description: '' }));
  };

  const handlePhotoChange = (e) => {
    const incomingFiles = Array.from(e.target.files || []);
    if (!incomingFiles.length) {
      return;
    }

    const slotsLeft = MAX_PHOTOS - photos.length;
    const selectedFiles = incomingFiles.slice(0, slotsLeft);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));
    const nextPhotos = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));

    setPhotos((prev) => [...prev, ...nextPhotos]);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos((prev) => {
      const photoToRemove = prev[index];
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const charsUsed = formData.description.length;
  const maxChars = 240;



  return (
    <div className="screen-wrap report-screen">
      <div className="screen-head">
        <h2>Report an Issue</h2>
        <p>Raise a clear complaint and we will route it to the right team fast.</p>
      </div>

      {submitted ? <div className="form-toast fade-slide-in">Issue submitted successfully.</div> : null}

      <section className="report-grid">
        <aside className="form-side-card fade-rise">
          <h3>How to file a great report</h3>
          <ul>
            <li>Add a specific location for quick action.</li>
            <li>Keep title short and description clear.</li>
            <li>Attach photos for faster issue diagnosis.</li>
          </ul>
          <div className="badge-row">
            <span className="chip">Live tracking</span>
            <span className="chip">Team assignment</span>
            <span className="chip">Fast resolution</span>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="report-form-card fade-rise" style={{ animationDelay: '80ms' }}>
          <div className="form-row">
            <label htmlFor="title">Issue title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Water cooler not working near Lab 3"
              required
            />
          </div>

          <div className="form-split">
            <div className="form-row">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}>
                <option value="IT">IT and Network</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Block B, 2nd floor, near staircase"
              required
            />
          </div>

          <div className="form-row">
            <div className="row-title">
              <label htmlFor="description">Description</label>
              <span>{charsUsed}/{maxChars}</span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the issue in detail so the maintenance team can act without follow-up questions."
              maxLength={maxChars}
              required
              rows="5"
            />

          </div>

          <div className="form-row">
            <div className="row-title">
              <label htmlFor="photos">Upload photos</label>
              <span>{photos.length}/{MAX_PHOTOS} selected</span>
            </div>

            <label htmlFor="photos" className="upload-dropzone">
              <strong>Click to upload</strong>
              <span>PNG, JPG, WEBP up to {MAX_PHOTOS} images</span>
            </label>
            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              className="hidden-file-input"
              onChange={handlePhotoChange}
              disabled={photos.length >= MAX_PHOTOS}
            />

            {photos.length > 0 ? (
              <div className="photo-grid">
                {photos.map((photo, index) => (
                  <figure key={`${photo.file.name}-${index}`} className="photo-tile fade-slide-in">
                    <img src={photo.previewUrl} alt={`Attachment ${index + 1}`} />
                    <button type="button" className="photo-remove" onClick={() => removePhoto(index)}>
                      Remove
                    </button>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>

          <div className="form-footer">
            <p>Reporter: <strong>{currentReporter}</strong></p>
            <button type="submit" className="primary-btn">Submit Report</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ReportIssue;
