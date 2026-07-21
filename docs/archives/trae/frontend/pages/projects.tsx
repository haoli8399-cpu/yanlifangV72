import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { projectApi, ActivityProject } from '../services/api'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import { Calendar, Plus, Search, Filter, Edit2, Trash2, Eye, Clock } from 'lucide-react'

const ProjectsPage: React.FC = () => {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [projects, setProjects] = useState<ActivityProject[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (!user) return
    
    const fetchProjects = async () => {
      try {
        const response = await projectApi.list()
        setProjects(response.data)
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      }
    }
    
    fetchProjects()
  }, [user])

  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return
    
    try {
      await projectApi.delete(id)
      const response = await projectApi.list()
      setProjects(response.data)
    } catch (err) {
      console.error('Failed to delete project:', err)
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

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'created': return 'bg-gray-100 text-gray-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'archived': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '进行中'
      case 'completed': return '已完成'
      case 'created': return '已创建'
      case 'pending': return '待处理'
      case 'cancelled': return '已取消'
      case 'archived': return '已归档'
      default: return status
    }
  }

  return (
    <AuthProvider>
      <Layout title="项目管理">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="text"
                placeholder="搜索项目..."
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
                <option value="created">已创建</option>
                <option value="active">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            创建项目
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="text-neutral-600 text-sm mb-4">{project.description || '暂无描述'}</p>
                
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  {project.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {project.end_date && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Calendar size={48} className="mx-auto text-neutral-300 mb-4" />
              <p className="text-neutral-500">暂无项目数据</p>
            </div>
          )}
        </div>
      </Layout>
    </AuthProvider>
  )
}

export default ProjectsPage