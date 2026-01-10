import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { User, Shield, Mail, Clock, Search, MoreVertical } from 'lucide-react'

export default function UserManagement() {
  // Mock users
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@leakguard.ai', role: 'admin', lastActive: 'Now', status: 'active' },
    { id: 2, name: 'Operator One', email: 'ops1@leakguard.ai', role: 'operator', lastActive: '2h ago', status: 'active' },
    { id: 3, name: 'Viewer Account', email: 'view@leakguard.ai', role: 'viewer', lastActive: '5d ago', status: 'inactive' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-gray-400">Control access and permissions</p>
        </div>
        <Button>
          <User className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <div className="w-64">
            <Input placeholder="Search users..." className="h-9" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-background-tertiary text-gray-400 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-gray-400" />
                        <span className="capitalize text-gray-300">{user.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={user.status === 'active' ? 'success' : 'default'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> {user.lastActive}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
