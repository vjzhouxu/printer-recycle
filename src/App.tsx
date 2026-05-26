"use client";

import { useMemo, useState } from "react";
import { Camera, MessageCircle } from "lucide-react";

/* =========================
   数据（完全保留你的）
========================= */

const BRANDS = [
  {
    name: "拓竹",
    models: [
      { name: "H2D", releaseYear: 2025, originalPrice: 2199 },
      { name: "X1E", releaseYear: 2024, originalPrice: 1799 },
      { name: "X1 Carbon", releaseYear: 2022, originalPrice: 1199 },
      { name: "P2S", releaseYear: 2025, originalPrice: 1499 },
      { name: "P1S", releaseYear: 2023, originalPrice: 699 },
      { name: "P1P", releaseYear: 2022, originalPrice: 599 },
      { name: "A1", releaseYear: 2024, originalPrice: 399 },
      { name: "A1 Mini", releaseYear: 2024, originalPrice: 299 },
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
  { label: "99新", factor: 1.1 },
  { label: "95新", factor: 1 },
  { label: "9成新", factor: 0.9 },
  { label: "8成新", factor: 0.8 },
  { label: "7成新", factor: 0.7 },
];

const USAGE = [
  { label: "100小时内", factor: 1 },
  { label: "100-300小时", factor: 0.95 },
  { label: "301-600小时", factor: 0.88 },
  { label: "600小时以上", factor: 0.78 },
];

const FAULT = [
  { label: "无故障", factor: 1 },
  { label: "喷头异常", factor: 0.88 },
  { label: "热床异常", factor: 0.82 },
  { label: "主板异常", factor: 0.7 },
  { label: "无法开机", factor: 0.55 },
];

/* =========================
   主页面
========================= */

export default function App() {
  const [step, setStep] = useState(1);

  const [brand, setBrand] = useState("拓竹");
  const [model, setModel] = useState("X1 Carbon");
  const [condition, setCondition] = useState("95新");
  const [usage, setUsage] = useState("100小时内");
  const [fault, setFault] = useState("无故障");

  const currentBrand = BRANDS.find((b) => b.name === brand)!;
  const currentModel = currentBrand.models.find((m) => m.name === model)!;

  const estimate = useMemo(() => {
    let base = currentModel.originalPrice;

    const conditionFactor =
      CONDITIONS.find((c) => c.label === condition)?.factor || 1;
    const usageFactor =
      USAGE.find((u) => u.label === usage)?.factor || 1;
    const faultFactor =
      FAULT.find((f) => f.label === fault)?.factor || 1;

    let yearFactor = 0.5;
    if (currentModel.releaseYear === 2024) yearFactor = 0.6;
    if (currentModel.releaseYear === 2025) yearFactor = 0.75;

    return Math.round(
      base * yearFactor * conditionFactor * usageFactor * faultFactor
    );
  }, [model, condition, usage, fault]);

  /* =========================
     UI组件
  ========================= */

  const Progress = () => (
    <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
      <div
        className="bg-black h-2 rounded-full transition-all"
        style={{ width: `${(step / 4) * 100}%` }}
      />
    </div>
  );

  /* =========================
     页面结构
  ========================= */

  return (
    <main className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">

      <h1 className="text-2xl font-bold mb-2">3D打印机回收</h1>
      <p className="text-gray-500 mb-4">爱回收风格在线估价</p>

      <Progress />

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <h2 className="font-bold mb-3">选择品牌</h2>
          <div className="grid grid-cols-3 gap-3">
            {BRANDS.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  setBrand(b.name);
                  setModel(b.models[0].name);
                  setStep(2);
                }}
                className="p-3 rounded-xl bg-white border"
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <h2 className="font-bold mb-3">选择型号</h2>
          <div className="space-y-3">
            {currentBrand.models.map((m) => (
              <div
                key={m.name}
                onClick={() => {
                  setModel(m.name);
                  setStep(3);
                }}
                className="p-4 bg-white border rounded-xl active:scale-95"
              >
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-gray-500">
                  {m.releaseYear}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div>
          <h2 className="font-bold mb-3">成色</h2>
          <div className="grid grid-cols-2 gap-3">
            {CONDITIONS.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  setCondition(c.label);
                  setStep(4);
                }}
                className="p-3 bg-white border rounded-xl"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div>
          <h2 className="font-bold mb-3">使用情况</h2>
          <div className="grid grid-cols-2 gap-3">
            {USAGE.map((u) => (
              <button
                key={u.label}
                onClick={() => {
                  setUsage(u.label);
                  setStep(5);
                }}
                className="p-3 bg-white border rounded-xl"
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5 RESULT */}
      {step === 5 && (
        <div className="text-center mt-10">

          <div className="text-gray-500">预估回收价</div>

          <div className="text-6xl font-bold mt-2">
            ¥{estimate}
          </div>

          <button
            onClick={() => setStep(1)}
            className="mt-6 px-4 py-2 bg-black text-white rounded-xl"
          >
            重新估价
          </button>

          {/* 在线客服 */}
          <div className="mt-10 bg-white p-4 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MessageCircle />
              <div>
                <div className="font-bold">在线客服</div>
                <div className="text-sm text-gray-500">
                  人工协助估价
                </div>
              </div>
            </div>

            <button className="bg-black text-white px-4 py-2 rounded-xl">
              联系
            </button>
          </div>
        </div>
      )}

    </main>
  );
}