'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function CsvUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

      const res = await fetch('/api/upload-csv', {
        method: 'POST',
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar headerTitle="Upload CSV File" />

      {/* Main Content */}
      <div className="flex-1 bg-linear-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Upload CSV File
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload your CSV file to process and analyze your data
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-200 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {isDragging ? 'Drop your file here' : 'Drag and drop your CSV file'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    or click to browse from your computer
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Supported format: CSV (Comma-Separated Values)
                  </p>
                </div>
              </div>

              {/* Selected File */}
              {file && (
                <div className="mt-6 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}

              {/* Status Message */}
              {message && (
                <div
                  className={`mt-6 rounded-xl p-4 flex items-start space-x-3 ${
                    uploadStatus === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {uploadStatus === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">{message}</p>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-8">
                <button
                  onClick={uploadCsv}
                  disabled={!file || uploading}
                  className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
                    !file || uploading
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload CSV File'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <p>
                  Ensure your CSV file has headers in the first row. Max size: 10MB.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
