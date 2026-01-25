'use client'

import { useState, useEffect } from 'react'
import { siteApi, clientApi } from '@/lib/api'
import toast from 'react-hot-toast'

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSites()
    loadClients()
  }, [])

  const loadSites = async () => {
    setLoading(true)
    try {
      const res = await siteApi.getAll()
      setSites(res.data)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load sites')
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const res = await clientApi.getAll()
      setClients(res.data)
    } catch (error: any) {
      // Silently fail - clients not critical for this page
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sites</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Site Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sites.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No sites found
                    </td>
                  </tr>
                ) : (
                  sites.map((site) => (
                    <tr key={site.site_id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {site.site_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {site.site_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {site.client?.company_name || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

