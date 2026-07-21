import React from 'react'
import Link from 'next/link'
import { Sparkles, Shield, Users, TrendingUp, ArrowRight, CheckCircle, Brain, Handshake, Music, Award, BookOpen, Calendar, Building2, Star, Play } from 'lucide-react'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI经营助手',
      desc: '需求成熟度分析、服务商智能推荐、报价草拟，AI赋能但不越权',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Handshake,
      title: '可信协作网络',
      desc: '单一主服务Tenant、模块化协作、透明的来源归因与服务费',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Shield,
      title: '确定性工具',
      desc: '权限、路由、计费、状态管理由确定性系统执行，AI不直接操作',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: TrendingUp,
      title: '四轴状态系统',
      desc: '准备度、生命周期、发布度、证据度正交状态机，全程可审计',
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  const workflow = [
    { step: '01', title: '客户发布需求', desc: 'AI辅助分析成熟度，推荐处理模式' },
    { step: '02', title: '平台匹配服务商', desc: 'AI推荐，客户选择主服务Tenant' },
    { step: '03', title: '服务商承接', desc: '创建项目，模块化协作' },
    { step: '04', title: '报价与确认', desc: 'AI草拟报价，人工确认后发送' },
    { step: '05', title: '项目执行', desc: 'PlanItem跟踪交付，证据体系保障' },
    { step: '06', title: '完成与对账', desc: '金额守恒验证，来源归因计费' },
  ]

  const eventScenes = [
    { title: '年会', icon: Calendar, color: 'bg-red-50 text-red-600', count: '2,847场' },
    { title: '发布会', icon: Building2, color: 'bg-blue-50 text-blue-600', count: '1,563场' },
    { title: '庆典', icon: Star, color: 'bg-yellow-50 text-yellow-600', count: '984场' },
    { title: '晚宴', icon: Sparkles, color: 'bg-purple-50 text-purple-600', count: '756场' },
    { title: '团建', icon: Users, color: 'bg-green-50 text-green-600', count: '3,241场' },
    { title: '展览', icon: Award, color: 'bg-orange-50 text-orange-600', count: '632场' },
  ]

  const discoverCards = [
    {
      icon: Users,
      title: '发现艺人',
      desc: '浏览平台上的优秀艺人资源',
      href: '/discover/actors',
      color: 'bg-primary-500',
      items: ['歌手', '舞者', '魔术师', '主持人'],
    },
    {
      icon: Music,
      title: '节目库',
      desc: '丰富多彩的节目内容',
      href: '/discover/programs',
      color: 'bg-purple-500',
      items: ['音乐表演', '舞蹈', '魔术', '脱口秀'],
    },
    {
      icon: Award,
      title: '成功案例',
      desc: '真实活动案例参考',
      href: '/discover/cases',
      color: 'bg-orange-500',
      items: ['年会', '发布会', '庆典', '晚宴'],
    },
    {
      icon: BookOpen,
      title: '活动指南',
      desc: '专业策划知识与工具',
      href: '/discover/guides',
      color: 'bg-green-500',
      items: ['策划指南', '预算模板', '合同模板', '执行流程'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white">
      {/* 导航 */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-800">演立方</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/discover/actors" className="nav-link">发现</Link>
              <Link href="/login" className="nav-link">登录</Link>
              <Link href="/register" className="btn-primary text-sm">免费注册</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
            <Sparkles size={16} />
            V7.2 AI驱动 · 可信经营协作网络
          </div>
          <h1 className="text-5xl font-bold text-neutral-800 mb-6">
            把模糊的能力<br />转化为<span className="text-primary-600">可交付的产品</span>
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            面向商演与企业活动的AI经营产品，让客户高效决策、服务商高效经营、艺人高效发展
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
              立即开始
              <ArrowRight size={20} />
            </Link>
            <Link href="/discover/actors" className="btn-secondary text-base px-6 py-3">
              浏览发现
            </Link>
          </div>
        </div>
      </section>

      {/* 活动场景导航 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">活动场景</h2>
          <p className="text-neutral-600">选择您要举办的活动类型</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {eventScenes.map((scene, idx) => {
            const Icon = scene.icon
            return (
              <Link
                key={idx}
                href="/demands"
                className="card p-4 hover:shadow-lg transition-shadow text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${scene.color}`}>
                  <Icon size={24} />
                </div>
                <p className="font-medium text-neutral-800">{scene.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{scene.count}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 公开发现入口 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">发现更多</h2>
          <p className="text-neutral-600">浏览丰富的资源和内容，获取活动灵感</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {discoverCards.map((card, idx) => {
            const Icon = card.icon
            return (
              <Link
                key={idx}
                href={card.href}
                className="card h-full hover:shadow-lg transition-all duration-300 group"
              >
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${card.color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-2">{card.title}</h3>
                  <p className="text-sm text-neutral-600 mb-4">{card.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {card.items.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 特性 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="card hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 工作流程 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-4">核心业务流程</h2>
          <p className="text-neutral-600">从需求到交付的完整闭环</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflow.map((item, idx) => (
            <div key={idx} className="card relative">
              <div className="text-4xl font-bold text-primary-100 absolute top-4 right-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2 relative">{item.title}</h3>
              <p className="text-sm text-neutral-600 relative">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 价值主张 */}
      <section className="bg-neutral-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">企业客户</h3>
              <p className="text-neutral-600">高效决策，从模糊需求到明确交付</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">服务商</h3>
              <p className="text-neutral-600">经营提效，把能力转化为可售产品</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={28} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">艺人</h3>
              <p className="text-neutral-600">职业资产积累，能力可视可验证</p>
            </div>
          </div>
        </div>
      </section>

      {/* 匿名快照入口 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4">匿名可行性快照</h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            不确定活动预算？输入您的活动类型和规模，AI将为您提供初步的可行性评估和预算参考
          </p>
          <button className="btn-white text-primary-600 font-medium">
            <Play size={18} className="inline mr-2" />
            30秒体验Demo
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-neutral-800 mb-4">开始您的演立方之旅</h2>
        <p className="text-neutral-600 mb-8">加入可信经营协作网络</p>
        <Link href="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
          免费注册
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>演立方 V7.2 · AI驱动的商演与企业活动经营平台</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
