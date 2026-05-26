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
} from "lucide-react";

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

const BRANDS: Brand[] = [
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

type Step = "brand" | "model" | "condition" | "usage" | "fault" | "accessories" | "contact";

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>("brand");
  const [brandName, setBrandName] = useState("拓竹");
  const [modelName, setModelName] = useState("X1 Carbon");
  const [condition, setCondition] = useState("95新");
  const [usage, setUsage] = useState("100小时内");
  const [fault, setFault] = useState("无故障");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState<number>(0);

  const brand = useMemo(() => BRANDS.find((b) => b.name === brandName)!, [brandName]);
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
      setUploadedImage(e.target.files[0]);
    }
  };

  const submitOrder = async () => {
    // 验证手机号
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请填写正确的手机号码");
      return;
    }

    setIsSubmitting(true);

    try {
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
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('提交成功！订单号：' + data.data.orderNo);
        // 重置表单
        setPhoneNumber("");
        setUploadedImage(null);
        setShowEstimate(false);
        setCurrentStep("brand");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert('提交失败：' + (data.error || '请稍后重试'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "brand":
        return (
          <div className="space-y-3">
            {BRANDS.map((b) => (
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
                className="w-full bg-white rounded-2xl p-5 text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{m.name}</div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {m.releaseYear}年上市 · 原价 ¥{m.originalPrice}
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
              <label className="border-2 border-dashed border-neutral-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-black transition">
                <Upload size={40} className="text-neutral-400" />
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
              {uploadedImage && (
                <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                  <Check size={16} /> 已上传：{uploadedImage.name}
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
      {/* 顶部进度条 */}
      {!showEstimate && (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevStep}
                className={`p-2 rounded-full transition ${currentIndex === 0 ? "opacity-0 pointer-events-none" : "hover:bg-neutral-100"}`}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="text-center">
                <div className="text-sm font-medium">{steps[currentIndex].title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  第 {currentIndex + 1} / {steps.length} 步
                </div>
              </div>
              <div className="w-10" />
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 估价卡片（固定在顶部） */}
      {!showEstimate && currentStep !== "contact" && (
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

      {/* 主内容区域 */}
      <div
        className="max-w-md mx-auto px-4 py-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!showEstimate ? (
          <>
            {/* 当前步骤卡片 */}
            <div className="animate-fadeIn">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{steps[currentIndex].title}</h2>
                <p className="text-neutral-500 text-sm mt-1">请选择以下选项</p>
              </div>
              {renderStep()}
            </div>
          </>
        ) : (
          /* 最终估价页面 */
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

      {/* 客服悬浮按钮 */}
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