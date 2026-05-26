"use client";

import { useMemo, useState, useRef } from "react";
import {
  Camera,
  ChevronRight,
  MessageCircle,
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
        accessories: [
          { name: "AMS Pro", value: 350 },
        ],
      },

      {
        name: "X1E",
        releaseYear: 2024,
        originalPrice: 1799,
        accessories: [
          { name: "AMS", value: 180 },
        ],
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
        accessories: [
          { name: "AMS 2", value: 240 },
        ],
      },

      {
        name: "P1S",
        releaseYear: 2023,
        originalPrice: 699,
        accessories: [
          { name: "AMS", value: 180 },
        ],
      },

      {
        name: "P1P",
        releaseYear: 2022,
        originalPrice: 599,
        accessories: [
          { name: "AMS", value: 180 },
        ],
      },

      {
        name: "A1",
        releaseYear: 2024,
        originalPrice: 399,
        accessories: [
          { name: "AMS Lite", value: 120 },
        ],
      },

      {
        name: "A1 Mini",
        releaseYear: 2024,
        originalPrice: 299,
        accessories: [
          { name: "AMS Lite", value: 120 },
        ],
      },
    ],
  },

  {
    name: "创想三维",
    models: [
      {
        name: "K2 Plus",
        releaseYear: 2025,
        originalPrice: 1499,
      },

      {
        name: "K1C",
        releaseYear: 2024,
        originalPrice: 699,
      },

      {
        name: "K1 Max",
        releaseYear: 2023,
        originalPrice: 899,
      },

      {
        name: "K1",
        releaseYear: 2023,
        originalPrice: 599,
      },

      {
        name: "Ender-3 V3",
        releaseYear: 2024,
        originalPrice: 399,
      },

      {
        name: "Ender-3 V3 Plus",
        releaseYear: 2024,
        originalPrice: 499,
      },
    ],
  },

  {
    name: "闪铸",
    models: [
      {
        name: "Adventurer 5M",
        releaseYear: 2024,
        originalPrice: 499,
      },

      {
        name: "Adventurer 5M Pro",
        releaseYear: 2024,
        originalPrice: 699,
      },

      {
        name: "Creator Pro 2",
        releaseYear: 2022,
        originalPrice: 649,
      },

      {
        name: "Guider 3",
        releaseYear: 2023,
        originalPrice: 1299,
      },
    ],
  },
];

const CONDITIONS = [
  { label: "99新", factor: 1.1 },
  { label: "95新", factor: 1 },
  { label: "9成新", factor: 0.9 },
  { label: "8成新", factor: 0.8 },
  { label: "7成新", factor: 0.7 },
];

const USAGE_OPTIONS = [
  { label: "100小时内", factor: 1 },
  { label: "100-300小时", factor: 0.95 },
  { label: "301-600小时", factor: 0.88 },
  { label: "601小时以上", factor: 0.78 },
];

const FAULT_OPTIONS = [
  { label: "无故障", factor: 1 },
  { label: "喷头异常", factor: 0.88 },
  { label: "热床异常", factor: 0.82 },
  { label: "主板异常", factor: 0.7 },
  { label: "无法开机", factor: 0.55 },
];

export default function Home() {
  const [brandName, setBrandName] =
    useState("拓竹");

  const [modelName, setModelName] =
    useState("X1 Carbon");

  const [condition, setCondition] =
    useState("95新");

  const [usage, setUsage] =
    useState("100小时内");

  const [fault, setFault] =
    useState("无故障");

  const [selectedAccessories, setSelectedAccessories] =
    useState<string[]>([]);
    
  const [phoneNumber, setPhoneNumber] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const brand = useMemo(
    () => BRANDS.find((b) => b.name === brandName)!,
    [brandName]
  );

  const model = useMemo(
    () => brand.models.find((m) => m.name === modelName)!,
    [brand, modelName]
  );

  const conditionFactor =
    CONDITIONS.find(
      (c) => c.label === condition
    )?.factor || 1;

  const usageFactor =
    USAGE_OPTIONS.find(
      (u) => u.label === usage
    )?.factor || 1;

  const faultFactor =
    FAULT_OPTIONS.find(
      (f) => f.label === fault
    )?.factor || 1;

  const estimate = useMemo(() => {
    let baseFactor = 0.45;

    if (model.releaseYear === 2024) {
      baseFactor = 0.55;
    }

    if (model.releaseYear === 2025) {
      baseFactor = 0.75;
    }

    const basePrice =
      model.originalPrice * baseFactor;

    const accessoriesPrice =
      model.accessories
        ?.filter((a) =>
          selectedAccessories.includes(a.name)
        )
        .reduce((sum, a) => {
          let accessoryFactor = 0.45;

          if (model.releaseYear === 2024) {
            accessoryFactor = 0.55;
          }

          if (model.releaseYear === 2025) {
            accessoryFactor = 0.75;
          }

          return (
            sum + a.value * accessoryFactor
          );
        }, 0) || 0;

    return Math.round(
      basePrice *
        conditionFactor *
        usageFactor *
        faultFactor +
        accessoriesPrice
    );
  }, [
    model,
    conditionFactor,
    usageFactor,
    faultFactor,
    selectedAccessories,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const submitOrder = async () => {
    // Validate phone number
    if (!phoneNumber || !/^1[3-9]\d{9}$/.test(phoneNumber)) {
      alert("请填写正确的手机号码");
      return;
    }

    // Validate image upload
    if (!uploadedImage) {
      alert("请上传设备图片");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('brand', brandName);
      formData.append('model', modelName);
      formData.append('phone', phoneNumber);
      formData.append('image', uploadedImage);
      formData.append('condition', condition);
      formData.append('usage', usage);
      formData.append('fault', fault);
      formData.append('accessories', JSON.stringify(selectedAccessories));
      formData.append('estimate', estimate.toString());

      const res = await fetch('/api/order', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        alert('提交成功！订单号：' + (data?.data?.[0]?.order_no || '已生成'));
        // Reset form after successful submission
        setPhoneNumber("");
        setUploadedImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        alert('提交失败：' + (data?.message || '请稍后重试'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 pb-40">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">
            3D打印机回收
          </h1>

          <p className="text-sm text-neutral-500 mt-1">
            在线估价 · 极速回收
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Brand */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            品牌
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {BRANDS.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  setBrandName(b.name);
                  setModelName(b.models[0].name);
                  setSelectedAccessories([]);
                }}
                className={`rounded-2xl border px-3 py-3 text-sm font-medium transition ${
                  brandName === b.name
                    ? "bg-black text-white border-black"
                    : "bg-white border-neutral-200"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </section>

        {/* Model */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              型号
            </h2>

            <span className="text-xs text-neutral-400">
              共 {brand.models.length} 款
            </span>
          </div>

          <div className="space-y-3">
            {brand.models.map((m) => (
              <button
                key={m.name}
                onClick={() => {
                  setModelName(m.name);
                  setSelectedAccessories([]);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  modelName === m.name
                    ? "border-black bg-neutral-100"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {m.name}
                    </div>

                    <div className="text-sm text-neutral-500 mt-1">
                      {m.releaseYear} 上市
                    </div>
                  </div>

                  <ChevronRight size={18} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Condition */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            成色
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.label}
                onClick={() => setCondition(c.label)}
                className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                  condition === c.label
                    ? "bg-black text-white border-black"
                    : "bg-white border-neutral-200"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Usage */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            使用时间
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {USAGE_OPTIONS.map((u) => (
              <button
                key={u.label}
                onClick={() => setUsage(u.label)}
                className={`rounded-2xl border px-4 py-4 text-sm font-medium transition ${
                  usage === u.label
                    ? "bg-black text-white border-black"
                    : "bg-white border-neutral-200"
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
        </section>

        {/* Fault */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            功能故障
          </h2>

          <div className="space-y-3">
            {FAULT_OPTIONS.map((f) => (
              <button
                key={f.label}
                onClick={() => setFault(f.label)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                  fault === f.label
                    ? "bg-black text-white border-black"
                    : "bg-white border-neutral-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {/* Accessories */}
        {model.accessories && (
          <section className="bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="font-semibold mb-4 text-lg">
              附件
            </h2>

            <div className="space-y-3">
              {model.accessories.map((a) => (
                <button
                  key={a.name}
                  onClick={() => {
                    setSelectedAccessories(
                      (prev) =>
                        prev.includes(a.name)
                          ? prev.filter(
                              (x) => x !== a.name
                            )
                          : [...prev, a.name]
                    );
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedAccessories.includes(
                      a.name
                    )
                      ? "border-black bg-neutral-100"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{a.name}</span>

                    <span className="text-sm text-neutral-500">
                      附件增值
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Phone Number Input - Added */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            联系方式
          </h2>
          <input
            type="tel"
            placeholder="请输入手机号码"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 px-4 py-4 text-base focus:outline-none focus:border-black transition"
          />
          <p className="text-xs text-neutral-500 mt-2">
            用于接收回收订单通知
          </p>
        </section>

        {/* Upload */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4 text-lg">
            上传设备图片
          </h2>

          <label className="border-2 border-dashed border-neutral-300 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer">
            <Camera size={36} />

            <div className="mt-4 font-medium">
              {uploadedImage ? uploadedImage.name : "上传打印机图片"}
            </div>

            <div className="text-sm text-neutral-500 mt-2">
              支持 JPG / PNG
            </div>

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
            <div className="mt-3 text-sm text-green-600">
              ✓ 已上传：{uploadedImage.name}
            </div>
          )}
        </section>

        {/* Estimate */}
        <section className="bg-black text-white rounded-3xl p-6">
          <div className="text-sm opacity-70 mb-2">
            当前最高回收价
          </div>

          <div className="text-5xl font-bold">
            ¥{estimate}
          </div>

          {/* Trend */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm opacity-70">
                预计掉价趋势
              </span>
            </div>

            <div className="space-y-5">
              {/* current */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>当前</span>

                  <span>¥{estimate}</span>
                </div>

                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-3 rounded-full"
                    style={{
                      width: "100%",
                    }}
                  />
                </div>
              </div>

              {/* 3 month */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>3个月后</span>

                  <span>
                    ¥
                    {Math.round(
                      estimate * 0.92
                    )}
                  </span>
                </div>

                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-white/80 h-3 rounded-full"
                    style={{
                      width: "92%",
                    }}
                  />
                </div>
              </div>

              {/* 6 month */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>6个月后</span>

                  <span>
                    ¥
                    {Math.round(
                      estimate * 0.85
                    )}
                  </span>
                </div>

                <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-white/60 h-3 rounded-full"
                    style={{
                      width: "85%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-sm opacity-70">
            最终价格以人工检测为准
          </div>
        </section>

        {/* Online Service */}
        <section className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-black text-white rounded-2xl p-3">
                <MessageCircle size={22} />
              </div>

              <div>
                <div className="font-semibold">
                  在线客服
                </div>

                <div className="text-sm text-neutral-500">
                  人工协助估价
                </div>
              </div>
            </div>

            <button className="bg-black text-white px-5 py-3 rounded-2xl text-sm">
              联系客服
            </button>
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4 backdrop-blur-xl">
        <div className="max-w-md mx-auto">
          <button 
            onClick={submitOrder}
            disabled={isSubmitting}
            className={`w-full bg-black text-white py-4 rounded-2xl font-semibold text-lg transition ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? '提交中...' : '提交回收'}
          </button>
        </div>
      </div>
    </main>
  );
}