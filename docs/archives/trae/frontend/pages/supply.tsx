import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { programApi, offeringApi, ProgramModule, ServiceOffering } from '../services/api'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import { Package, Users, Plus, Search, Filter, Edit2, Eye, ChevronRight } from 'lucide-react'

const SupplyPage: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'programs' | 'offerings'>('programs')
  const [programs, setPrograms] = useState<ProgramModule[]>([])
  const [offerings, setOfferings] = useState<ServiceOffering[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!user) return
    
    const fetchData = async () => {
      try {
        const [programsRes, offeringsRes] = await Promise.all([
          programApi.list(),
          offeringApi.list(),
        ])
        setPrograms(programsRes.data)
        setOfferings(offeringsRes.data)
      } catch (err) {
        console.error('Failed to fetch supply data:', err)
      }
    }
    
    fetchData()
  }, [user])

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

  const filteredPrograms = programs.filter((program) => 
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOfferings = offerings.filter((offering) => 
    offering.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offering.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'published': return 'bg-blue-100 text-blue-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'incomplete': return 'bg-yellow-100 text-yellow-700'
      case 'archived': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '活跃'
      case 'published': return '已发布'
      case 'draft': return '草稿'
      case 'incomplete': return '未完成'
      case 'archived': return '已归档'
      default: return status
    }
  }

  const tabs = [
    { id: 'programs', label: '节目模块', icon: Package },
    { id: 'offerings', label: '服务产品', icon: Users },
  ]

  return (
    <AuthProvider>
      <Layout title="供给管理">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-neutral-200 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:text-neutral-800'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 w-64"
              />
            </div>
            <button className="btn-primary flex items-center gap-2">
              <Plus size={18} />
              {activeTab === 'programs' ? '创建节目模块' : '创建服务产品'}
            </button>
          </div>
        </div>

        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program) => (
                <div key={program.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">{program.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.readiness)}`}>
                          {getStatusLabel(program.readiness)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-neutral-400" />
                  </div>
                  
                  <p className="text-neutral-600 text-sm mb-4">{program.description || '暂无描述'}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">{program.category || '未分类'}</span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">暂无节目模块数据</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'offerings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfferings.length > 0 ? (
              filteredOfferings.map((offering) => (
                <div key={offering.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Users size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">{offering.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offering.readiness)}`}>
                          {getStatusLabel(offering.readiness)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-neutral-400" />
                  </div>
                  
                  <p className="text-neutral-600 text-sm mb-4">{offering.description || '暂无描述'}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">服务商 ID: {offering.tenant_id.slice(0, 8)}...</span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users size={48} className="mx-auto text-neutral-300 mb-4" />
                <p className="text-neutral-500">暂无服务产品数据</p>
              </div>
            )}
          </div>
        )}
      </Layout>
    </AuthProvider>
  )
}

export default SupplyPage