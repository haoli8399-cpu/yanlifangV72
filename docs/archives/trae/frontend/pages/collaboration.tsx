import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import businessApi from '../services/businessApi'
import { demandApi, Demand, tenantApi, Tenant } from '../services/api'
import { Users, Send, Check, X, Building2, Handshake, UserCheck } from 'lucide-react'

const CollaborationPage: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [demands, setDemands] = useState<Demand[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedDemand, setSelectedDemand] = useState<string>('')
  const [selectedTenant, setSelectedTenant] = useState<string>('')
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    demandApi.list().then(res => setDemands(res.data)).catch(console.error)
    tenantApi.list().then(res => setTenants(res.data)).catch(console.error)
  }, [user])

  const handleCreateAssignment = async () => {
    if (!selectedDemand || !selectedTenant) return
    try {
      await businessApi.createAssignment(selectedDemand, selectedTenant)
      alert('主服务指派已创建，等待服务商接受')
      setSelectedDemand('')
      setSelectedTenant('')
    } catch (err) {
      console.error('Failed to create assignment:', err)
      alert('创建指派失败')
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = '/login'
    }
  }, [isLoading, user])

  if (isLoading || !user) {
    return null
  }

  return (
    <AuthProvider>
      <Layout title="协作管理">
        {/* 主服务指派流程 */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">主服务指派</h2>
              <p className="text-sm text-neutral-500">每个项目只能有一个主服务Tenant</p>
            </div>
          </div>

          {/* 流程图示 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck size={20} className="text-blue-600" />
              </div>
              <span className="text-xs mt-2 text-neutral-600">客户选择</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 max-w-[60px]"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Send size={20} className="text-yellow-600" />
              </div>
              <span className="text-xs mt-2 text-neutral-600">等待接受</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 max-w-[60px]"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
              <span className="text-xs mt-2 text-neutral-600">服务商接受</span>
            </div>
            <div className="flex-1 h-0.5 bg-neutral-200 max-w-[60px]"></div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <Handshake size={20} className="text-primary-600" />
              </div>
              <span className="text-xs mt-2 text-neutral-600">激活协作</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">选择需求</label>
              <select
                value={selectedDemand}
                onChange={(e) => setSelectedDemand(e.target.value)}
                className="input-field"
              >
                <option value="">请选择需求</option>
                {demands.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">选择主服务商</label>
              <select
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
                className="input-field"
              >
                <option value="">请选择服务商</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleCreateAssignment}
            disabled={!selectedDemand || !selectedTenant}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            <Send size={18} />
            创建主服务指派
          </button>
        </div>

        {/* 协作方管理 */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">协作方管理</h2>
              <p className="text-sm text-neutral-500">邀请其他服务商参与项目模块</p>
            </div>
          </div>

          <div className="space-y-3">
            {assignments.length > 0 ? (
              assignments.map((a, idx) => (
                <div key={idx} className="p-4 bg-neutral-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{a.tenant_name || '服务商'}</p>
                      <p className="text-sm text-neutral-500">{a.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.status === 'invited' && (
                      <button className="btn-secondary flex items-center gap-1 text-sm">
                        <Check size={14} />
                        接受
                      </button>
                    )}
                    <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-neutral-500 py-8">暂无协作方</p>
            )}
          </div>
        </div>

        {/* 平台来源归因说明 */}
        <div className="card mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Handshake size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">平台来源归因规则</h2>
              <p className="text-sm text-neutral-500">透明的成交服务费计算规则</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">平台来源 (Platform Sourced)</h3>
              <p className="text-sm text-green-700">
                客户通过平台匹配获得的需求，平台收取成交服务费（基于净回款）
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">租户自有 (Self Owned)</h3>
              <p className="text-sm text-blue-700">
                服务商自己带来的客户，不收取成交服务费（需提供归属证据）
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">非重复收费原则</h3>
              <p className="text-sm text-yellow-700">
                同一笔成交只收取一次服务费，ChargeableValue原子覆盖确保不重复
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  )
}

export default CollaborationPage
