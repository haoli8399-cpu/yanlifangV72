import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { AuthProvider } from '../context/AuthContext'
import { User, Bell, Shield, Palette, Database, HelpCircle, Save, CheckCircle } from 'lucide-react'

const SettingsPage: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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

  const sections = [
    { id: 'profile', label: '个人资料', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'security', label: '安全设置', icon: Shield },
    { id: 'appearance', label: '外观设置', icon: Palette },
    { id: 'data', label: '数据管理', icon: Database },
    { id: 'help', label: '帮助与支持', icon: HelpCircle },
  ]

  return (
    <AuthProvider>
      <Layout title="设置">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon size={18} />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800">
                  {sections.find(s => s.id === activeSection)?.label}
                </h2>
                {activeSection !== 'help' && activeSection !== 'data' && (
                  <button 
                    onClick={handleSave}
                    className={`btn-primary flex items-center gap-2 transition-all ${saved ? 'bg-green-600' : ''}`}
                  >
                    {saved ? <CheckCircle size={18} /> : <Save size={18} />}
                    {saved ? '已保存' : '保存设置'}
                  </button>
                )}
              </div>

              {activeSection === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={32} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">头像</p>
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1">
                        更换头像
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">姓名 *</label>
                      <input
                        type="text"
                        defaultValue={user.full_name || ''}
                        className="input-field"
                        placeholder="请输入姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">邮箱 *</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="input-field bg-neutral-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">手机号</label>
                      <input
                        type="tel"
                        defaultValue={user.phone || ''}
                        className="input-field"
                        placeholder="请输入手机号"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">角色</label>
                      <input
                        type="text"
                        defaultValue={user.role === 'customer' ? '企业客户' : 
                                    user.role === 'tenant_admin' ? '服务商' :
                                    user.role === 'actor' ? '艺人' : '平台管理员'}
                        className="input-field bg-neutral-50"
                        disabled
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">简介</label>
                    <textarea
                      className="input-field"
                      rows={4}
                      placeholder="请输入个人简介"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="space-y-4">
                  {[
                    { label: '邮件通知', desc: '接收系统邮件通知', default: true },
                    { label: '短信通知', desc: '接收重要通知短信', default: true },
                    { label: '推送通知', desc: '接收浏览器推送通知', default: false },
                    { label: '需求提醒', desc: '当有新需求时通知', default: true },
                    { label: '报价提醒', desc: '当收到报价时通知', default: true },
                    { label: '项目更新', desc: '当项目状态变更时通知', default: true },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <p className="font-medium text-neutral-800">{item.label}</p>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                      </div>
                      <button className={`w-12 h-6 rounded-full transition-colors ${item.default ? 'bg-primary-600' : 'bg-neutral-300'}`}>
                        <span className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${item.default ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800">建议定期更换密码以保障账户安全</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-4">修改密码</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">当前密码</label>
                        <input type="password" className="input-field" placeholder="请输入当前密码" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">新密码</label>
                        <input type="password" className="input-field" placeholder="请输入新密码" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">确认新密码</label>
                        <input type="password" className="input-field" placeholder="请再次输入新密码" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Shield size={20} className="text-blue-600 mb-2" />
                    <p className="text-blue-800">双因素认证功能即将上线</p>
                  </div>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">主题</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { name: '浅色', color: 'bg-white border-neutral-200' },
                        { name: '深色', color: 'bg-neutral-800 border-neutral-700' },
                        { name: '自动', color: 'bg-gradient-to-r from-white to-neutral-800 border-neutral-200' },
                      ].map((theme, index) => (
                        <button
                          key={index}
                          className={`p-4 rounded-lg border-2 transition-all ${index === 0 ? 'border-primary-500' : 'border-transparent hover:border-neutral-300'} ${theme.color}`}
                        >
                          <div className="flex justify-center gap-1 mb-2">
                            <div className="w-2 h-2 rounded-full bg-neutral-300"></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-400"></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-500"></div>
                          </div>
                          <p className="text-sm text-center text-neutral-700">{theme.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">字体大小</label>
                    <input type="range" min="12" max="18" defaultValue="14" className="w-full" />
                    <div className="flex justify-between text-xs text-neutral-500 mt-2">
                      <span>小</span>
                      <span>中</span>
                      <span>大</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'data' && (
                <div className="space-y-6">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <Database size={20} className="text-neutral-600 mb-2" />
                    <p className="text-neutral-700 mb-1">您的数据存储在安全的云端服务器</p>
                    <p className="text-sm text-neutral-500">最后备份时间：2024-01-15</p>
                  </div>

                  <button className="w-full p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                    导出所有数据
                  </button>

                  <button className="w-full p-4 border border-red-200 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                    删除账户及所有数据
                  </button>
                </div>
              )}

              {activeSection === 'help' && (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <HelpCircle size={20} className="text-blue-600 mb-2" />
                    <h3 className="font-medium text-blue-800 mb-1">需要帮助？</h3>
                    <p className="text-sm text-blue-700">联系我们的客服团队获取支持</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h4 className="font-medium text-neutral-800">常见问题</h4>
                      <p className="text-sm text-neutral-500">查看帮助中心了解常见问题解答</p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h4 className="font-medium text-neutral-800">联系客服</h4>
                      <p className="text-sm text-neutral-500">周一至周五 9:00-18:00</p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg">
                      <h4 className="font-medium text-neutral-800">反馈建议</h4>
                      <p className="text-sm text-neutral-500">帮助我们改进产品</p>
                    </div>
                  </div>

                  <div className="text-center text-sm text-neutral-500 pt-4 border-t border-neutral-200">
                    演立方 V7.2.0 | 版本号: 1.0.0
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AuthProvider>
  )
}

export default SettingsPage