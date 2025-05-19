import Chat from "@/components/ui/Chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center">CPO Assistant</h1>
        <Chat />
      </div>
    </main>
  );
}
