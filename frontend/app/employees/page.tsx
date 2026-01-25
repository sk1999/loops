'use client'

import { useState, useEffect } from 'react'
import { employeeApi, tradeCategoryApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Employee {
  id: number
  employee_id: string
  full_name: string
  father_name?: string
  mother_name?: string
  dob?: string
  indian_address?: string
  indian_phone?: string
  emergency_contact?: string
  passport_number?: string
  passport_expiry?: string
  visa_type?: string
  visa_expiry?: string
  passport_document_url?: string
  visa_document_url?: string
  photo_url?: string
  other_documents?: Array<{
    name: string
    url: string
    type: string
    uploaded_at: string
  }>
  trade_category?: {
    id: number
    code: string
    name: string
  }
  trade_category_id?: number
  joining_date?: string
  recruitment_agency?: string
  basic_salary?: string
  food_allowance?: string
  foreman_allowance?: string
  status: 'active' | 'exited'
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [tradeCategories, setTradeCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Employee>('full_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState<Partial<Employee & {
  basic_salary?: number;
  food_allowance?: number;
  foreman_allowance?: number;
}>>({
    status: 'active',
  })
  const [files, setFiles] = useState<{
    passport_document?: File
    visa_document?: File
    photo?: File
    other_documents?: File[]
  }>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadEmployees()
    loadTradeCategories()
  }, [])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const res = await employeeApi.getAll()
      setEmployees(res.data)
      setFilteredEmployees(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const loadTradeCategories = async () => {
    try {
      const res = await tradeCategoryApi.getAll()
      setTradeCategories(res.data)
    } catch (error: any) {
      console.error('Failed to load trade categories:', error)
    }
  }

  // Apply search and filters
  useEffect(() => {
    let filtered = employees

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.passport_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.trade_category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle null/undefined values
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1

      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()

      if (sortDirection === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0
      }
    })

    setFilteredEmployees(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }, [employees, searchTerm, sortField, sortDirection])

  // Get paginated data
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

  const handleSort = (field: keyof Employee) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === 'basic_salary' || name === 'food_allowance' || name === 'foreman_allowance') {
      // Convert to number for salary fields
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? undefined : parseFloat(value) || 0 
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'passport_document' | 'visa_document' | 'photo' | 'other_documents'
  ) => {
    if (e.target.files) {
      if (field === 'other_documents') {
        setFiles((prev) => ({
          ...prev,
          other_documents: Array.from(e.target.files || []),
        }))
      } else {
        setFiles((prev) => ({
          ...prev,
          [field]: e.target.files?.[0],
        }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'trade_category_id' && typeof value === 'number') {
            formDataToSend.append(key, value.toString())
          } else if (key === 'basic_salary' || key === 'food_allowance' || key === 'foreman_allowance') {
            // Convert number fields to strings for FormData
            formDataToSend.append(key, value.toString())
          } else {
            formDataToSend.append(key, value as string)
          }
        }
      })

      // Add files
      if (files.passport_document) {
        formDataToSend.append('passport_document', files.passport_document)
      }
      if (files.visa_document) {
        formDataToSend.append('visa_document', files.visa_document)
      }
      if (files.photo) {
        formDataToSend.append('photo', files.photo)
      }
      if (files.other_documents) {
        files.other_documents.forEach((file) => {
          formDataToSend.append('other_documents', file)
        })
      }

      await employeeApi.create(formDataToSend)
      toast.success('Employee created successfully!')
      setShowForm(false)
      setFormData({ status: 'active' })
      setFiles({})
      loadEmployees()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create employee')
    } finally {
      setSubmitting(false)
    }
  }

  const getDocumentUrl = (url?: string) => {
    if (!url) return null
    return url.startsWith('http') ? url : `${API_URL}${url}`
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employees</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Employee'}
          </button>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <label className="block text-sm font-medium mb-1">Search Employees</label>
              <input
                type="text"
                placeholder="Search by ID, Name, Passport, or Trade Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border rounded-lg"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Showing {paginatedEmployees.length} of {filteredEmployees.length} employees
            {filteredEmployees.length !== employees.length && ` (filtered from ${employees.length} total)`}
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    required
                    value={formData.employee_id || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Father Name
                  </label>
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mother Name
                  </label>
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trade Category
                  </label>
                  <select
                    name="trade_category_id"
                    value={formData.trade_category_id || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trade_category_id: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Trade Category</option>
                    {tradeCategories.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.name} ({tc.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    name="passport_number"
                    value={formData.passport_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Passport Expiry
                  </label>
                  <input
                    type="date"
                    name="passport_expiry"
                    value={formData.passport_expiry || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visa Type
                  </label>
                  <input
                    type="text"
                    name="visa_type"
                    value={formData.visa_type || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visa Expiry
                  </label>
                  <input
                    type="date"
                    name="visa_expiry"
                    value={formData.visa_expiry || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Recruitment Agency
                  </label>
                  <input
                    type="text"
                    name="recruitment_agency"
                    value={formData.recruitment_agency || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Basic Salary (Monthly)
                  </label>
                  <input
                    type="number"
                    name="basic_salary"
                    value={formData.basic_salary || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Food Allowance (Monthly)
                  </label>
                  <input
                    type="number"
                    name="food_allowance"
                    value={formData.food_allowance || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Foreman Allowance (Monthly)
                  </label>
                  <input
                    type="number"
                    name="foreman_allowance"
                    value={formData.foreman_allowance || ''}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Indian Phone
                  </label>
                  <input
                    type="text"
                    name="indian_phone"
                    value={formData.indian_phone || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="exited">Exited</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Indian Address
                </label>
                <textarea
                  name="indian_address"
                  value={formData.indian_address || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Emergency Contact
                </label>
                <textarea
                  name="emergency_contact"
                  value={formData.emergency_contact || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Passport Document (PDF/Image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, 'passport_document')}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {files.passport_document && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {files.passport_document.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Visa Document (PDF/Image)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, 'visa_document')}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {files.visa_document && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {files.visa_document.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Photo (Image)
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {files.photo && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {files.photo.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Other Documents (PDF/Image, multiple)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    multiple
                    onChange={(e) => handleFileChange(e, 'other_documents')}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {files.other_documents && files.other_documents.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {files.other_documents.length} file(s)
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({ status: 'active' })
                    setFiles({})
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('employee_id')}
                  >
                    ID
                    {sortField === 'employee_id' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('full_name')}
                  >
                    Name
                    {sortField === 'full_name' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('trade_category')}
                  >
                    Trade
                    {sortField === 'trade_category' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('basic_salary')}
                  >
                    Basic
                    {sortField === 'basic_salary' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('food_allowance')}
                  >
                    Food
                    {sortField === 'food_allowance' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('foreman_allowance')}
                  >
                    Foreman
                    {sortField === 'foreman_allowance' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('passport_number')}
                  >
                    Passport
                    {sortField === 'passport_number' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('passport_expiry')}
                  >
                    Pass. Exp.
                    {sortField === 'passport_expiry' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('visa_expiry')}
                  >
                    Visa Exp.
                    {sortField === 'visa_expiry' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    Docs
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    {sortField === 'status' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No employees found matching your search' : 'No employees found'}
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((emp) => (
                    <>
                      {/* Mobile Card View */}
                      <tr className="sm:hidden">
                        <td colSpan={11} className="p-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              {emp.photo_url && (
                                <img
                                  src={getDocumentUrl(emp.photo_url) || ''}
                                  alt={emp.full_name}
                                  className="w-16 h-16 rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-lg">{emp.full_name}</h3>
                                <p className="text-sm text-gray-600">{emp.employee_id}</p>
                                <p className="text-sm text-gray-600">{emp.trade_category?.name || '-'}</p>
                              </div>
                              <div className="ml-auto">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    emp.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {emp.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Basic:</span> {emp.basic_salary ? `AED ${parseFloat(emp.basic_salary).toFixed(2)}` : '-'}
                              </div>
                              <div>
                                <span className="font-medium">Food:</span> {emp.food_allowance ? `AED ${parseFloat(emp.food_allowance).toFixed(2)}` : '-'}
                              </div>
                              <div>
                                <span className="font-medium">Foreman:</span> {emp.foreman_allowance ? `AED ${parseFloat(emp.foreman_allowance).toFixed(2)}` : '-'}
                              </div>
                              <div>
                                <span className="font-medium">Passport:</span> {emp.passport_number || '-'}
                              </div>
                              <div>
                                <span className="font-medium">Pass. Exp:</span> {emp.passport_expiry ? format(new Date(emp.passport_expiry), 'dd MMM yyyy') : '-'}
                              </div>
                              <div>
                                <span className="font-medium">Visa Exp:</span> {emp.visa_expiry ? format(new Date(emp.visa_expiry), 'dd MMM yyyy') : '-'}
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Documents:</span>
                                <div className="flex gap-2 flex-wrap mt-1">
                                  {emp.passport_document_url && (
                                    <a
                                      href={getDocumentUrl(emp.passport_document_url) || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                    >
                                      Passport
                                    </a>
                                  )}
                                  {emp.visa_document_url && (
                                    <a
                                      href={getDocumentUrl(emp.visa_document_url) || '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                                    >
                                      Visa
                                    </a>
                                  )}
                                  {emp.other_documents &&
                                    emp.other_documents.length > 0 && (
                                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                        +{emp.other_documents.length} more
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Desktop Table Row */}
                      <tr key={emp.employee_id} className="hidden sm:table-row hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap font-medium">
                          {emp.employee_id}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {emp.photo_url && (
                              <img
                                src={getDocumentUrl(emp.photo_url) || ''}
                                alt={emp.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <span className="truncate max-w-32">{emp.full_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.trade_category?.name || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.basic_salary ? `AED ${parseFloat(emp.basic_salary).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.food_allowance ? `AED ${parseFloat(emp.food_allowance).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.foreman_allowance ? `AED ${parseFloat(emp.foreman_allowance).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.passport_number || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.passport_expiry ? format(new Date(emp.passport_expiry), 'dd MMM yyyy') : '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {emp.visa_expiry ? format(new Date(emp.visa_expiry), 'dd MMM yyyy') : '-'}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-1 flex-wrap">
                            {emp.passport_document_url && (
                              <a
                                href={getDocumentUrl(emp.passport_document_url) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                              >
                                Passport
                              </a>
                            )}
                            {emp.visa_document_url && (
                              <a
                                href={getDocumentUrl(emp.visa_document_url) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                              >
                                Visa
                              </a>
                            )}
                            {emp.other_documents &&
                              emp.other_documents.length > 0 && (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  +{emp.other_documents.length} more
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              emp.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    </>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded hover:bg-gray-50 ${
                        currentPage === pageNum ? 'bg-blue-500 text-white' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
