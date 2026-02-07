'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Calendar } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // Add next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    options.push({
      value: `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`,
      label: nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
    
    // Add current and past 11 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();


  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadStatus('idle');
      setMessage('');
    } else if (selectedFile) {
      setUploadStatus('error');
      setMessage('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const uploadCsv = async () => {
    if (!file) {
      setUploadStatus('error');
      setMessage('Please select a CSV file');
      return;
    }

    setUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUploadStatus('error');
        setMessage('You must be logged in to upload files');
        setUploading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploadStatus('success');
        setMessage(data.message || 'CSV uploaded successfully!');
        setTimeout(() => {
          setFile(null);
          setUploadStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setUploadStatus('error');
        setMessage(data.message || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('An error occurred during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setMessage('');
  };

  return (
    <div className="min-h-screen flex bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-5.5">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Upload Transactions
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto">
            {/* Upload Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 md:p-10">
                {/* Month Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#7AD1A6]" />
                      <span>Select Transaction Month</span>
                    </div>
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:border-[#7AD1A6] focus:ring-2 focus:ring-[#7AD1A6]/20 outline-none transition-all duration-200"
                  >
                    <option value="">Choose the month...</option>
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    This helps organize your transactions and improve forecast accuracy
                  </p>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-3 border-dashed rounded-2xl p-16 transition-all duration-300 ${
                    isDragging
                      ? 'border-[#7AD1A6] bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 scale-[1.02]'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#7AD1A6]/50 dark:hover:border-[#7AD1A6]/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Upload CSV file"
                  />

                  <div className="text-center pointer-events-none">
                    <div className="mb-6 flex justify-center">
                      <div className={`w-20 h-20 rounded-2xl bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] flex items-center justify-center shadow-xl transition-transform duration-300 ${
                        isDragging ? 'scale-110' : 'scale-100'
                      }`}>
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {isDragging ? 'Drop your file here!' : 'Drag & drop your CSV file'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      or <span className="text-[#7AD1A6] font-semibold">click to browse</span> from your computer
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Supported format: CSV files only
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected File Preview */}
                {file && (
                  <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-700 dark:via-gray-700 dark:to-gray-600 rounded-2xl p-5 border-2 border-[#7AD1A6]/30 dark:border-[#7AD1A6]/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] flex items-center justify-center shadow-lg shrink-0">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                              {(file.size / 1024).toFixed(2)} KB • Ready to upload {selectedMonth ? `for ${monthOptions.find(opt => opt.value === selectedMonth)?.label}` : 'month not selected'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={clearFile}
                          className="p-2.5 rounded-xl hover:bg-white/70 dark:hover:bg-gray-600 transition-all duration-200 active:scale-95 shrink-0 ml-2"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Message */}
                {message && (
                  <div
                    className={`mt-6 rounded-2xl p-5 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 border-2 ${
                      uploadStatus === 'success'
                        ? 'bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                        : 'bg-linear-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-300 dark:border-red-700'
                    }`}
                  >
                    <div className="shrink-0">
                      {uploadStatus === 'success' ? (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-rose-500 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold mb-0.5 ${
                        uploadStatus === 'success' 
                          ? 'text-green-900 dark:text-green-100' 
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        {uploadStatus === 'success' ? 'Upload Successful!' : 'Upload Failed'}
                      </p>
                      <p className={`text-sm ${
                        uploadStatus === 'success' 
                          ? 'text-green-700 dark:text-green-200' 
                          : 'text-red-700 dark:text-red-200'
                      }`}>
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="mt-8">
                  <button
                    onClick={uploadCsv}
                    disabled={!file || uploading}
                    className={`group w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg ${
                      !file || uploading
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60'
                        : 'bg-linear-to-r from-[#90A1B9] to-[#7AD1A6] hover:shadow-xl hover:shadow-[#7AD1A6]/25 active:scale-[0.98] hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                          Upload CSV File
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer Info */}
              <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 px-8 md:px-10 py-5 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      File Requirements
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        First row must contain column headers
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        Maximum file size: 10MB
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        CSV format with comma-separated values
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips Card */}
            <div className="mt-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-[#90A1B9] to-[#7AD1A6] flex items-center justify-center">
                  <span className="text-white text-xs">💡</span>
                </div>
                Quick Tips
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#7AD1A6] font-bold mt-0.5">•</span>
                  <span>Export your bank statements as CSV for best compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7AD1A6] font-bold mt-0.5">•</span>
                  <span>Ensure dates are in a consistent format (YYYY-MM-DD recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#7AD1A6] font-bold mt-0.5">•</span>
                  <span>Remove any special characters or formatting from your file</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}