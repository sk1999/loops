'use client'

import { useState } from 'react'
import { excelApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    try {
      const res = await excelApi.preview(file)
      setResult(res.data)
      toast.success('Preview generated')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to preview file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setUploading(true)
    try {
      const res = await excelApi.upload(
        file,
        uploadType || undefined,
        'user', // TODO: Get from auth
      )
      setResult(res.data)
      toast.success(
        `Upload completed: ${res.data.success_rows} successful, ${res.data.error_rows} errors`,
      )
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Excel Upload</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Upload Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Auto-detect</option>
              <option value="ATTENDANCE">Attendance</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPLOYMENT">Deployment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excel File</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              disabled={!file}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Preview
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Upload Result</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Status:</strong> {result.status}
                </div>
                <div>
                  <strong>Total Rows:</strong> {result.total_rows}
                </div>
                <div>
                  <strong>Success:</strong> {result.success_rows}
                </div>
                <div>
                  <strong>Errors:</strong> {result.error_rows}
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <strong>Error Details:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {result.errors.slice(0, 10).map((error: any, idx: number) => (
                        <li key={idx}>
                          Row {error.row}: {error.message}
                        </li>
                      ))}
                      {result.errors.length > 10 && (
                        <li>... and {result.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

