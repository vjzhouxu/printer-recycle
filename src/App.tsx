import { useMemo, useState } from "react";
import { Camera, ChevronRight, MessageCircle } from "lucide-react";

type Accessory = { name: string; value: number };

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
      { name: "H2D", releaseYear: 2025, originalPrice: 2199, accessories: [{ name: "AMS Pro", value: 350 }] },
      { name: "X1E", releaseYear: 2024, originalPrice: 1799, accessories: [{ name: "AMS", value: 180 }] },
      { name: "X1 Carbon", releaseYear: 2022, originalPrice: 1199, accessories: [{ name: "AMS", value: 180 }] },
      { name: "P2S", releaseYear: 2025, originalPrice: 1499, accessories: [{ name: "AMS 2", value: 240 }] },
      { name: "P1S", releaseYear: 2023, originalPrice: 699, accessories: [{ name: "AMS", value: 180 }] },
      { name: "P1P", releaseYear: 2022, originalPrice: 599, accessories: [{ name: "AMS", value: 180 }] },
      { name: "A1", releaseYear: 2024, originalPrice: 399, accessories: [{ name: "AMS Lite", value: 120 }] },
      { name: "A1 Mini", releaseYear: 2024, originalPrice: 299, accessories: [{ name: "AMS Lite", value: 120 }] },
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

export default function App() {
  const [brand, setBrand] = useState("拓竹");
  const [model, setModel] = useState("X1 Carbon");
  const [condition, setCondition] = useState("95新");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  const currentBrand = useMemo(
    () => BRANDS.find((b) => b.name === brand)!,
    [brand]
  );

  const currentModel = useMemo(
    () => currentBrand.models.find((m) => m.name === model)!,
    [currentBrand, model]
  );

  const estimate = useMemo(() => {
    const base = currentModel.originalPrice * 0.5;

    const conditionFactor =
      CONDITIONS.find((c) => c.label === condition)?.factor || 1;

    const acc = currentModel.accessories
      ?.filter((a) => selectedAccessories.includes(a.name))
      .reduce((sum, a) => sum + a.value * 0.5, 0) || 0;

    return Math.round(base * conditionFactor + acc);
  }, [currentModel, condition, selectedAccessories]);

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* 顶部 */}
      <div className="bg-white p-4 shadow">
        <h1 className="text-xl font-bold">3D打印机回收</h1>
        <p className="text-gray-500 text-sm">快速估价 · 在线回收</p>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">

        {/* 品牌 */}
        <Card title="品牌">
          <div className="grid grid-cols-3 gap-2">
            {BRANDS.map((b) => (
              <Btn key={b.name} active={brand === b.name} onClick={() => setBrand(b.name)}>
                {b.name}
              </Btn>
            ))}
          </div>
        </Card>

        {/* 型号 */}
        <Card title="型号">
          {currentBrand.models.map((m) => (
            <div
              key={m.name}
              onClick={() => setModel(m.name)}
              className={`p-3 border rounded-xl mb-2 flex justify-between items-center ${
                model === m.name ? "border-black bg-white" : "bg-white"
              }`}
            >
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-500">{m.releaseYear}</div>
              </div>
              <ChevronRight />
            </div>
          ))}
        </Card>

        {/* 成色 */}
        <Card title="成色">
          <div className="grid grid-cols-3 gap-2">
            {CONDITIONS.map((c) => (
              <Btn key={c.label} active={condition === c.label} onClick={() => setCondition(c.label)}>
                {c.label}
              </Btn>
            ))}
          </div>
        </Card>

        {/* 附件 */}
        {currentModel.accessories && (
          <Card title="附件">
            {currentModel.accessories.map((a) => (
              <div
                key={a.name}
                onClick={() =>
                  setSelectedAccessories((prev) =>
                    prev.includes(a.name)
                      ? prev.filter((x) => x !== a.name)
                      : [...prev, a.name]
                  )
                }
                className="p-3 border rounded-xl mb-2"
              >
                {a.name}
              </div>
            ))}
          </Card>
        )}

        {/* 价格 */}
        <div className="bg-black text-white p-5 rounded-2xl">
          <div className="text-sm opacity-70">预计回收价</div>
          <div className="text-4xl font-bold">¥{estimate}</div>
        </div>

        {/* 在线客服（完整保留） */}
        <div className="bg-white p-4 rounded-2xl flex justify-between items-center shadow">
          <div className="flex items-center gap-3">
            <MessageCircle />
            <div>
              <div className="font-bold">在线客服</div>
              <div className="text-sm text-gray-500">人工估价支持</div>
            </div>
          </div>

          <button className="bg-black text-white px-4 py-2 rounded-xl">
            联系客服
          </button>
        </div>

      </div>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow">
      <div className="font-bold mb-3">{title}</div>
      {children}
    </div>
  );
}

function Btn({ children, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-sm ${
        active ? "bg-black text-white" : "bg-white"
      }`}
    >
      {children}
    </button>
  );
}