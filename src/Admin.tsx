import { useState, useEffect } from 'react'

const ADMIN_KEY = 'admin123456'

type Order = {
  id: string
  orderNo: string
  brand: string
  model: string
  phone: string
  estimatePrice: number
  status: string
  createdAt: string
  condition: string
  usage: string
  fault: string
}

function Admin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)

  const handleLogin = () => {
    if (password === ADMIN_KEY) {
      setIsAuthed(true)
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

  useEffect(() => {
    if (isAuthed) {
      fetchOrders()
    }
  }, [status, isAuthed])

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
            placeholder="请输入管理密码"
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
              <h1 className="text-2xl font-bold">订单管理后台</h1>
              <p className="text-gray-500 mt-1">管理所有回收订单</p>
            </div>
            <button
              onClick={() => setIsAuthed(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-black"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 状态筛选 */}
        <div className="flex gap-3 mb-6">
          {['all', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                status === s
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s === 'all' ? '全部' : getStatusText(s)}
            </button>
          ))}
        </div>

        {/* 订单列表 */}
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
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="font-semibold text-lg">{order.brand} {order.model}</div>
                      <div className="text-sm text-gray-500 mt-1">估价: ¥{order.estimatePrice}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
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
                        完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin