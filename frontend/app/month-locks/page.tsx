'use client'

import { useState, useEffect } from 'react'
import { monthLockApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function MonthLocksPage() {
  const [locks, setLocks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [unlockReason, setUnlockReason] = useState('')

  useEffect(() => {
    loadLocks()
  }, [])

  const loadLocks = async () => {
    setLoading(true)
    try {
      const res = await monthLockApi.getAll()
      setLocks(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load month locks')
    } finally {
      setLoading(false)
    }
  }

  const handleLock = async () => {
    try {
      await monthLockApi.lock({
        year: selectedYear,
        month: selectedMonth,
        lockedBy: 'user', // TODO: Get from auth
      })
      toast.success('Month locked successfully')
      loadLocks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to lock month')
    }
  }

  const handleUnlock = async (year: number, month: number) => {
    if (!unlockReason.trim()) {
      toast.error('Please provide a reason for unlocking')
      return
    }

    try {
      await monthLockApi.unlock({
        year,
        month,
        unlockedBy: 'user', // TODO: Get from auth
        reason: unlockReason,
      })
      toast.success('Month unlocked successfully')
      setUnlockReason('')
      loadLocks()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unlock month')
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Month Locks</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Lock Month</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border rounded"
                min="2020"
                max="2100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border rounded"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {format(new Date(2024, m - 1, 1), 'MMMM')}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLock}
              className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Lock Month
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Locked By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Locked At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : locks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No month locks found
                  </td>
                </tr>
              ) : (
                locks.map((lock) => (
                  <tr key={lock.lock_id}>
                    <td className="px-6 py-4 whitespace-nowrap">{lock.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(lock.year, lock.month - 1, 1), 'MMMM')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          lock.is_locked
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {lock.is_locked ? 'Locked' : 'Unlocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lock.locked_by || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lock.locked_at
                        ? format(new Date(lock.locked_at), 'yyyy-MM-dd HH:mm')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lock.is_locked && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Unlock reason"
                            value={unlockReason}
                            onChange={(e) => setUnlockReason(e.target.value)}
                            className="px-2 py-1 border rounded text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleUnlock(lock.year, lock.month)
                              }
                            }}
                          />
                          <button
                            onClick={() => handleUnlock(lock.year, lock.month)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                          >
                            Unlock
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

