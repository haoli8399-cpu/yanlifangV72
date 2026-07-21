import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import businessApi from '../services/businessApi'
import { projectApi, ActivityProject } from '../services/api'
import { Quote, FileText, Send, Check, DollarSign, Sparkles, TrendingUp, AlertCircle, Clock } from 'lucide-react'

const QuotesPage: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [projects, setProjects] = useState<ActivityProject[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [aiDraft, setAiDraft] = useState<any>(null)
  const [quotes, setQuotes] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    projectApi.list().then(res => setProjects(res.data)).catch(console.error)
  }, [user])

  const handleDraftQuote = async () => {
    if (!selectedProject) return
    try {
      const res = await businessApi.draftQuote(selectedProject)
      setAiDraft(res.data)
    } catch (err) {
      console.error('Failed to draft quote:', err)
    }
  }

  const handleCreateQuote = async () => {
    if (!aiDraft || !selectedProject) return
    try {
      await businessApi.createQuote(
        selectedProject,
        aiDraft.suggested_total,
        aiDraft.suggested_items,
        'AI辅助生成的报价',
        true
      )
      alert('报价已创建（AI生成，需人工确认）')
      setAiDraft(null)
    } catch (err) {
      console.error('Failed to create quote:', err)
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
      <Layout title="报价管理">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI报价草拟 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">AI报价草拟</h2>
                <p className="text-sm text-neutral-500">AI生成报价建议，需人工确认</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">选择项目</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="input-field"
                >
                  <option value="">请选择项目</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleDraftQuote}
                disabled={!selectedProject}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                生成AI报价建议
              </button>

              {aiDraft && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">AI建议（仅供参考）</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">基础总额</span>
                      <span className="font-medium">¥{aiDraft.base_total?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">加价比例</span>
                      <span className="font-medium">{aiDraft.markup_applied}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2 border-t border-purple-200">
                      <span className="font-semibold text-neutral-800">建议总额</span>
                      <span className="font-bold text-purple-600">¥{aiDraft.suggested_total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-neutral-700 mb-2">报价项</p>
                    <div className="space-y-1">
                      {aiDraft.suggested_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                          <span className="text-neutral-700">{item.name}</span>
                          <span className="font-medium">¥{item.price?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-purple-600 mb-3">{aiDraft.disclaimer}</p>

                  <button
                    onClick={handleCreateQuote}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    确认并创建报价
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 报价列表 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">报价记录</h2>
                <p className="text-sm text-neutral-500">管理所有项目报价</p>
              </div>
            </div>

            <div className="space-y-3">
              {quotes.length > 0 ? (
                quotes.map((quote, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-neutral-800">报价 V{quote.version_number}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {quote.status === 'accepted' ? '已接受' :
                         quote.status === 'sent' ? '已发送' :
                         quote.status === 'draft' ? '草稿' : quote.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">
                        {quote.ai_generated ? 'AI生成' : '人工创建'}
                      </span>
                      <span className="font-semibold text-neutral-800">¥{quote.total_amount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-neutral-500 py-8">暂无报价记录</p>
              )}
            </div>
          </div>
        </div>

        {/* 金额对账 */}
        <div className="card mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">金额对账</h2>
              <p className="text-sm text-neutral-500">验证可收费价值与付款金额守恒</p>
            </div>
          </div>

          <div className="flex gap-4">
            <select className="input-field flex-1">
              <option value="">选择项目进行对账</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <button className="btn-primary flex items-center gap-2">
              <TrendingUp size={18} />
              执行对账
            </button>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  )
}

export default QuotesPage
