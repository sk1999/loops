'use client'

import { useState, useEffect } from 'react'
import { payrollApi, employeeApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [payroll, setPayroll] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    loadPayroll()
  }, [selectedMonth])

  const loadPayroll = async () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth() + 1

    setLoading(true)
    try {
      const res = await payrollApi.getMonthPayroll(year, month)
      setPayroll(res.data)
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load payroll')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculate = async () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth() + 1

    setCalculating(true)
    try {
      const res = await payrollApi.recalculateMonth({ year, month })
      toast.success(`Recalculated: ${res.data.success} successful, ${res.data.errors.length} errors`)
      loadPayroll()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to recalculate payroll')
    } finally {
      setCalculating(false)
    }
  }

  const totalSalary = payroll.reduce((sum, p) => sum + Number(p.net_salary || 0), 0)
  const totalPaidDays = payroll.reduce((sum, p) => sum + Number(p.paid_days || 0), 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payroll</h1>

        <div className="mb-6 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="px-4 py-2 border rounded"
            />
          </div>
          <button
            onClick={handleRecalculate}
            disabled={calculating}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {calculating ? 'Recalculating...' : 'Recalculate Month'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Employees</div>
                  <div className="text-2xl font-bold">{payroll.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Paid Days</div>
                  <div className="text-2xl font-bold">{totalPaidDays}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Salary</div>
                  <div className="text-2xl font-bold">
                    {totalSalary.toLocaleString('en-AE', {
                      style: 'currency',
                      currency: 'AED',
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Paid Days
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      OT Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Daily Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      OT Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Net Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payroll.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No payroll data for this month
                      </td>
                    </tr>
                  ) : (
                    payroll.map((p) => (
                      <tr key={p.payroll_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.employee?.full_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {p.paid_days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {p.ot_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {Number(p.daily_rate).toLocaleString('en-AE', {
                            style: 'currency',
                            currency: 'AED',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {Number(p.salary).toLocaleString('en-AE', {
                            style: 'currency',
                            currency: 'AED',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {Number(p.ot_amount).toLocaleString('en-AE', {
                            style: 'currency',
                            currency: 'AED',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                          {Number(p.net_salary).toLocaleString('en-AE', {
                            style: 'currency',
                            currency: 'AED',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

