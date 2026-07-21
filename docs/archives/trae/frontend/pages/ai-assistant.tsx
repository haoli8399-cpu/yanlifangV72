import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import businessApi from '../services/businessApi'
import { demandApi, Demand } from '../services/api'
import { projectApi, ActivityProject } from '../services/api'
import { Sparkles, TrendingUp, FileText, Calendar, Brain, Lightbulb, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react'

const AIAssistantPage: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [demands, setDemands] = useState<Demand[]>([])
  const [projects, setProjects] = useState<ActivityProject[]>([])
  const [selectedDemand, setSelectedDemand] = useState<string>('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [maturityAnalysis, setMaturityAnalysis] = useState<any>(null)
  const [supplierSuggestions, setSupplierSuggestions] = useState<any>(null)
  const [projectSummary, setProjectSummary] = useState<any>(null)

  useEffect(() => {
    if (!user) return
    demandApi.list().then(res => setDemands(res.data)).catch(console.error)
    projectApi.list().then(res => setProjects(res.data)).catch(console.error)
  }, [user])

  const handleAnalyzeMaturity = async () => {
    if (!selectedDemand) return
    try {
      const res = await businessApi.analyzeDemandMaturity(selectedDemand)
      setMaturityAnalysis(res.data)
    } catch (err) {
      console.error('Failed to analyze maturity:', err)
    }
  }

  const handleSuggestSuppliers = async () => {
    if (!selectedDemand) return
    try {
      const res = await businessApi.suggestSuppliers(selectedDemand)
      setSupplierSuggestions(res.data)
    } catch (err) {
      console.error('Failed to suggest suppliers:', err)
    }
  }

  const handleProjectSummary = async () => {
    if (!selectedProject) return
    try {
      const res = await businessApi.projectSummary(selectedProject)
      setProjectSummary(res.data)
    } catch (err) {
      console.error('Failed to get summary:', err)
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
      <Layout title="AI经营助手">
        {/* AI边界声明 */}
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3">
          <Brain size={20} className="text-purple-600 mt-0.5" />
          <div>
            <p className="font-medium text-purple-800">AI助手边界声明</p>
            <p className="text-sm text-purple-700 mt-1">
              AI负责草拟报价、生成建议、匹配推荐，但所有业务操作（权限验证、状态管理、金额计算）由确定性系统执行。
              AI生成的内容仅供参考，需人工确认后才能生效。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 需求成熟度分析 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">需求成熟度分析</h2>
                <p className="text-sm text-neutral-500">AI分析需求信息完整度</p>
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={selectedDemand}
                onChange={(e) => setSelectedDemand(e.target.value)}
                className="input-field"
              >
                <option value="">选择需求</option>
                {demands.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>

              <button
                onClick={handleAnalyzeMaturity}
                disabled={!selectedDemand}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                分析成熟度
              </button>

              {maturityAnalysis && !maturityAnalysis.error && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-neutral-800">完整度</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {Math.round(maturityAnalysis.completeness_ratio * 100)}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${maturityAnalysis.completeness_ratio * 100}%` }}
                    />
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-neutral-700 mb-1">推荐模式</p>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {maturityAnalysis.recommended_mode === 'explicit' ? '明确快执' :
                       maturityAnalysis.recommended_mode === 'consultative' ? '咨询探索' :
                       maturityAnalysis.recommended_mode === 'repeat' ? '回头客' : '专业采购'}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 mb-3">{maturityAnalysis.mode_description}</p>

                  {maturityAnalysis.missing_fields?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-neutral-700 mb-1">缺失字段</p>
                      <div className="flex flex-wrap gap-1">
                        {maturityAnalysis.missing_fields.map((field: string) => (
                          <span key={field} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-neutral-500">{maturityAnalysis.disclaimer}</p>
                </div>
              )}
            </div>
          </div>

          {/* 服务商推荐 */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">AI服务商推荐</h2>
                <p className="text-sm text-neutral-500">基于需求特征智能匹配</p>
              </div>
            </div>

            <div className="space-y-4">
              <select
                value={selectedDemand}
                onChange={(e) => setSelectedDemand(e.target.value)}
                className="input-field"
              >
                <option value="">选择需求</option>
                {demands.map(d => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>

              <button
                onClick={handleSuggestSuppliers}
                disabled={!selectedDemand}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Lightbulb size={18} />
                获取推荐
              </button>

              {supplierSuggestions && !supplierSuggestions.error && (
                <div className="space-y-3">
                  {supplierSuggestions.recommendations?.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-neutral-800">{rec.tenant_name}</span>
                        <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                          匹配度 {rec.score}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {rec.reasons.map((reason: string, ridx: number) => (
                          <span key={ridx} className="px-2 py-1 bg-white text-green-700 rounded text-xs">
                            {reason}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span>等级: {rec.tier}</span>
                        <span>城市: {rec.city}</span>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-neutral-500">{supplierSuggestions.disclaimer}</p>
                </div>
              )}
            </div>
          </div>

          {/* 项目摘要 */}
          <div className="card lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">AI项目摘要</h2>
                <p className="text-sm text-neutral-500">自动生成项目进展报告</p>
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">选择项目</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <button
                onClick={handleProjectSummary}
                disabled={!selectedProject}
                className="btn-primary flex items-center gap-2"
              >
                <Sparkles size={18} />
                生成摘要
              </button>
            </div>

            {projectSummary && !projectSummary.error && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">项目进度</p>
                  <p className="text-3xl font-bold text-neutral-800">{projectSummary.progress}%</p>
                  <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${projectSummary.progress}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">计划项统计</p>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">总计</span>
                      <span className="font-medium">{projectSummary.statistics.total_items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">已完成</span>
                      <span className="font-medium">{projectSummary.statistics.completed_items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">进行中</span>
                      <span className="font-medium">{projectSummary.statistics.in_progress_items}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-600">待处理</span>
                      <span className="font-medium">{projectSummary.statistics.pending_items}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500 mb-1">状态总结</p>
                  <p className="text-sm text-neutral-700 mt-2">{projectSummary.status_summary}</p>
                  <p className="text-xs text-neutral-400 mt-2">{projectSummary.disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </AuthProvider>
  )
}

export default AIAssistantPage
