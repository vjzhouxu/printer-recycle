"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Camera,
  ChevronRight,
  MessageCircle,
  ChevronLeft,
  Check,
  Upload,
  Phone,
  Printer,
  Calendar,
  Clock,
  Wrench,
  Package,
  ArrowRight,
  Search,
  X,
  Edit,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  DollarSign,
  Users,
  Key,
  Settings,
} from "lucide-react";

// ============================================
// 类型定义
// ============================================
type Accessory = {
  name: string;
  value: number;
};

type PrinterModel = {
  name: string;
  releaseYear: number;
  originalPrice: number;
  accessories?: Accessory[];
};

type Brand = {
  name: string;
  models: PrinterModel[];
};

type User = {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
};

// 初始数据
const INITIAL_BRANDS: Brand[] = [
  {
    name: "拓竹",
    models: [
      {
        name: "H2D",
        releaseYear: 2025,
        originalPrice: 2199,
        accessories: [{ name: "AMS Pro", value: 350 }],
      },
      {
        name: "X1E",
        releaseYear: 2024,
        originalPrice: 1799,
        accessories: [{ name: "AMS", value: 180 }],
      },
      {
        name: "X1 Carbon",
        releaseYear: 2022,
        originalPrice: 1199,
        accessories: [
          { name: "AMS", value: 180 },
          { name: "AMS 2", value: 240 },
        ],
      },
      {
        name: "P2S",
        releaseYear: 2025,
        originalPrice: 1499,
        accessories: [{ name: "AMS 2", value: 240 }],
      },
      {
        name: "P1S",
        releaseYear: 2023,
        originalPrice: 699,
        accessories: [{ name: "AMS", value: 180 }],
      },
      {
        name: "P1P",
        releaseYear: 2022,
        originalPrice: 599,
        accessories: [{ name: "AMS", value: 180 }],
      },
      {
        name: "A1",
        releaseYear: 2024,
        originalPrice: 399,
        accessories: [{ name: "AMS Lite", value: 120 }],
      },
      {
        name: "A1 Mini",
        releaseYear: 2024,
        originalPrice: 299,
        accessories: [{ name: "AMS Lite", value: 120 }],
      },
    ],
  },
  {
    name: "创想三维",
    models: [
      { name: "K2 Plus", releaseYear: 2025, originalPrice: 1499 },
      { name: "K1C", releaseYear: 2024, originalPrice: 699 },
      { name: "K1 Max", releaseYear: 2023, originalPrice: 899 },
      { name: "K1", releaseYear: 2023, originalPrice: 599 },
      { name: "Ender-3 V3", releaseYear: 2024, originalPrice: 399 },
      { name: "Ender-3 V3 Plus", releaseYear: 2024, originalPrice: 499 },
    ],
  },
  {
    name: "闪铸",
    models: [
      { name: "Adventurer 5M", releaseYear: 2024, originalPrice: 499 },
      { name: "Adventurer 5M Pro", releaseYear: 2024, originalPrice: 699 },
      { name: "Creator Pro 2", releaseYear: 2022, originalPrice: 649 },
      { name: "Guider 3", releaseYear: 2023, originalPrice: 1299 },
    ],
  },
];

const CONDITIONS = [
  { label: "99新", factor: 1.1, desc: "几乎全新，无使用痕迹" },
  { label: "95新", factor: 1, desc: "轻微使用痕迹" },
  { label: "9成新", factor: 0.9, desc: "正常使用痕迹" },
  { label: "8成新", factor: 0.8, desc: "明显使用痕迹" },
  { label: "7成新", factor: 0.7, desc: "较多使用痕迹" },
];

const USAGE_OPTIONS = [
  { label: "100小时内", factor: 1, desc: "轻度使用" },
  { label: "100-300小时", factor: 0.95, desc: "中度使用" },
  { label: "301-600小时", factor: 0.88, desc: "重度使用" },
  { label: "601小时以上", factor: 0.78, desc: "高强度使用" },
];

const FAULT_OPTIONS = [
  { label: "无故障", factor: 1, desc: "所有功能正常" },
  { label: "喷头异常", factor: 0.88, desc: "喷头需要维修" },
  { label: "热床异常", factor: 0.82, desc: "热床需要维修" },
  { label: "主板异常", factor: 0.7, desc: "主板需要维修" },
  { label: "无法开机", factor: 0.55, desc: "无法正常使用" },
];

// 初始用户数据
const INITIAL_USERS: User[] = [
  {
    id: "1",
    username: "admin",
    password: "admin123456",
    role: "super_admin",
    createdAt: new Date().toISOString(),
  },
];

type Step = "brand" | "model" | "condition" | "usage" | "fault" | "accessories" | "contact";

// ============================================
// 用户订单查询组件
// ============================================
function OrderQueryPage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchOrders = async () => {
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请输入正确的手机号码")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/order-query?phone=${phoneNumber}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      } else {
        alert(data.error || "查询失败")
      }
    } catch (error) {
      console.error("查询失败:", error)
      alert("查询失败，请稍后重试")
    } finally {
      setLoading(false)
      setHasSearched(true)
    }
  }

  const goBack = () => {
    window.location.href = '/'
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待审核'
      case 'PROCESSING': return '处理中'
      case 'COMPLETED': return '已完成'
      case 'CANCELLED': return '已取消'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100">
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 hover:bg-neutral-100 rounded-full transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-bold">订单查询</h1>
              <p className="text-sm text-neutral-500 mt-1">输入手机号查询您的回收订单</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex gap-3">
            <input
              type="tel"
              placeholder="请输入手机号码"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchOrders()}
              className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-base focus:outline-none focus:border-black"
            />
            <button
              onClick={searchOrders}
              disabled={loading}
              className="bg-black text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50"
            >
              {loading ? "查询中..." : <Search size={20} />}
            </button>
          </div>
        </div>

        {hasSearched && (
          <div className="mt-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center">
                <p className="text-neutral-500">暂无订单记录</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">设备</span>
                      <span className="font-medium">{order.brand} {order.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">估价</span>
                      <span className="font-bold text-lg">¥{order.estimatePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">提交时间</span>
                      <span className="text-sm">{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                    {order.finalPrice && order.finalPrice !== order.estimatePrice && order.status !== 'PENDING' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">最终报价</span>
                        <span className="font-bold text-green-600">¥{order.finalPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// 后台管理页面组件（增强版）
// ============================================
function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'coefficients' | 'users'>('orders')
  const [orders, setOrders] = useState<any[]>([])
  const [brands, setBrands] = useState<Brand[]>(INITIAL_BRANDS)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [currentUser, setCurrentUser] = useState<string>('')
  
  // 编辑报价
  const [editingPriceOrder, setEditingPriceOrder] = useState<any>(null)
  const [newPrice, setNewPrice] = useState<number>(0)
  
  // 编辑附件价格
  const [editingAccessory, setEditingAccessory] = useState<{ brand: string; model: string; accessory: Accessory } | null>(null)
  const [newAccessoryValue, setNewAccessoryValue] = useState<number>(0)
  
  // 修改密码
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // 添加用户
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  // 编辑状态
  const [editingBrand, setEditingBrand] = useState<string | null>(null)
  const [editingModel, setEditingModel] = useState<{ brand: string; model: string } | null>(null)
  const [newBrandName, setNewBrandName] = useState('')
  const [newModel, setNewModel] = useState<Partial<PrinterModel>>({})
  
  // 系数编辑
  const [editingCondition, setEditingCondition] = useState<string | null>(null)
  const [editingUsage, setEditingUsage] = useState<string | null>(null)
  const [editingFault, setEditingFault] = useState<string | null>(null)

  const ADMIN_KEY = 'admin123456'

  const handleLogin = () => {
    const user = users.find(u => u.username === password || (u.password === password))
    if (user) {
      setIsAuthed(true)
      setCurrentUser(user.username)
      fetchOrders()
    } else {
      alert('密码错误')
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin-orders?status=${status}`, {
        headers: { 'Authorization': `Bearer ${ADMIN_KEY}` }
      })
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      }
    } catch (error) {
      console.error('获取订单失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_KEY}`
        },
        body: JSON.stringify({ id, status: newStatus })
      })
      if (res.ok) {
        fetchOrders()
        alert('状态更新成功')
      }
    } catch (error) {
      alert('更新失败')
    }
  }

  const updateOrderPrice = async (id: string, finalPrice: number) => {
    try {
      const res = await fetch('/api/admin-orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_KEY}`
        },
        body: JSON.stringify({ id, finalPrice })
      })
      if (res.ok) {
        fetchOrders()
        setEditingPriceOrder(null)
        alert('报价修改成功')
      }
    } catch (error) {
      alert('修改失败')
    }
  }

  const changePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('请填写完整信息')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致')
      return
    }
    
    const userIndex = users.findIndex(u => u.username === currentUser)
    if (userIndex !== -1 && users[userIndex].password === oldPassword) {
      const updatedUsers = [...users]
      updatedUsers[userIndex].password = newPassword
      setUsers(updatedUsers)
      alert('密码修改成功，请重新登录')
      setIsAuthed(false)
      setShowChangePassword(false)
    } else {
      alert('原密码错误')
    }
  }

  const addUser = () => {
    if (!newUsername || !newUserPassword) {
      alert('请填写完整信息')
      return
    }
    if (users.find(u => u.username === newUsername)) {
      alert('用户名已存在')
      return
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername,
      password: newUserPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    setShowAddUser(false)
    setNewUsername('')
    setNewUserPassword('')
    alert('用户添加成功')
  }

  const deleteUser = (userId: string, username: string) => {
    if (username === currentUser) {
      alert('不能删除自己的账号')
      return
    }
    if (confirm(`确定要删除用户 "${username}" 吗？`)) {
      setUsers(users.filter(u => u.id !== userId))
      alert('删除成功')
    }
  }

  // 添加品牌
  const addBrand = () => {
    if (!newBrandName) return
    setBrands([...brands, { name: newBrandName, models: [] }])
    setNewBrandName('')
  }

  // 删除品牌
  const deleteBrand = (brandName: string) => {
    if (confirm(`确定要删除品牌 "${brandName}" 吗？`)) {
      setBrands(brands.filter(b => b.name !== brandName))
    }
  }

  // 添加型号
  const addModel = (brandName: string) => {
    if (!newModel.name) return
    setBrands(brands.map(b => {
      if (b.name === brandName) {
        return {
          ...b,
          models: [...b.models, {
            name: newModel.name!,
            releaseYear: newModel.releaseYear || 2024,
            originalPrice: newModel.originalPrice || 0,
            accessories: newModel.accessories || []
          }]
        }
      }
      return b
    }))
    setNewModel({})
  }

  // 删除型号
  const deleteModel = (brandName: string, modelName: string) => {
    if (confirm(`确定要删除型号 "${modelName}" 吗？`)) {
      setBrands(brands.map(b => {
        if (b.name === brandName) {
          return { ...b, models: b.models.filter(m => m.name !== modelName) }
        }
        return b
      }))
    }
  }

  // 更新附件价格
  const updateAccessoryValue = (brandName: string, modelName: string, accessoryName: string, newValue: number) => {
    setBrands(brands.map(b => {
      if (b.name === brandName) {
        return {
          ...b,
          models: b.models.map(m => {
            if (m.name === modelName && m.accessories) {
              return {
                ...m,
                accessories: m.accessories.map(a => 
                  a.name === accessoryName ? { ...a, value: newValue } : a
                )
              }
            }
            return m
          })
        }
      }
      return b
    }))
    setEditingAccessory(null)
    alert('附件价格已更新')
  }

  // 添加附件
  const addAccessory = (brandName: string, modelName: string) => {
    const newAccessoryName = prompt('请输入附件名称')
    if (!newAccessoryName) return
    const newAccessoryValue = parseInt(prompt('请输入附件价值(元)') || '0')
    if (isNaN(newAccessoryValue)) return
    
    setBrands(brands.map(b => {
      if (b.name === brandName) {
        return {
          ...b,
          models: b.models.map(m => {
            if (m.name === modelName) {
              return {
                ...m,
                accessories: [...(m.accessories || []), { name: newAccessoryName, value: newAccessoryValue }]
              }
            }
            return m
          })
        }
      }
      return b
    }))
    alert('附件已添加')
  }

  // 删除附件
  const deleteAccessory = (brandName: string, modelName: string, accessoryName: string) => {
    if (confirm(`确定要删除附件 "${accessoryName}" 吗？`)) {
      setBrands(brands.map(b => {
        if (b.name === brandName) {
          return {
            ...b,
            models: b.models.map(m => {
              if (m.name === modelName && m.accessories) {
                return {
                  ...m,
                  accessories: m.accessories.filter(a => a.name !== accessoryName)
                }
              }
              return m
            })
          }
        }
        return b
      }))
    }
  }

  // 更新系数
  const updateConditionFactor = (label: string, factor: number) => {
    const index = CONDITIONS.findIndex(c => c.label === label)
    if (index !== -1) {
      CONDITIONS[index].factor = factor
    }
    setEditingCondition(null)
  }

  const updateUsageFactor = (label: string, factor: number) => {
    const index = USAGE_OPTIONS.findIndex(u => u.label === label)
    if (index !== -1) {
      USAGE_OPTIONS[index].factor = factor
    }
    setEditingUsage(null)
  }

  const updateFaultFactor = (label: string, factor: number) => {
    const index = FAULT_OPTIONS.findIndex(f => f.label === label)
    if (index !== -1) {
      FAULT_OPTIONS[index].factor = factor
    }
    setEditingFault(null)
  }

  useEffect(() => {
    if (isAuthed) {
      fetchOrders()
    }
  }, [status, isAuthed])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '待审核'
      case 'PROCESSING': return '处理中'
      case 'COMPLETED': return '已完成'
      case 'CANCELLED': return '已取消'
      default: return status
    }
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6">后台登录</h1>
          <input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-black"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            登录
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">3D打印机回收后台</h1>
              <p className="text-gray-500 mt-1">欢迎，{currentUser}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black flex items-center gap-1"
              >
                <Key size={16} /> 修改密码
              </button>
              <button
                onClick={() => setIsAuthed(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black"
              >
                退出登录
              </button>
            </div>
          </div>
          
          {/* Tab 切换 */}
          <div className="flex gap-4 mt-6 border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 px-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'orders' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
            >
              订单管理
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-3 px-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'products' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
            >
              产品管理
            </button>
            <button
              onClick={() => setActiveTab('coefficients')}
              className={`pb-3 px-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'coefficients' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
            >
              系数设置
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-3 px-2 text-sm font-medium transition whitespace-nowrap ${
                activeTab === 'users' ? 'text-black border-b-2 border-black' : 'text-gray-500'
              }`}
            >
              用户管理
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 订单管理 */}
        {activeTab === 'orders' && (
          <>
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
              {['all', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    status === s ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s === 'all' ? '全部订单' : getStatusText(s)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4">
                <div className="text-gray-500 text-sm">总订单</div>
                <div className="text-2xl font-bold mt-1">{orders.length}</div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="text-gray-500 text-sm">待审核</div>
                <div className="text-2xl font-bold mt-1 text-yellow-600">
                  {orders.filter(o => o.status === 'PENDING').length}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="text-gray-500 text-sm">处理中</div>
                <div className="text-2xl font-bold mt-1 text-blue-600">
                  {orders.filter(o => o.status === 'PROCESSING').length}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4">
                <div className="text-gray-500 text-sm">已完成</div>
                <div className="text-2xl font-bold mt-1 text-green-600">
                  {orders.filter(o => o.status === 'COMPLETED').length}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">暂无订单</div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="font-semibold text-lg">{order.brand} {order.model}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            估价: ¥{order.estimatePrice}
                            {order.finalPrice && order.finalPrice !== order.estimatePrice && (
                              <span className="ml-2 text-green-600">→ 最终: ¥{order.finalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 订单详情 */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm bg-gray-50 p-3 rounded-xl">
                      <div><span className="text-gray-500">成色:</span> {order.condition}</div>
                      <div><span className="text-gray-500">使用时间:</span> {order.usage}</div>
                      <div><span className="text-gray-500">故障:</span> {order.fault}</div>
                      <div><span className="text-gray-500">联系方式:</span> {order.phone}</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {/* 修改报价按钮 - 待审核和处理中状态都可以修改 */}
                        {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                          <button
                            onClick={() => {
                              setEditingPriceOrder(order)
                              setNewPrice(order.finalPrice || order.estimatePrice)
                            }}
                            className="px-3 py-1 bg-purple-500 text-white rounded-lg text-sm flex items-center gap-1"
                          >
                            <DollarSign size={14} /> 修改报价
                          </button>
                        )}
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm"
                            >
                              开始处理
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                            >
                              取消
                            </button>
                          </>
                        )}
                        {order.status === 'PROCESSING' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                          >
                            完成回收
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 产品管理 */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">添加新品牌</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="品牌名称"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:border-black"
                />
                <button
                  onClick={addBrand}
                  className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Plus size={16} /> 添加
                </button>
              </div>
            </div>

            {brands.map((brand) => (
              <div key={brand.name} className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{brand.name}</h3>
                  <button
                    onClick={() => deleteBrand(brand.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="型号名称"
                      value={newModel.name || ''}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="年份"
                      value={newModel.releaseYear || ''}
                      onChange={(e) => setNewModel({ ...newModel, releaseYear: parseInt(e.target.value) })}
                      className="w-24 border rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="原价"
                      value={newModel.originalPrice || ''}
                      onChange={(e) => setNewModel({ ...newModel, originalPrice: parseInt(e.target.value) })}
                      className="w-28 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => addModel(brand.name)}
                      className="bg-black text-white px-3 py-2 rounded-lg text-sm"
                    >
                      添加型号
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {brand.models.map((model) => (
                    <div key={model.name} className="border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-gray-500">{model.releaseYear}年 · 原价 ¥{model.originalPrice}</div>
                        </div>
                        <button
                          onClick={() => deleteModel(brand.name, model.name)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      {/* 附件管理 */}
                      {model.accessories && model.accessories.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="text-sm font-medium mb-2">附件列表：</div>
                          <div className="space-y-2">
                            {model.accessories.map((acc) => (
                              <div key={acc.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                <span className="text-sm">{acc.name}</span>
                                <div className="flex items-center gap-2">
                                  {editingAccessory?.accessory.name === acc.name && 
                                   editingAccessory?.brand === brand.name && 
                                   editingAccessory?.model === model.name ? (
                                    <div className="flex gap-1">
                                      <input
                                        type="number"
                                        value={newAccessoryValue}
                                        onChange={(e) => setNewAccessoryValue(parseInt(e.target.value))}
                                        className="w-24 border rounded px-2 py-1 text-sm"
                                      />
                                      <button
                                        onClick={() => updateAccessoryValue(brand.name, model.name, acc.name, newAccessoryValue)}
                                        className="text-green-600"
                                      >
                                        <Save size={14} />
                                      </button>
                                      <button
                                        onClick={() => setEditingAccessory(null)}
                                        className="text-gray-500"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-sm text-blue-600">¥{acc.value}</span>
                                      <button
                                        onClick={() => {
                                          setEditingAccessory({ brand: brand.name, model: model.name, accessory: acc })
                                          setNewAccessoryValue(acc.value)
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => deleteAccessory(brand.name, model.name, acc.name)}
                                        className="text-red-400 hover:text-red-600"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => addAccessory(brand.name, model.name)}
                        className="mt-3 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Plus size={14} /> 添加附件
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 系数设置 */}
        {activeTab === 'coefficients' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">成色系数</h3>
              <div className="space-y-3">
                {CONDITIONS.map((c) => (
                  <div key={c.label} className="flex items-center justify-between">
                    <span className="w-24">{c.label}</span>
                    {editingCondition === c.label ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={c.factor}
                          id={`factor-${c.label}`}
                          className="w-24 border rounded-lg px-3 py-1"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`factor-${c.label}`) as HTMLInputElement
                            updateConditionFactor(c.label, parseFloat(input.value))
                          }}
                          className="text-green-600"
                        >
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingCondition(null)} className="text-gray-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">{c.factor}</span>
                        <button onClick={() => setEditingCondition(c.label)} className="text-gray-400 hover:text-gray-600">
                          <Edit size={14} />
                        </button>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 w-32 text-right">{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">使用时间系数</h3>
              <div className="space-y-3">
                {USAGE_OPTIONS.map((u) => (
                  <div key={u.label} className="flex items-center justify-between">
                    <span className="w-32">{u.label}</span>
                    {editingUsage === u.label ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={u.factor}
                          id={`usage-${u.label}`}
                          className="w-24 border rounded-lg px-3 py-1"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`usage-${u.label}`) as HTMLInputElement
                            updateUsageFactor(u.label, parseFloat(input.value))
                          }}
                          className="text-green-600"
                        >
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingUsage(null)} className="text-gray-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">{u.factor}</span>
                        <button onClick={() => setEditingUsage(u.label)} className="text-gray-400 hover:text-gray-600">
                          <Edit size={14} />
                        </button>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 w-32 text-right">{u.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <h3 className="font-semibold mb-4">功能故障系数</h3>
              <div className="space-y-3">
                {FAULT_OPTIONS.map((f) => (
                  <div key={f.label} className="flex items-center justify-between">
                    <span className="w-32">{f.label}</span>
                    {editingFault === f.label ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={f.factor}
                          id={`fault-${f.label}`}
                          className="w-24 border rounded-lg px-3 py-1"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`fault-${f.label}`) as HTMLInputElement
                            updateFaultFactor(f.label, parseFloat(input.value))
                          }}
                          className="text-green-600"
                        >
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingFault(null)} className="text-gray-500">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">{f.factor}</span>
                        <button onClick={() => setEditingFault(f.label)} className="text-gray-400 hover:text-gray-600">
                          <Edit size={14} />
                        </button>
                      </div>
                    )}
                    <span className="text-sm text-gray-500 w-32 text-right">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 用户管理 */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">用户列表</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> 添加用户
                </button>
              </div>
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-gray-500">
                        角色: {user.role === 'super_admin' ? '超级管理员' : '管理员'} · 
                        创建时间: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {user.username !== currentUser && (
                      <button
                        onClick={() => deleteUser(user.id, user.username)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 修改报价弹窗 */}
      {editingPriceOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">修改报价</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">订单号</div>
              <div className="font-mono">{editingPriceOrder.orderNo}</div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">设备</div>
              <div>{editingPriceOrder.brand} {editingPriceOrder.model}</div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">原估价</div>
              <div className="text-lg">¥{editingPriceOrder.estimatePrice}</div>
            </div>
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">新报价</div>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value))}
                className="w-full border rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-black"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => updateOrderPrice(editingPriceOrder.id, newPrice)}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold"
              >
                确认修改
              </button>
              <button
                onClick={() => setEditingPriceOrder(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改密码弹窗 */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">修改密码</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">原密码</div>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">新密码</div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">确认新密码</div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={changePassword}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold"
              >
                确认修改
              </button>
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加用户弹窗 */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">添加用户</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">用户名</div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">密码</div>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:border-black"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addUser}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold"
              >
                确认添加
              </button>
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// 用户回收页面组件（已隐藏原价）
// ============================================
function RecyclePage() {
  const [currentStep, setCurrentStep] = useState<Step>("brand");
  const [brandName, setBrandName] = useState("拓竹");
  const [modelName, setModelName] = useState("X1 Carbon");
  const [condition, setCondition] = useState("95新");
  const [usage, setUsage] = useState("100小时内");
  const [fault, setFault] = useState("无故障");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState<number>(0);

  const brand = useMemo(() => INITIAL_BRANDS.find((b) => b.name === brandName)!, [brandName]);
  const model = useMemo(
    () => brand.models.find((m) => m.name === modelName)!,
    [brand, modelName]
  );

  const conditionFactor = CONDITIONS.find((c) => c.label === condition)?.factor || 1;
  const usageFactor = USAGE_OPTIONS.find((u) => u.label === usage)?.factor || 1;
  const faultFactor = FAULT_OPTIONS.find((f) => f.label === fault)?.factor || 1;

  const estimate = useMemo(() => {
    let baseFactor = 0.45;
    if (model.releaseYear === 2024) baseFactor = 0.55;
    if (model.releaseYear === 2025) baseFactor = 0.75;

    const basePrice = model.originalPrice * baseFactor;
    const accessoriesPrice =
      model.accessories
        ?.filter((a) => selectedAccessories.includes(a.name))
        .reduce((sum, a) => {
          let accessoryFactor = 0.45;
          if (model.releaseYear === 2024) accessoryFactor = 0.55;
          if (model.releaseYear === 2025) accessoryFactor = 0.75;
          return sum + a.value * accessoryFactor;
        }, 0) || 0;

    return Math.round(basePrice * conditionFactor * usageFactor * faultFactor + accessoriesPrice);
  }, [model, conditionFactor, usageFactor, faultFactor, selectedAccessories]);

  const steps: { id: Step; title: string; icon: React.ReactNode }[] = [
    { id: "brand", title: "选择品牌", icon: <Printer size={20} /> },
    { id: "model", title: "选择型号", icon: <Printer size={20} /> },
    { id: "condition", title: "选择成色", icon: <Calendar size={20} /> },
    { id: "usage", title: "使用时间", icon: <Clock size={20} /> },
    { id: "fault", title: "功能故障", icon: <Wrench size={20} /> },
    { id: "accessories", title: "附件选择", icon: <Package size={20} /> },
    { id: "contact", title: "联系方式", icon: <Phone size={20} /> },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowEstimate(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextStep();
      else prevStep();
    }
    setTouchStart(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitOrder = async () => {
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请填写正确的手机号码");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      }

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: brandName,
          model: modelName,
          phone: phoneNumber,
          condition: condition,
          usage: usage,
          fault: fault,
          accessories: JSON.stringify(selectedAccessories),
          estimate: estimate.toString(),
          imageUrl: imageUrl,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert('提交成功！订单号：' + data.data.orderNo);
        setPhoneNumber("");
        setUploadedImage(null);
        setImagePreview(null);
        setShowEstimate(false);
        setCurrentStep("brand");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert('提交失败：' + (data.error || data.message || '请稍后重试'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败：' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "brand":
        return (
          <div className="space-y-3">
            {INITIAL_BRANDS.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  setBrandName(b.name);
                  setModelName(b.models[0].name);
                  setSelectedAccessories([]);
                  nextStep();
                }}
                className="w-full bg-white rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm border-2 border-transparent hover:border-black/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-semibold">{b.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">{b.models.length} 款机型</div>
                  </div>
                  <ArrowRight className="text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        );

      case "model":
        return (
          <div className="space-y-3">
            {brand.models.map((m) => (
              <button
                key={m.name}
                onClick={() => {
                  setModelName(m.name);
                  setSelectedAccessories([]);
                  nextStep();
                }}
                className={`w-full bg-white rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm ${
                  modelName === m.name
                    ? "border-2 border-black bg-neutral-50"
                    : "border border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{m.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {m.releaseYear}年上市
                    </div>
                  </div>
                  <ChevronRight className="text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        );

      case "condition":
        return (
          <div className="space-y-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  setCondition(c.label);
                  nextStep();
                }}
                className={`w-full rounded-2xl p-5 text-left transition-all ${
                  condition === c.label
                    ? "bg-black text-white shadow-lg scale-[1.02]"
                    : "bg-white shadow-sm hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{c.label}</div>
                    <div className={`text-sm mt-1 ${condition === c.label ? "text-white/70" : "text-neutral-500"}`}>
                      {c.desc}
                    </div>
                  </div>
                  {condition === c.label && <Check size={24} />}
                </div>
              </button>
            ))}
          </div>
        );

      case "usage":
        return (
          <div className="space-y-3">
            {USAGE_OPTIONS.map((u) => (
              <button
                key={u.label}
                onClick={() => {
                  setUsage(u.label);
                  nextStep();
                }}
                className={`w-full rounded-2xl p-5 text-left transition-all ${
                  usage === u.label
                    ? "bg-black text-white shadow-lg scale-[1.02]"
                    : "bg-white shadow-sm hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{u.label}</div>
                    <div className={`text-sm mt-1 ${usage === u.label ? "text-white/70" : "text-neutral-500"}`}>
                      {u.desc}
                    </div>
                  </div>
                  {usage === u.label && <Check size={24} />}
                </div>
              </button>
            ))}
          </div>
        );

      case "fault":
        return (
          <div className="space-y-3">
            {FAULT_OPTIONS.map((f) => (
              <button
                key={f.label}
                onClick={() => {
                  setFault(f.label);
                  nextStep();
                }}
                className={`w-full rounded-2xl p-5 text-left transition-all ${
                  fault === f.label
                    ? "bg-black text-white shadow-lg scale-[1.02]"
                    : "bg-white shadow-sm hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{f.label}</div>
                    <div className={`text-sm mt-1 ${fault === f.label ? "text-white/70" : "text-neutral-500"}`}>
                      {f.desc}
                    </div>
                  </div>
                  {fault === f.label && <Check size={24} />}
                </div>
              </button>
            ))}
          </div>
        );

      case "accessories":
        return (
          <div className="space-y-3">
            {model.accessories && model.accessories.length > 0 ? (
              <>
                {model.accessories.map((a) => (
                  <button
                    key={a.name}
                    onClick={() => {
                      setSelectedAccessories((prev) =>
                        prev.includes(a.name) ? prev.filter((x) => x !== a.name) : [...prev, a.name]
                      );
                    }}
                    className={`w-full rounded-2xl p-5 text-left transition-all ${
                      selectedAccessories.includes(a.name)
                        ? "bg-black text-white shadow-lg scale-[1.02]"
                        : "bg-white shadow-sm hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{a.name}</div>
                        <div className={`text-sm mt-1 ${selectedAccessories.includes(a.name) ? "text-white/70" : "text-neutral-500"}`}>
                          增值 ¥{Math.round(a.value * (model.releaseYear === 2025 ? 0.75 : model.releaseYear === 2024 ? 0.55 : 0.45))}
                        </div>
                      </div>
                      {selectedAccessories.includes(a.name) && <Check size={24} />}
                    </div>
                  </button>
                ))}
                <button
                  onClick={nextStep}
                  className="w-full bg-black text-white rounded-2xl py-4 font-semibold mt-4"
                >
                  下一步
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-500">该型号暂无可选附件</p>
                <button onClick={nextStep} className="mt-6 bg-black text-white rounded-2xl px-8 py-3">
                  继续
                </button>
              </div>
            )}
          </div>
        );

      case "contact":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-medium mb-2">手机号码</label>
              <input
                type="tel"
                placeholder="请输入手机号码"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-lg focus:outline-none focus:border-black transition"
              />
              <p className="text-xs text-neutral-500 mt-2">用于接收回收订单通知</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label className="block text-sm font-medium mb-3">上传设备图片（可选）</label>
              <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition">
                <Camera size={40} className="text-neutral-400" />
                <div className="mt-3 font-medium">{uploadedImage ? uploadedImage.name : "点击上传打印机图片"}</div>
                <div className="text-sm text-neutral-500 mt-1">支持 JPG / PNG</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  multiple={false}
                />
              </label>
              
              {imagePreview && (
                <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">图片预览：</div>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="预览"
                      className="w-32 h-32 object-cover rounded-xl border"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={submitOrder}
              disabled={isSubmitting}
              className="w-full bg-black text-white rounded-2xl py-5 font-semibold text-lg disabled:opacity-50"
            >
              {isSubmitting ? "提交中..." : "确认提交"}
            </button>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-20">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">3D打印机回收</h1>
              <p className="text-xs text-neutral-500">在线估价 · 极速回收</p>
            </div>
            <a
              href="/?query=true"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/?query=true';
              }}
              className="text-sm text-neutral-600 hover:text-black flex items-center gap-1"
            >
              <Search size={16} /> 查询订单
            </a>
          </div>
        </div>
      </div>

      {!showEstimate && (
        <div className="sticky top-[73px] z-40 bg-gradient-to-r from-black to-neutral-800 text-white mx-4 mt-4 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-70">当前估价</div>
              <div className="text-2xl font-bold">¥{estimate}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">{brandName}</div>
              <div className="text-sm font-medium">{modelName}</div>
            </div>
          </div>
        </div>
      )}

      <div
        className="max-w-md mx-auto px-4 py-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!showEstimate ? (
          <div className="animate-fadeIn">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{steps[currentIndex].title}</h2>
              <p className="text-neutral-500 text-sm mt-1">请选择以下选项</p>
            </div>
            {renderStep()}
          </div>
        ) : (
          <div className="animate-fadeIn space-y-4">
            <div className="bg-gradient-to-br from-black to-neutral-900 text-white rounded-3xl p-8 text-center">
              <div className="text-sm opacity-70 mb-2">最高回收价</div>
              <div className="text-6xl font-bold">¥{estimate}</div>
              <div className="text-sm opacity-70 mt-3">最终价格以人工检测为准</div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">回收信息</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">品牌型号</span>
                  <span className="font-medium">{brandName} {modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">成色</span>
                  <span className="font-medium">{condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">使用时间</span>
                  <span className="font-medium">{usage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">功能故障</span>
                  <span className="font-medium">{fault}</span>
                </div>
                {selectedAccessories.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">附加配件</span>
                    <span className="font-medium">{selectedAccessories.join("、")}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setShowEstimate(false);
                setCurrentStep("contact");
              }}
              className="w-full bg-black text-white rounded-2xl py-5 font-semibold text-lg"
            >
              立即回收
            </button>

            <button
              onClick={() => setShowEstimate(false)}
              className="w-full bg-white text-black border-2 border-black rounded-2xl py-4 font-medium"
            >
              重新估价
            </button>
          </div>
        )}
      </div>

      <button className="fixed bottom-6 right-4 bg-black text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all z-50">
        <MessageCircle size={24} />
      </button>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

// ============================================
// 主入口 - 根据路由显示不同页面
// ============================================
export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.search.includes('admin=true')
  const isQuery = window.location.search.includes('query=true')
  
  if (isAdmin) {
    return <AdminPage />
  }
  
  if (isQuery) {
    return <OrderQueryPage />
  }
  
  return <RecyclePage />
}