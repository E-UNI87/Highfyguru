// Add resourceType to your Schema
const NoteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  branch: String,
  college: String,
  resourceType: { type: String, default: 'Note' }, // <--- ADD THIS LINE
  fileUrl: String,
  isExternalLink: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now }
});