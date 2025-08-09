import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { getDB, initDB } from '../database/db.js';
import { contentProcessor } from '../logic/contentProcessor.js';

const { FiUpload, FiBook, FiFileText, FiImage, FiFilePlus, FiCheck, FiX, FiLoader, FiTrash, FiEdit } = FiIcons;

function ParentPortal() {
  const [subjects, setSubjects] = React.useState([]);
  const [selectedSubject, setSelectedSubject] = React.useState(null);
  const [uploadedContent, setUploadedContent] = React.useState([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({});
  const [showNewSubject, setShowNewSubject] = React.useState(false);
  const [newSubjectData, setNewSubjectData] = React.useState({ name: '', description: '', grade: 'K-12' });
  const [showImportJson, setShowImportJson] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState(null);
  const [generatedQuestions, setGeneratedQuestions] = React.useState([]);

  // Initialize database and load data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Initializing database...');
        await initDB();
        console.log('Database initialized successfully');
        
        const db = getDB();
        console.log('Getting subjects...');
        const loadedSubjects = await db.getSubjects();
        console.log('Loaded subjects:', loadedSubjects);
        
        console.log('Getting content...');
        const content = await db.getAllContent();
        console.log('Loaded content:', content);
        
        console.log('Getting generated questions...');
        const questions = await db.getAllGeneratedQuestions();
        console.log('Loaded questions:', questions.length);
        
        setSubjects(loadedSubjects);
        setUploadedContent(content);
        setGeneratedQuestions(questions);
      } catch (error) {
        console.error('Failed to load data:', error);
        console.error('Error details:', error.message, error.stack);
      }
    };
    
    loadData();
  }, []);

  const handleFileUpload = async (files) => {
    if (!selectedSubject) {
      alert('Please select a subject first!');
      return;
    }

    setIsUploading(true);
    const db = getDB();

    for (const file of files) {
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        // Update progress
        setUploadProgress(prev => ({ ...prev, [uploadId]: { status: 'reading', progress: 0 } }));

        // Read file content
        const content = await readFileContent(file);
        
        setUploadProgress(prev => ({ ...prev, [uploadId]: { status: 'saving', progress: 30 } }));

        // Save content to database
        const contentData = {
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          subjectId: selectedSubject.id,
          contentType: getContentType(file.type, file.name),
          content: content,
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedBy: 'parent' // Could be expanded to track specific parent users
          }
        };

        const savedContentId = await db.addContent(contentData);
        
        // Get the full content object with the generated ID
        const fullContentData = { ...contentData, id: savedContentId };
        
        setUploadProgress(prev => ({ ...prev, [uploadId]: { status: 'processing', progress: 60 } }));

        // Generate questions from content
        try {
          const questions = await contentProcessor.processContent(fullContentData);
          
          setUploadProgress(prev => ({ ...prev, [uploadId]: { 
            status: 'completed', 
            progress: 100, 
            questionsGenerated: questions.length 
          }}));

          // Track upload success
          await db.trackUpload({
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            contentId: savedContentId,
            questionsGenerated: questions.length
          });

        } catch (processingError) {
          console.error('Question generation failed:', processingError);
          setUploadProgress(prev => ({ ...prev, [uploadId]: { 
            status: 'processing_failed', 
            progress: 100, 
            error: processingError.message 
          }}));
        }

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadProgress(prev => ({ ...prev, [uploadId]: { 
          status: 'failed', 
          progress: 100, 
          error: error.message 
        }}));
      }
    }

    // Reload content after uploads
    const updatedContent = await db.getAllContent();
    setUploadedContent(updatedContent);
    setIsUploading(false);

    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress({});
    }, 5000);
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      // Read file based on type
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        reader.readAsArrayBuffer(file);
      } else {
        // For other files, read as text and hope for the best
        reader.readAsText(file);
      }
    });
  };

  const getContentType = (mimeType, fileName = '') => {
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) return 'pdf';
    return 'text'; // Default fallback
  };

  const handleCreateSubject = async () => {
    if (!newSubjectData.name.trim()) {
      alert('Subject name is required!');
      return;
    }

    try {
      const db = getDB();
      await db.addSubject(newSubjectData);
      const updatedSubjects = await db.getSubjects();
      setSubjects(updatedSubjects);
      setNewSubjectData({ name: '', description: '', grade: 'K-12' });
      setShowNewSubject(false);
    } catch (error) {
      console.error('Failed to create subject:', error);
      alert('Failed to create subject. Please try again.');
    }
  };

  const handleExportQuestions = async () => {
    try {
      const db = getDB();
      const questions = await db.getAllGeneratedQuestions();
      
      if (questions.length === 0) {
        alert('No generated questions to export!');
        return;
      }
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(questions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated_questions_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export questions:', error);
      alert('Failed to export questions. Check console for details.');
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Are you sure you want to delete this content? All generated questions will also be removed.')) {
      return;
    }

    try {
      const db = getDB();
      await db.delete('content', contentId);
      
      // Also delete associated questions
      const questions = await db.getQuestionsByContent(contentId);
      for (const question of questions) {
        await db.delete('generated_questions', question.id);
      }

      const updatedContent = await db.getAllContent();
      setUploadedContent(updatedContent);
    } catch (error) {
      console.error('Failed to delete content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  const getUploadProgressInfo = () => {
    const progressEntries = Object.entries(uploadProgress);
    if (progressEntries.length === 0) return null;

    const completed = progressEntries.filter(([_, progress]) => 
      progress.status === 'completed' || progress.status === 'failed' || progress.status === 'processing_failed'
    ).length;

    const totalQuestions = progressEntries.reduce((sum, [_, progress]) => 
      sum + (progress.questionsGenerated || 0), 0
    );

    return { total: progressEntries.length, completed, totalQuestions };
  };

  // Generate TTS instruction for a question
  const generateTTSInstruction = (question) => {
    const topicIntros = {
      'breuke': 'Luister mooi. Hierdie vraag gaan oor breuke.',
      'geld': 'Luister aandagtig. Dit is \'n praktiese geld-vraag.',
      'getalle': 'Luister aandagtig. Hier werk ons met getalle.',
      'default': 'Luister mooi na hierdie wiskundevraag.'
    };

    const typeInstructions = {
      'mcq': 'Lees elke opsie rustig deur, dink oor hoekom dit reg of verkeerd kan wees, en kies die beste antwoord.',
      'short': 'Sê net die kort antwoord hardop of skryf dit neer; fokus op die stappe wat jou daar bring.',
      'numeric': 'Gee die numeriese antwoord. Werk netjies en hou eenhede in gedagte waar toepaslik.'
    };

    // Determine topic category
    let topicKey = 'default';
    const topicLower = question.topic?.toLowerCase() || '';
    if (topicLower.includes('breuke')) topicKey = 'breuke';
    else if (topicLower.includes('geld') || topicLower.includes('sent')) topicKey = 'geld';
    else if (topicLower.includes('getal')) topicKey = 'getalle';

    // Build TTS instruction
    const intro = topicIntros[topicKey];
    const context = question.hint ? `Onthou: ${question.hint}` : '';
    const questionText = `Die vraag lui: ${question.prompt}`;
    const instruction = typeInstructions[question.type] || typeInstructions['mcq'];

    return `${intro} ${context} ${questionText} ${instruction}`.trim().replace(/\s+/g, ' ');
  };

  // Import JSON questions
  const handleImportJson = async (file) => {
    try {
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      const questions = JSON.parse(fileContent);
      
      if (!Array.isArray(questions)) {
        throw new Error('JSON must contain an array of questions');
      }

      const db = getDB();
      let imported = 0;

      for (const question of questions) {
        // Enhance with TTS instruction if not present
        if (!question.ttsInstruction) {
          question.ttsInstruction = generateTTSInstruction(question);
        }

        // Set default subject if needed
        const subjectId = selectedSubject?.id || 1;
        
        const questionData = {
          ...question,
          contentId: null, // Imported questions don't belong to specific content
          subjectId: subjectId,
          source: 'JSON Import',
          generatedAt: Date.now()
        };

        await db.addGeneratedQuestion(questionData);
        imported++;
      }

      // Reload questions
      const updatedQuestions = await db.getAllGeneratedQuestions();
      setGeneratedQuestions(updatedQuestions);

      alert(`Successfully imported ${imported} questions!`);
      setShowImportJson(false);

    } catch (error) {
      console.error('JSON import failed:', error);
      alert(`Import failed: ${error.message}`);
    }
  };

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const db = getDB();
      await db.delete('generated_questions', questionId);
      
      const updatedQuestions = await db.getAllGeneratedQuestions();
      setGeneratedQuestions(updatedQuestions);
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // Update question
  const handleUpdateQuestion = async (updatedQuestion) => {
    try {
      const db = getDB();
      await db.updateGeneratedQuestion(updatedQuestion.id, updatedQuestion);
      
      const updatedQuestions = await db.getAllGeneratedQuestions();
      setGeneratedQuestions(updatedQuestions);
      setEditingQuestion(null);
      alert('Question updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      alert(`Update failed: ${error.message}`);
    }
  };

  const progressInfo = getUploadProgressInfo();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-primary-800 mb-2">
          Parent Portal
        </h1>
        <p className="text-lg text-primary-600">
          Upload study materials to create personalized questions for your child
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Management */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Subjects</h2>
            <button
              onClick={() => setShowNewSubject(true)}
              className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              title="Add Subject"
            >
              <SafeIcon icon={FiFilePlus} />
            </button>
          </div>

          {/* New Subject Form */}
          <AnimatePresence>
            {showNewSubject && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-4 p-4 bg-gray-50 rounded-lg"
              >
                <input
                  type="text"
                  placeholder="Subject name"
                  value={newSubjectData.name}
                  onChange={(e) => setNewSubjectData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={newSubjectData.description}
                  onChange={(e) => setNewSubjectData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded mb-2"
                />
                <select
                  value={newSubjectData.grade}
                  onChange={(e) => setNewSubjectData(prev => ({ ...prev, grade: e.target.value }))}
                  className="w-full p-2 border rounded mb-3"
                >
                  <option value="K-12">K-12</option>
                  <option value="Elementary">Elementary</option>
                  <option value="Middle School">Middle School</option>
                  <option value="High School">High School</option>
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateSubject}
                    className="flex-1 bg-success-500 text-white py-2 rounded hover:bg-success-600"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowNewSubject(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subject List */}
          <div className="space-y-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedSubject?.id === subject.id
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{subject.name}</div>
                <div className="text-sm opacity-75">{subject.grade}</div>
              </button>
            ))}
            {subjects.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No subjects yet. Create one to get started!
              </p>
            )}
          </div>
        </motion.div>

        {/* Content Upload */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Content</h2>
          
          {selectedSubject ? (
            <>
              <div className="mb-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  <strong>Selected Subject:</strong> {selectedSubject.name}
                </p>
              </div>

              <FileUploadZone 
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
              />

              {/* Upload Progress */}
              <AnimatePresence>
                {progressInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 p-3 bg-blue-50 rounded-lg"
                  >
                    <p className="text-sm font-medium text-blue-800">
                      Processing {progressInfo.completed}/{progressInfo.total} files
                    </p>
                    {progressInfo.totalQuestions > 0 && (
                      <p className="text-sm text-blue-600">
                        Generated {progressInfo.totalQuestions} questions so far!
                      </p>
                    )}
                    
                    <div className="mt-2 space-y-1">
                      {Object.entries(uploadProgress).map(([uploadId, progress]) => (
                        <UploadProgressBar key={uploadId} progress={progress} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="text-center py-8">
              <SafeIcon icon={FiBook} className="text-4xl text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Select a subject first to upload content</p>
            </div>
          )}
        </motion.div>

        {/* Content Management */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Question Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowImportJson(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <SafeIcon icon={FiUpload} />
                <span>Import JSON</span>
              </button>
              <button
                onClick={handleExportQuestions}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <SafeIcon icon={FiUpload} className="rotate-180" />
                <span>Export</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {uploadedContent
              .filter(content => !selectedSubject || content.subjectId === selectedSubject.id)
              .map((content) => (
                <ContentItem 
                  key={content.id} 
                  content={content}
                  subjects={subjects}
                  onDelete={handleDeleteContent}
                />
              ))}
            
            {uploadedContent.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No content uploaded yet
              </p>
            )}
          </div>

          {/* Generated Questions List */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Generated Questions ({generatedQuestions.length})
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {generatedQuestions
                .filter(q => !selectedSubject || q.subjectId === selectedSubject.id)
                .map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {question.prompt}
                      </p>
                      <p className="text-xs text-gray-500">
                        {question.source} • {question.type} • Level {question.difficulty}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit question"
                      >
                        <SafeIcon icon={FiEdit} className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete question"
                      >
                        <SafeIcon icon={FiTrash} className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
                
              {generatedQuestions.length === 0 && (
                <p className="text-gray-500 text-center py-4 text-sm">
                  No generated questions yet. Upload content or import JSON files.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* JSON Import Modal */}
      <AnimatePresence>
        {showImportJson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowImportJson(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Import JSON Questions</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a JSON file containing questions in the same format as seedQuestions_wiskunde_gr4_af.js
                </p>
                <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  TTS instructions will be automatically generated for questions that don't have them.
                </p>
              </div>

              <div className="mb-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImportJson(file);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportJson(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Editing Modal */}
      <AnimatePresence>
        {editingQuestion && (
          <QuestionEditModal 
            question={editingQuestion}
            onSave={handleUpdateQuestion}
            onCancel={() => setEditingQuestion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// File Upload Zone Component
function FileUploadZone({ onFileUpload, isUploading }) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    onFileUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onFileUpload(files);
    e.target.value = ''; // Reset input
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.pdf,.doc,.docx,image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <SafeIcon icon={FiUpload} className="text-4xl text-gray-400 mx-auto mb-3" />
      <p className="text-gray-600 mb-2">
        Drag & drop files here, or{' '}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-primary-600 hover:text-primary-700 font-medium"
          disabled={isUploading}
        >
          browse files
        </button>
      </p>
      <p className="text-sm text-gray-500">
        Supports: Text files, PDFs, Images (JPG, PNG)
      </p>
      
      {isUploading && (
        <div className="mt-3">
          <SafeIcon icon={FiLoader} className="animate-spin text-primary-500 mx-auto" />
          <p className="text-sm text-primary-600 mt-1">Processing files...</p>
        </div>
      )}
    </div>
  );
}

// Upload Progress Bar Component
function UploadProgressBar({ progress }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success-500';
      case 'failed': case 'processing_failed': return 'bg-error-500';
      default: return 'bg-primary-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return FiCheck;
      case 'failed': case 'processing_failed': return FiX;
      default: return FiLoader;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <SafeIcon 
        icon={getStatusIcon(progress.status)} 
        className={`${progress.status === 'reading' || progress.status === 'saving' || progress.status === 'processing' ? 'animate-spin' : ''}`}
      />
      <div className="flex-1">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(progress.status)}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>
      <span className="text-xs capitalize text-gray-600">
        {progress.status}
        {progress.questionsGenerated > 0 && ` (${progress.questionsGenerated} questions)`}
      </span>
    </div>
  );
}

// Content Item Component
function ContentItem({ content, subjects, onDelete }) {
  const subject = subjects.find(s => s.id === content.subjectId);
  const uploadDate = new Date(content.uploadDate).toLocaleDateString();

  const getContentIcon = (type) => {
    switch (type) {
      case 'pdf': return FiFileText;
      case 'image': return FiImage;
      default: return FiFileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100';
      case 'processing': return 'text-warning-600 bg-warning-100';
      case 'failed': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3 flex-1">
        <SafeIcon icon={getContentIcon(content.contentType)} className="text-gray-600" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 truncate">{content.title}</p>
          <p className="text-sm text-gray-600">{subject?.name} • {uploadDate}</p>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(content.status)}`}>
            {content.status}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onDelete(content.id)}
          className="p-1 text-error-600 hover:text-error-700 transition-colors"
          title="Delete content"
        >
          <SafeIcon icon={FiTrash} />
        </button>
      </div>
    </div>
  );
}

// Question Edit Modal Component
function QuestionEditModal({ question, onSave, onCancel }) {
  const [editedQuestion, setEditedQuestion] = React.useState({
    ...question,
    options: question.options ? [...question.options] : [],
    acceptableAnswers: question.acceptableAnswers ? [...question.acceptableAnswers] : []
  });

  const updateField = (field, value) => {
    setEditedQuestion(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (index, value) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index] = value;
    setEditedQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setEditedQuestion(prev => ({ 
      ...prev, 
      options: [...prev.options, ''] 
    }));
  };

  const removeOption = (index) => {
    const newOptions = editedQuestion.options.filter((_, i) => i !== index);
    setEditedQuestion(prev => ({ 
      ...prev, 
      options: newOptions,
      answerIndex: prev.answerIndex > index ? prev.answerIndex - 1 : prev.answerIndex
    }));
  };

  const updateAcceptableAnswer = (index, value) => {
    const newAnswers = [...editedQuestion.acceptableAnswers];
    newAnswers[index] = value;
    setEditedQuestion(prev => ({ ...prev, acceptableAnswers: newAnswers }));
  };

  const addAcceptableAnswer = () => {
    setEditedQuestion(prev => ({ 
      ...prev, 
      acceptableAnswers: [...prev.acceptableAnswers, ''] 
    }));
  };

  const removeAcceptableAnswer = (index) => {
    const newAnswers = editedQuestion.acceptableAnswers.filter((_, i) => i !== index);
    setEditedQuestion(prev => ({ ...prev, acceptableAnswers: newAnswers }));
  };

  const handleSave = () => {
    if (!editedQuestion.prompt.trim()) {
      alert('Question prompt is required!');
      return;
    }

    if (editedQuestion.type === 'mcq' && editedQuestion.options.length < 2) {
      alert('Multiple choice questions need at least 2 options!');
      return;
    }

    if ((editedQuestion.type === 'short') && editedQuestion.acceptableAnswers.length === 0) {
      alert('Short answer questions need at least one acceptable answer!');
      return;
    }

    onSave(editedQuestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Question</h3>
        
        {/* Question Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
          <select
            value={editedQuestion.type}
            onChange={(e) => updateField('type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="mcq">Multiple Choice</option>
            <option value="short">Short Answer</option>
            <option value="numeric">Numeric</option>
          </select>
        </div>

        {/* Question Prompt */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Prompt</label>
          <textarea
            value={editedQuestion.prompt}
            onChange={(e) => updateField('prompt', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg h-20 resize-none"
            placeholder="Enter the question text..."
          />
        </div>

        {/* TTS Instruction */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">TTS Instruction (Afrikaans)</label>
          <textarea
            value={editedQuestion.ttsInstruction || ''}
            onChange={(e) => updateField('ttsInstruction', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg h-20 resize-none text-sm"
            placeholder="Enhanced instruction for text-to-speech in Afrikaans..."
          />
        </div>

        {/* Multiple Choice Options */}
        {editedQuestion.type === 'mcq' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            {editedQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={editedQuestion.answerIndex === index}
                  onChange={() => updateField('answerIndex', index)}
                  className="text-primary-600"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Remove option"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              <SafeIcon icon={FiFilePlus} />
              <span>Add Option</span>
            </button>
          </div>
        )}

        {/* Short Answer Acceptable Answers */}
        {editedQuestion.type === 'short' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Acceptable Answers</label>
            {editedQuestion.acceptableAnswers.map((answer, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => updateAcceptableAnswer(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder={`Acceptable answer ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeAcceptableAnswer(index)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Remove answer"
                >
                  <SafeIcon icon={FiX} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAcceptableAnswer}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm"
            >
              <SafeIcon icon={FiFilePlus} />
              <span>Add Acceptable Answer</span>
            </button>
          </div>
        )}

        {/* Numeric Answer */}
        {editedQuestion.type === 'numeric' && (
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
              <input
                type="number"
                step="any"
                value={editedQuestion.answerNumeric || ''}
                onChange={(e) => updateField('answerNumeric', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tolerance</label>
              <input
                type="number"
                step="any"
                value={editedQuestion.tolerance || 0}
                onChange={(e) => updateField('tolerance', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>
        )}

        {/* Additional Fields */}
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty (1-3)</label>
            <select
              value={editedQuestion.difficulty || 1}
              onChange={(e) => updateField('difficulty', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>Easy (1)</option>
              <option value={2}>Medium (2)</option>
              <option value={3}>Hard (3)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <input
              type="text"
              value={editedQuestion.topic || ''}
              onChange={(e) => updateField('topic', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Question topic"
            />
          </div>
        </div>

        {/* Hint */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hint</label>
          <input
            type="text"
            value={editedQuestion.hint || ''}
            onChange={(e) => updateField('hint', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Optional hint for students"
          />
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
          <textarea
            value={editedQuestion.explanation || ''}
            onChange={(e) => updateField('explanation', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg h-16 resize-none"
            placeholder="Explanation shown after answering"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ParentPortal;