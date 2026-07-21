import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { demandApi, Demand, DemandCreate } from '../services/api'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import { FileText, Plus, Search, Filter, Edit2, Trash2, Eye, Calendar, MapPin, DollarSign } from 'lucide-react'

const DemandsPage: React.FC = () => {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [demands, setDemands] = useState<Demand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newDemand, setNewDemand] = useState<DemandCreate>({ title: '' })

  useEffect(() => {
    if (!user) return
    
    const fetchDemands = async () => {
      try {
        const response = await demandApi.list()
        setDemands(response.data)
      } catch (err) {
        console.error('Failed to fetch demands:', err)
      }
    }
    
    fetchDemands()
  }, [user])

  const handleCreateDemand = async () => {
    if (!newDemand.title) return
    
    try {
      await demandApi.create(newDemand)
      setShowCreateModal(false)
      setNewDemand({ title: '' })
      const response = await demandApi.list()
      setDemands(response.data)
    } catch (err) {
      console.error('Failed to create demand:', err)
    }
  }

  const handleDeleteDemand = async (id: string) => {
    if (!confirm('确定要删除这个需求吗？')) return
    
    try {
      await demandApi.delete(id)
      const response = await demandApi.list()
      setDemands(response.data)
    } catch (err) {
      console.error('Failed to delete demand:', err)
    }
  }

  if (isLoading) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </AuthProvider>
    )
  }

  if (!user) {
    window.location.href = '/login'
    return null
  }

  const filteredDemands = demands.filter((demand) => {
    const matchesSearch = demand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          demand.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || demand.lifecycle === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '进行中'
      case 'completed': return '已完成'
      case 'draft': return '草稿'
      case 'pending': return '待处理'
      case 'cancelled': return '已取消'
      default: return status
    }
  }

  const getMaturityLabel = (maturity: string) => {
    switch (maturity) {
      case 'consultative': return '咨询探索'
      case 'explicit': return '明确快执'
      case 'repeat': return '回头客'
      case 'professional': return '专业采购'
      default: return maturity
    }
  }

  return (
    <AuthProvider>
      <Layout title="需求管理">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="搜索需求..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field pl-10 w-40 appearance-none bg-white"
              >
                <option value="all">全部状态</option>
                <option value="draft">草稿</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            创建需求
          </button>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">需求名称</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">类型</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">城市</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">预算</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">成熟度</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">状态</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemands.length > 0 ? (
                  filteredDemands.map((demand) => (
                    <tr key={demand.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <FileText size={14} className="text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">{demand.title}</p>
                            <p className="text-xs text-neutral-500">{new Date(demand.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-neutral-600">{demand.event_type || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-neutral-600">
                          <MapPin size={14} />
                          {demand.city || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="flex items-center gap-1 text-neutral-600">
                          <DollarSign size={14} />
                          {demand.budget_min && demand.budget_max 
                            ? `${demand.budget_min.toLocaleString()} - ${demand.budget_max.toLocaleString()}` 
                            : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600">
                          {getMaturityLabel(demand.maturity)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(demand.lifecycle)}`}>
                          {getStatusLabel(demand.lifecycle)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/demands/${demand.id}`)}
                            className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDemand(demand.id)}
                            className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      <FileText size={48} className="mx-auto text-neutral-300 mb-4" />
                      <p>暂无需求数据</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-6">创建需求</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">需求名称 *</label>
                  <input
                    type="text"
                    value={newDemand.title}
                    onChange={(e) => setNewDemand({ ...newDemand, title: e.target.value })}
                    className="input-field"
                    placeholder="请输入需求名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">描述</label>
                  <textarea
                    value={newDemand.description || ''}
                    onChange={(e) => setNewDemand({ ...newDemand, description: e.target.value })}
                    className="input-field"
                    placeholder="请输入需求描述"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">活动类型</label>
                    <input
                      type="text"
                      value={newDemand.event_type || ''}
                      onChange={(e) => setNewDemand({ ...newDemand, event_type: e.target.value })}
                      className="input-field"
                      placeholder="如：年会、发布会"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">城市</label>
                    <input
                      type="text"
                      value={newDemand.city || ''}
                      onChange={(e) => setNewDemand({ ...newDemand, city: e.target.value })}
                      className="input-field"
                      placeholder="请输入城市"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">预算下限</label>
                    <input
                      type="number"
                      value={newDemand.budget_min || ''}
                      onChange={(e) => setNewDemand({ ...newDemand, budget_min: parseFloat(e.target.value) || undefined })}
                      className="input-field"
                      placeholder="预算下限"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">预算上限</label>
                    <input
                      type="number"
                      value={newDemand.budget_max || ''}
                      onChange={(e) => setNewDemand({ ...newDemand, budget_max: parseFloat(e.target.value) || undefined })}
                      className="input-field"
                      placeholder="预算上限"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateDemand}
                  className="btn-primary"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </AuthProvider>
  )
}

export default DemandsPage