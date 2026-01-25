'use client'

import { useState, useEffect, useCallback } from 'react'
import { attendanceApi, siteApi, employeeApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format, getDaysInMonth, startOfMonth } from 'date-fns'

const ATTENDANCE_STATUSES = ['P', 'A', 'OT', 'PH', 'ML', 'OD', '8', '8.5']

export default function AttendancePage() {
  const [sites, setSites] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedSite, setSelectedSite] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [attendance, setAttendance] = useState<Record<string, Record<number, string>>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSites()
    loadEmployees()
  }, [])

  useEffect(() => {
    if (selectedSite) {
      loadAttendance()
    }
  }, [selectedSite, selectedMonth])

  const loadSites = async () => {
    try {
      const res = await siteApi.getAll()
      setSites(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load sites')
    }
  }

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll()
      setEmployees(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load employees')
    }
  }

  const loadAttendance = async () => {
    if (!selectedSite) return

    setLoading(true)
    try {
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const startDate = startOfMonth(selectedMonth)
      const endDate = new Date(year, month, 0)

      const res = await attendanceApi.getSiteAttendance(
        selectedSite,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
      )

      // Transform attendance data into grid format
      const grid: Record<string, Record<number, string>> = {}
      res.data.forEach((event: any) => {
        const day = new Date(event.date).getDate()
        if (!grid[event.employee_id]) {
          grid[event.employee_id] = {}
        }
        grid[event.employee_id][day] = event.status
      })

      setAttendance(grid)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const handleCellChange = useCallback(
    async (employeeId: string, day: number, status: string) => {
      if (!selectedSite) return

      // Update local state immediately (optimistic update)
      setAttendance((prev) => ({
        ...prev,
        [employeeId]: {
          ...prev[employeeId],
          [day]: status,
        },
      }))

      // Save to backend
      try {
        const year = selectedMonth.getFullYear()
        const month = selectedMonth.getMonth() + 1
        const date = new Date(year, month - 1, day)

        await attendanceApi.create({
          employeeId,
          siteId: selectedSite,
          date: format(date, 'yyyy-MM-dd'),
          status,
          source: 'UI',
          createdBy: 'user', // TODO: Get from auth
        })

        toast.success('Attendance saved', { duration: 1000 })
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save attendance')
        // Revert on error
        loadAttendance()
      }
    },
    [selectedSite, selectedMonth],
  )

  const handleBulkFill = (status: string) => {
    if (!selectedSite) {
      toast.error('Please select a site first')
      return
    }

    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth() + 1
    const daysInMonth = getDaysInMonth(selectedMonth)

    // Fill all employees for all days
    employees.forEach((employee) => {
      for (let day = 1; day <= daysInMonth; day++) {
        handleCellChange(employee.employee_id, day, status)
      }
    })

    toast.success(`Bulk filled with ${status}`)
  }

  const daysInMonth = getDaysInMonth(selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="p-8">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">Attendance Entry</h1>

        {/* Controls */}
        <div className="mb-6 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2 border rounded"
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site.site_id} value={site.site_id}>
                  {site.site_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="px-4 py-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleBulkFill('P')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Fill All P
            </button>
            <button
              onClick={() => handleBulkFill('A')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Fill All A
            </button>
          </div>
        </div>

        {/* Excel-like table */}
        {selectedSite && (
          <div className="overflow-x-auto">
            <table className="excel-table">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-100 z-20 min-w-[200px]">
                    Employee Name
                  </th>
                  {days.map((day) => (
                    <th key={day} className="min-w-[60px] text-center">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.employee_id}>
                    <td className="sticky left-0 bg-white z-10 font-medium">
                      {employee.full_name}
                    </td>
                    {days.map((day) => (
                      <td key={day} className="p-0">
                        <select
                          value={attendance[employee.employee_id]?.[day] || ''}
                          onChange={(e) =>
                            handleCellChange(employee.employee_id, day, e.target.value)
                          }
                          className="w-full border-0 p-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          style={{ fontSize: '14px' }}
                        >
                          <option value=""></option>
                          {ATTENDANCE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!selectedSite && (
          <div className="text-center py-12 text-gray-500">
            Please select a site to view attendance
          </div>
        )}
      </div>
    </div>
  )
}

