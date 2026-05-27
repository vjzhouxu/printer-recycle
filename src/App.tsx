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
  ArrowLeft,
  DollarSign,
  Key,
  Edit,
  Trash2,
  Plus,
  Save,
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
  basePrice?: number;
  accessories?: Accessory[];
};

type Brand = {
  name: string;
  models: PrinterModel[];
};

type Coefficient = {
  id: string;
  category: string;
  label: string;
  factor: number;
  description: string;
};

type User = {
  id: string;
  username: string;
  password: string;
  role: string;
  createdAt: string;
};

type UploadedImage = {
  file: File;
  preview: string;
  id: string;
};

// 默认数据
const DEFAULT_CONDITIONS = [
  { label: "99新", factor: 1.1, description: "几乎全新，无使用痕迹" },
  { label: "95新", factor: 1, description: "轻微使用痕迹" },
  { label: "9成新", factor: 0.9, description: "正常使用痕迹" },
  { label: "8成新", factor: 0.8, description: "明显使用痕迹" },
  { label: "7成新", factor: 0.7, description: "较多使用痕迹" },
];

const DEFAULT_USAGES = [
  { label: "100小时内", factor: 1, description: "轻度使用" },
  { label: "100-300小时", factor: 0.95, description: "中度使用" },
  { label: "301-600小时", factor: 0.88, description: "重度使用" },
  { label: "601小时以上", factor: 0.78, description: "高强度使用" },
];

const DEFAULT_FAULTS = [
  { label: "无故障", factor: 1, description: "所有功能正常" },
  { label: "喷头异常", factor: 0.88, description: "喷头需要维修" },
  { label: "热床异常", factor: 0.82, description: "热床需要维修" },
  { label: "主板异常", factor: 0.7, description: "主板需要维修" },
  { label: "无法开机", factor: 0.55, description: "无法正常使用" },
];

const BRAND_ORDER = ["拓竹", "创想三维", "闪铸"];
const ADMIN_KEY = "admin123456";

type Step = "brand" | "model" | "condition" | "usage" | "fault" | "accessories" | "contact";

// ============================================
// 订单查询页面
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
      alert("查询失败，请稍后重试")
    } finally {
      setLoading(false)
      setHasSearched(true)
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
            <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-neutral-100 rounded-full transition">
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
            <button onClick={searchOrders} disabled={loading} className="bg-black text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">
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
// 后台管理页面
// ============================================
function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [password, setPassword] = useState("")
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("all")

  const handleLogin = () => {
    if (password === ADMIN_KEY) {
      setIsAuthed(true)
      fetchOrders()
    } else {
      alert("密码错误")
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin-orders?status=${status}`, {
        headers: { Authorization: `Bearer ${ADMIN_KEY}` }
      })
      const data = await res.json()
      if (data.success) setOrders(data.data)
    } catch (error) {
      console.error("获取订单失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (s: string) => {
    switch (s) {
      case "PENDING": return "待审核"
      case "PROCESSING": return "处理中"
      case "COMPLETED": return "已完成"
      case "CANCELLED": return "已取消"
      default: return s
    }
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-6">3D打印机回收后台</h1>
          <p className="text-gray-500 mb-4">请输入管理密码</p>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full border rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-black"
          />
          <button onClick={handleLogin} className="w-full bg-black text-white py-3 rounded-xl font-semibold">
            登录
          </button>
          <p className="text-xs text-gray-400 text-center mt-4">默认密码: admin123456</p>
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
              <p className="text-gray-500 mt-1">订单管理</p>
            </div>
            <button onClick={() => setIsAuthed(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-black">
              退出登录
            </button>
          </div>
          <div className="flex gap-4 mt-6 border-b">
            <button onClick={() => setActiveTab("orders")} className={`pb-3 px-2 text-sm font-medium ${activeTab === "orders" ? "text-black border-b-2 border-black" : "text-gray-500"}`}>
              订单管理
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-3 mb-6">
          {["all", "PENDING", "PROCESSING", "COMPLETED", "CANCELLED"].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-full text-sm ${status === s ? "bg-black text-white" : "bg-white text-gray-600"}`}>
              {s === "all" ? "全部" : getStatusText(s)}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-12">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无订单</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{order.orderNo}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">{getStatusText(order.status)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{order.brand} {order.model}</div>
                    <div className="text-sm text-gray-500">估价: ¥{order.estimatePrice}</div>
                    <div className="text-sm text-gray-500">{order.phone}</div>
                  </div>
                  <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// 主回收页面
// ============================================
function RecyclePage() {
  const [currentStep, setCurrentStep] = useState<Step>("brand");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [condition, setCondition] = useState("99新");
  const [usage, setUsage] = useState("100小时内");
  const [fault, setFault] = useState("无故障");
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS);
  const [usages, setUsages] = useState(DEFAULT_USAGES);
  const [faults, setFaults] = useState(DEFAULT_FAULTS);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState<number>(0);
  const MAX_IMAGES = 7;

  const sortConditionsByFactor = (conds: any[]) => [...conds].sort((a, b) => b.factor - a.factor);
  const sortUsagesByFactor = (usagesList: any[]) => [...usagesList].sort((a, b) => b.factor - a.factor);
  const sortFaultsByFactor = (faultsList: any[]) => [...faultsList].sort((a, b) => b.factor - a.factor);
  const sortModelsByPremium = (models: PrinterModel[]) => [...models].sort((a, b) => b.releaseYear - a.releaseYear);
  const sortBrandsByOrder = (brandsList: Brand[]) => [...brandsList].sort((a, b) => {
    const indexA = BRAND_ORDER.indexOf(a.name);
    const indexB = BRAND_ORDER.indexOf(b.name);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [productRes, coeffRes] = await Promise.all([
          fetch('/api/product-config'),
          fetch('/api/coefficient-config')
        ]);
        
        const productData = await productRes.json();
        const coeffData = await coeffRes.json();
        
        if (productData.success && productData.data.length > 0) {
          const sortedBrands = productData.data.map((brand: Brand) => ({
            ...brand,
            models: sortModelsByPremium(brand.models)
          }));
          const finalBrands = sortBrandsByOrder(sortedBrands);
          setBrands(finalBrands);
          setBrandName(finalBrands[0]?.name || "");
          if (finalBrands[0]?.models.length > 0) {
            setModelName(finalBrands[0].models[0].name);
          }
        }
        
        if (coeffData.success && coeffData.data.length > 0) {
          const cond = coeffData.data.filter((c: any) => c.category === 'condition');
          const use = coeffData.data.filter((c: any) => c.category === 'usage');
          const flt = coeffData.data.filter((c: any) => c.category === 'fault');
          if (cond.length) setConditions(sortConditionsByFactor(cond));
          if (use.length) setUsages(sortUsagesByFactor(use));
          if (flt.length) setFaults(sortFaultsByFactor(flt));
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const brand = useMemo(() => brands.find((b) => b.name === brandName), [brands, brandName]);
  const model = useMemo(() => brand?.models.find((m) => m.name === modelName), [brand, modelName]);

  const conditionFactor = conditions.find((c) => c.label === condition)?.factor || 1;
  const usageFactor = usages.find((u) => u.label === usage)?.factor || 1;
  const faultFactor = faults.find((f) => f.label === fault)?.factor || 1;

  const estimate = useMemo(() => {
    if (!model) return 0;
    let basePrice = model.basePrice || 0;
    if (basePrice === 0) {
      let baseFactor = 0.45;
      if (model.releaseYear === 2024) baseFactor = 0.55;
      if (model.releaseYear === 2025) baseFactor = 0.75;
      basePrice = model.originalPrice * baseFactor;
    }
    const accessoriesPrice = model.accessories
      ?.filter((a) => selectedAccessories.includes(a.name))
      .reduce((sum, a) => sum + a.value, 0) || 0;
    return Math.round(basePrice * conditionFactor * usageFactor * faultFactor + accessoriesPrice);
  }, [model, conditionFactor, usageFactor, faultFactor, selectedAccessories]);

  const futurePrices = useMemo(() => ({
    threeMonth: Math.round(estimate * 0.9),
    sixMonth: Math.round(estimate * 0.81),
    nineMonth: Math.round(estimate * 0.73)
  }), [estimate]);

  const steps = [
    { id: "brand" as Step, title: "选择品牌" },
    { id: "model" as Step, title: "选择型号" },
    { id: "condition" as Step, title: "选择成色" },
    { id: "usage" as Step, title: "使用时间" },
    { id: "fault" as Step, title: "功能故障" },
    { id: "accessories" as Step, title: "附件选择" },
    { id: "contact" as Step, title: "联系方式" },
  ];

  const hasAccessories = model?.accessories && model.accessories.length > 0;

  const getNextStep = (currentStepId: Step): Step => {
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    let nextIndex = currentIndex + 1;
    if (steps[nextIndex]?.id === "accessories" && !hasAccessories) nextIndex++;
    return steps[nextIndex]?.id || "contact";
  };

  const nextStep = () => {
    const next = getNextStep(currentStep);
    if (next && next !== currentStep) {
      setCurrentStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowEstimate(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    const currentIdx = steps.findIndex(s => s.id === currentStep);
    let prevIdx = currentIdx - 1;
    while (prevIdx >= 0 && steps[prevIdx].id === "accessories" && !hasAccessories) prevIdx--;
    if (prevIdx >= 0) setCurrentStep(steps[prevIdx].id);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextStep() : prevStep();
    setTouchStart(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const remainingSlots = MAX_IMAGES - uploadedImages.length;
      const filesToAdd = newFiles.slice(0, remainingSlots);
      
      filesToAdd.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages(prev => [...prev, {
            file,
            preview: reader.result as string,
            id: Date.now() + Math.random().toString()
          }]);
        };
        reader.readAsDataURL(file);
      });
      
      if (newFiles.length > remainingSlots) alert(`最多只能上传${MAX_IMAGES}张图片`);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (id: string) => setUploadedImages(prev => prev.filter(img => img.id !== id));

  const submitOrder = async () => {
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请填写正确的手机号码");
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const img of uploadedImages) {
        const formData = new FormData();
        formData.append('image', img.file);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) imageUrls.push(uploadData.url);
      }

      const response = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brandName, model: modelName, phone: phoneNumber,
          condition, usage, fault,
          accessories: JSON.stringify(selectedAccessories),
          estimate: estimate.toString(),
          imageUrl: imageUrls.join(','),
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('提交成功！订单号：' + data.data.orderNo);
        setPhoneNumber("");
        setUploadedImages([]);
        setShowEstimate(false);
        setCurrentStep("brand");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert('提交失败：' + (data.error || '请稍后重试'));
      }
    } catch (error) {
      alert('提交失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReestimate = () => {
    setShowEstimate(false);
    setCurrentStep("brand");
    setSelectedAccessories([]);
    setPhoneNumber("");
    setUploadedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  const visibleSteps = steps.filter(step => !(step.id === "accessories" && !hasAccessories));
  const currentVisibleIndex = visibleSteps.findIndex(s => s.id === currentStep);
  const visibleProgress = ((currentVisibleIndex + 1) / visibleSteps.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 pb-20">
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">3D打印机专业回收</h1>
              <p className="text-xs text-neutral-500">全国首家新消费品专业回收平台</p>
            </div>
            <a href="/?query=true" className="text-sm text-neutral-600 hover:text-black flex items-center gap-1">
              <Search size={16} /> 查询订单
            </a>
          </div>
        </div>
      </div>

      {!showEstimate && (
        <div className="sticky top-[73px] z-40 bg-white border-b border-neutral-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prevStep} className={`p-2 rounded-full transition ${currentVisibleIndex === 0 ? "invisible" : "hover:bg-neutral-100"}`}>
                <ChevronLeft size={20} />
              </button>
              <div className="text-sm text-neutral-500">第 {currentVisibleIndex + 1} / {visibleSteps.length} 步</div>
              <div className="w-9" />
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full bg-black transition-all duration-300 rounded-full" style={{ width: `${visibleProgress}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-4 py-6" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {!showEstimate ? (
          <div className="animate-fadeIn">
            {currentStep !== "contact" && (
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{steps.find(s => s.id === currentStep)?.title}</h2>
                <p className="text-neutral-500 text-sm mt-1">请选择以下选项</p>
              </div>
            )}
            
            {currentStep === "brand" && (
              <div className="space-y-3">
                {brands.map((b) => (
                  <button key={b.name} onClick={() => { setBrandName(b.name); setModelName(b.models[0]?.name || ""); setSelectedAccessories([]); nextStep(); }} className="w-full bg-white rounded-2xl p-6 text-left shadow-sm border-2 border-transparent hover:border-black/20">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xl font-semibold">{b.name}</div><div className="text-sm text-neutral-500 mt-1">{b.models.length} 款机型</div></div>
                      <ArrowRight className="text-neutral-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "model" && (
              <div className="space-y-3">
                {brand?.models.map((m) => (
                  <button key={m.name} onClick={() => { setModelName(m.name); setSelectedAccessories([]); nextStep(); }} className="w-full bg-white rounded-2xl p-5 text-left shadow-sm">
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-lg">{m.name}</div><div className="text-sm text-neutral-500 mt-1">{m.releaseYear}年上市</div></div>
                      <ChevronRight className="text-neutral-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "condition" && (
              <div className="space-y-3">
                {conditions.map((c) => (
                  <button key={c.label} onClick={() => { setCondition(c.label); nextStep(); }} className={`w-full rounded-2xl p-5 text-left ${condition === c.label ? "bg-black text-white" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-lg">{c.label}</div><div className={`text-sm mt-1 ${condition === c.label ? "text-white/70" : "text-neutral-500"}`}>{c.description}</div></div>
                      {condition === c.label && <Check size={24} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "usage" && (
              <div className="space-y-3">
                {usages.map((u) => (
                  <button key={u.label} onClick={() => { setUsage(u.label); nextStep(); }} className={`w-full rounded-2xl p-5 text-left ${usage === u.label ? "bg-black text-white" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-lg">{u.label}</div><div className={`text-sm mt-1 ${usage === u.label ? "text-white/70" : "text-neutral-500"}`}>{u.description}</div></div>
                      {usage === u.label && <Check size={24} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "fault" && (
              <div className="space-y-3">
                {faults.map((f) => (
                  <button key={f.label} onClick={() => { setFault(f.label); nextStep(); }} className={`w-full rounded-2xl p-5 text-left ${fault === f.label ? "bg-black text-white" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-lg">{f.label}</div><div className={`text-sm mt-1 ${fault === f.label ? "text-white/70" : "text-neutral-500"}`}>{f.description}</div></div>
                      {fault === f.label && <Check size={24} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === "accessories" && hasAccessories && (
              <div className="space-y-3">
                {model?.accessories?.map((a) => (
                  <button key={a.name} onClick={() => { setSelectedAccessories(prev => prev.includes(a.name) ? prev.filter(x => x !== a.name) : [...prev, a.name]); }} className={`w-full rounded-2xl p-5 text-left ${selectedAccessories.includes(a.name) ? "bg-black text-white" : "bg-white shadow-sm"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-semibold text-lg">{a.name}</div><div className={`text-sm mt-1 ${selectedAccessories.includes(a.name) ? "text-white/70" : "text-neutral-500"}`}>增值 ¥{a.value}</div></div>
                      {selectedAccessories.includes(a.name) && <Check size={24} />}
                    </div>
                  </button>
                ))}
                <button onClick={nextStep} className="w-full bg-black text-white rounded-2xl py-4 font-semibold mt-4">下一步</button>
              </div>
            )}

            {currentStep === "contact" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-black to-neutral-800 text-white rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div><div className="text-xs opacity-70">当前估价</div><div className="text-3xl font-bold">¥{estimate}</div></div>
                    <div className="text-right"><div className="text-xs opacity-70">{brandName}</div><div className="text-sm font-medium">{modelName}</div></div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <label className="block text-sm font-medium mb-2">手机号码</label>
                  <input type="tel" placeholder="请输入手机号码" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-lg focus:outline-none focus:border-black" />
                  <p className="text-xs text-neutral-500 mt-2">用于接收回收订单通知</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <label className="block text-sm font-medium mb-3">上传设备图片（最多{MAX_IMAGES}张）</label>
                  <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition">
                    <Camera size={40} className="text-neutral-400" />
                    <div className="mt-3 font-medium">点击上传打印机图片</div>
                    <div className="text-sm text-neutral-500 mt-1">支持 JPG / PNG，最多{MAX_IMAGES}张</div>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} multiple />
                  </label>
                  
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-500 mb-2">已上传 {uploadedImages.length}/{MAX_IMAGES} 张：</div>
                      <div className="grid grid-cols-4 gap-2">
                        {uploadedImages.map((img) => (
                          <div key={img.id} className="relative">
                            <img src={img.preview} alt="预览" className="w-full h-24 object-cover rounded-lg border" />
                            <button onClick={() => removeImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={submitOrder} disabled={isSubmitting} className="w-full bg-black text-white rounded-2xl py-5 font-semibold text-lg disabled:opacity-50">
                  {isSubmitting ? "提交中..." : "确认提交"}
                </button>
              </div>
            )}
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
                <div className="flex justify-between"><span className="text-neutral-500">品牌型号</span><span className="font-medium">{brandName} {modelName}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">成色</span><span className="font-medium">{condition}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">使用时间</span><span className="font-medium">{usage}</span></div>
                <div className="flex justify-between"><span className="text-neutral-500">功能故障</span><span className="font-medium">{fault}</span></div>
                {selectedAccessories.length > 0 && (<div className="flex justify-between"><span className="text-neutral-500">附加配件</span><span className="font-medium">{selectedAccessories.join("、")}</span></div>)}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <h3 className="font-semibold mb-4">📉 预估回收价趋势</h3>
              <div className="space-y-4">
                <div><div className="flex justify-between text-sm mb-2"><span>3个月后</span><span className="font-bold">¥{futurePrices.threeMonth}</span></div><div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-black/80 h-2 rounded-full" style={{ width: `${(futurePrices.threeMonth / estimate) * 100}%` }} /></div></div>
                <div><div className="flex justify-between text-sm mb-2"><span>6个月后</span><span className="font-bold">¥{futurePrices.sixMonth}</span></div><div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-black/60 h-2 rounded-full" style={{ width: `${(futurePrices.sixMonth / estimate) * 100}%` }} /></div></div>
                <div><div className="flex justify-between text-sm mb-2"><span>9个月后</span><span className="font-bold">¥{futurePrices.nineMonth}</span></div><div className="w-full bg-gray-200 h-2 rounded-full"><div className="bg-black/40 h-2 rounded-full" style={{ width: `${(futurePrices.nineMonth / estimate) * 100}%` }} /></div></div>
              </div>
              <p className="text-xs text-neutral-400 mt-4 text-center">* 预估价格仅供参考，每3个月预计降价10%</p>
            </div>

            <button onClick={() => { setShowEstimate(false); setCurrentStep("contact"); }} className="w-full bg-black text-white rounded-2xl py-5 font-semibold text-lg">立即回收</button>
            <button onClick={handleReestimate} className="w-full bg-white text-black border-2 border-black rounded-2xl py-4 font-medium">重新估价</button>
          </div>
        )}
      </div>

      <button className="fixed bottom-6 right-4 bg-black text-white p-3 rounded-full shadow-lg hover:scale-105 transition-all z-50">
        <MessageCircle size={24} />
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.3s ease-out; }`}</style>
    </main>
  );
}

// ============================================
// 主入口 - 根据 URL 参数显示不同页面
// ============================================
export default function App() {
  // 检查是否是后台页面
  const isAdmin = window.location.search.includes('admin=true') || window.location.hash.includes('admin')
  
  // 检查是否是订单查询页面
  const isQuery = window.location.search.includes('query=true') || window.location.hash.includes('query')
  
  console.log('当前路由:', { isAdmin, isQuery, url: window.location.href })
  
  if (isAdmin) {
    return <AdminPage />
  }
  
  if (isQuery) {
    return <OrderQueryPage />
  }
  
  return <RecyclePage />
}