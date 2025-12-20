import Link from 'next/link';

export default function Home() {
    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
            <div className="relative z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col text-center">
                <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">THE ENIGMA</span>
                    <br />
                    <span className="text-white drop-shadow-lg">ENGINE</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    Unlock the mystery. Manage your escape room business with precision,
                    style, and advanced analytics.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full">
                    <Link
                        href="/login"
                        className="group relative px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(147,51,234,0.5)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8)] overflow-hidden"
                    >
                        <span className="relative z-10">Enter the Engine</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>

                    <Link
                        href="/rooms"
                        className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl text-white font-bold rounded-full transition-all hover:bg-white/20 hover:scale-105"
                    >
                        View Rooms
                    </Link>
                </div>
            </div>

            <div className="absolute bottom-10 text-slate-500 text-sm z-10">
                Powered by Next.js & Flask
            </div>
        </main>
    );
}
