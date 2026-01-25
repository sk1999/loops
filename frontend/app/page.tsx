'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">HR Payroll System</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/attendance" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Attendance</h2>
            <p className="text-gray-600">Manage site-based attendance with Excel-like UI</p>
          </Link>

          <Link href="/excel-upload" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Excel Upload</h2>
            <p className="text-gray-600">Upload and process Excel files</p>
          </Link>

          <Link href="/payroll" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Payroll</h2>
            <p className="text-gray-600">View and calculate payroll</p>
          </Link>

          <Link href="/employees" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Employees</h2>
            <p className="text-gray-600">Manage employee master data</p>
          </Link>

          <Link href="/sites" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Sites</h2>
            <p className="text-gray-600">Manage client sites</p>
          </Link>

          <Link href="/month-locks" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">Month Locks</h2>
            <p className="text-gray-600">Lock/unlock months for payroll integrity</p>
          </Link>
        </div>
      </div>
    </main>
  )
}

