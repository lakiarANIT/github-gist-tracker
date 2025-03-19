import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-4xl font-bold text-blue-500">Tailwind CSS Works!</h1>
      </div>
      <h1 className="text-color-blue size-1.2">To add navbar</h1>
      <h1>To add body</h1>
      <h1>To add Footer</h1>
    </div>
  );
}
