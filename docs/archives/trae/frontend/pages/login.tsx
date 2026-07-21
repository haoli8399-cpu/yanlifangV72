import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LoginData } from '../services/api'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading, user } = useAuth()

  const getRoleRedirect = (role: string) => {
    const redirects: Record<string, string> = {
      customer: '/client',
      tenant_admin: '/tenant',
      actor: '/actor',
      platform_admin: '/admin',
    }
    return redirects[role] || '/client'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const loginData: LoginData = {
        username: email,
        password,
      }
      await login(loginData)
      const redirectUrl = user?.role ? getRoleRedirect(user.role) : '/client'
      window.location.href = redirectUrl
    } catch (err) {
      setError('登录失败，请检查邮箱和密码')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">演立方</h1>
          <p className="text-neutral-500">AI 驱动的商演与企业活动经营平台</p>
        </div>
        
        <div className="card">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">登录</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="请输入邮箱"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="请输入密码"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? '登录中...' : '登录'}
              <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-neutral-500 text-sm">
              还没有账号？
              <Link href="/register" className="text-primary-600 font-medium ml-1 hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage