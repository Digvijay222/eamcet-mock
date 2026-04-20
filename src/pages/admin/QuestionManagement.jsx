// src/pages/admin/QuestionManagement.jsx
import React, { useState, useRef } from "react";
import Layout from "../../components/Layout/Layout";
import Card, { CardHeader, CardBody } from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Input from "../../components/UI/Input";
import Modal from "../../components/UI/Modal";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiUpload, FiImage, FiX } from "react-icons/fi";
import { useExam } from "../../contexts/ExamContext";
import * as XLSX from 'xlsx';

const QuestionManagement = () => {
  const { questions, addQuestion, updateQuestion, deleteQuestion, bulkAddQuestions } = useExam();
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    subject: "Physics",
    image: null,
    imagePreview: null
  });

  const subjects = ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"];

  // Filter questions dynamically based on available subjects
  const availableSubjects = [...new Set(questions.map(q => q.subject))];
  const filterSubjects = availableSubjects.length > 0 ? availableSubjects : subjects;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === "all" || q.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null,
      imagePreview: null
    });
  };

  const handleSave = async () => {
    const questionData = {
      text: formData.text,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      subject: formData.subject,
      image: formData.imagePreview || null
    };

    if (editingQuestion) {
      await updateQuestion({ ...editingQuestion, ...questionData });
    } else {
      await addQuestion(questionData);
    }
    setModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      subject: subjects[0],
      image: null,
      imagePreview: null
    });
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      image: null,
      imagePreview: question.image || null
    });
    setModalOpen(true);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setCsvData(jsonData);
      setCsvPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkImport = async () => {
    if (csvData.length === 0) return;

    const formattedQuestions = csvData.map(row => ({
      text: row.question || row.Question || row.text || "",
      options: [
        row.optionA || row.OptionA || row.option1 || "",
        row.optionB || row.OptionB || row.option2 || "",
        row.optionC || row.OptionC || row.option3 || "",
        row.optionD || row.OptionD || row.option4 || ""
      ],
      correctAnswer: row.correctAnswer || row.CorrectAnswer || row.answer || "",
      subject: row.subject || row.Subject || subjects[0],
      image: row.image || row.Image || null
    })).filter(q => q.text && q.options.every(opt => opt));

    if (formattedQuestions.length > 0) {
      await bulkAddQuestions(formattedQuestions);
      setCsvModalOpen(false);
      setCsvData([]);
      setCsvPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadCSVTemplate = () => {
    const template = [
      {
        question: "Sample Question 1",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        correctAnswer: "A",
        subject: "Physics"
      },
      {
        question: "Sample Question 2",
        optionA: "Option A",
        optionB: "Option B",
        optionC: "Option C",
        optionD: "Option D",
        correctAnswer: "B",
        subject: "Chemistry"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions_Template");
    XLSX.writeFile(wb, "questions_template.xlsx");
  };

  return (
    <Layout title="Question Management">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3 flex-wrap">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Subjects</option>
                {filterSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setCsvModalOpen(true)}>
                <FiUpload className="inline mr-2" /> Bulk Import
              </Button>
              <Button onClick={() => {
                resetForm();
                setModalOpen(true);
              }}>
                <FiPlus className="inline mr-2" /> Add Question
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found. Click "Add Question" to create your first question.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Correct Answer</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuestions.map((q, index) => (
                    <tr key={q.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-md">
                        <div className="truncate">{q.text}</div>
                      </td>
                      <td className="px-6 py-4">
                        {q.image ? (
                          <img src={q.image} alt="Question" className="h-10 w-10 object-cover rounded" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          q.subject === "Physics" ? "bg-blue-100 text-blue-700" :
                          q.subject === "Chemistry" ? "bg-green-100 text-green-700" :
                          q.subject === "Mathematics" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{q.correctAnswer}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEdit(q)} className="text-indigo-600 hover:text-indigo-800">
                          <FiEdit2 className="inline" />
                        </button>
                        <button onClick={() => deleteQuestion(q.id)} className="text-red-600 hover:text-red-800 ml-3">
                          <FiTrash2 className="inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Question Modal */}
      <Modal isOpen={modalOpen} onClose={() => {
        setModalOpen(false);
        resetForm();
      }} title={editingQuestion ? "Edit Question" : "Add New Question"} size="lg">
        <div className="space-y-4">
          <Input
            label="Question Text"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Enter the question"
            required
          />
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (Optional)</label>
            <div className="mt-1 flex items-center space-x-4">
              {formData.imagePreview ? (
                <div className="relative">
                  <img src={formData.imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <FiImage className="mr-2" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {formData.options.map((opt, idx) => (
              <Input
                key={idx}
                label={`Option ${String.fromCharCode(65 + idx)}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...formData.options];
                  newOptions[idx] = e.target.value;
                  setFormData({ ...formData, options: newOptions });
                }}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                required
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Correct Answer"
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
              placeholder="A, B, C, or D"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => {
              setModalOpen(false);
              resetForm();
            }}>Cancel</Button>
            <Button onClick={handleSave}>{editingQuestion ? "Update" : "Save"} Question</Button>
          </div>
        </div>
      </Modal>

      {/* CSV Bulk Import Modal */}
      <Modal isOpen={csvModalOpen} onClose={() => setCsvModalOpen(false)} title="Bulk Import Questions" size="lg">
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">CSV/Excel Format Instructions:</h3>
            <p className="text-sm text-blue-800">Your file should have the following columns:</p>
            <ul className="text-sm text-blue-800 list-disc list-inside mt-2">
              <li>question - The question text</li>
              <li>optionA, optionB, optionC, optionD - The answer options</li>
              <li>correctAnswer - The correct option (A, B, C, or D)</li>
              <li>subject - Subject category</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={downloadCSVTemplate}>
              Download Template
            </Button>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FiUpload className="mr-2" />
              Upload File
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>

          {csvPreview.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Preview (First 5 rows):</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(csvPreview[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} className="px-4 py-2 border-t">{String(val).substring(0, 30)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">Total records found: {csvData.length}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setCsvModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkImport} disabled={csvData.length === 0}>
              Import {csvData.length} Questions
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default QuestionManagement;