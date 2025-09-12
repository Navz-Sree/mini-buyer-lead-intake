import Image from "next/image";
import Link from "next/link";

const features = [
	{
		icon: "/file.svg",
		title: "Import/Export CSV",
		desc: "Easily migrate your leads in and out.",
	},
	{
		icon: "/globe.svg",
		title: "Search & Filter",
		desc: "Quickly find buyers with powerful filters.",
	},
	{
		icon: "/window.svg",
		title: "Edit & Track",
		desc: "Edit details and view change history.",
	},
	{
		icon: "/vercel.svg",
		title: "Bulk Actions",
		desc: "Update statuses and manage leads efficiently.",
	},
];

export default function Home() {
	return (
		<div className="font-sans flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-black dark:via-gray-900 dark:to-gray-950 p-8">
			<main className="flex flex-col gap-8 items-center w-full max-w-2xl">
				<Image
					className="dark:invert"
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<h1 className="text-4xl font-extrabold mb-2 text-center tracking-tight">
					Mini Buyer Lead Intake
				</h1>
				<p className="text-lg text-gray-700 dark:text-gray-300 mb-4 text-center max-w-xl">
					Welcome! This is a modern demo app for managing buyer leads. Add,
					search, import/export, and edit buyers with ease.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
					{features.map((f) => (
						<div
							key={f.title}
							className="flex items-start gap-3 bg-white/80 dark:bg-gray-900/60 rounded-lg shadow p-4"
						>
							<Image
								src={f.icon}
								alt=""
								width={28}
								height={28}
								className="mt-1 dark:invert"
							/>
							<div>
								<div className="font-semibold text-base mb-1">
									{f.title}
								</div>
								<div className="text-sm text-gray-600 dark:text-gray-400">
									{f.desc}
								</div>
							</div>
						</div>
					))}
				</div>
				<Link
					href="/buyers"
					className="rounded-full bg-blue-600 text-white px-8 py-3 text-lg font-semibold shadow hover:bg-blue-700 transition mt-4"
				>
					View Buyers
				</Link>
				<div className="text-xs text-gray-400 mt-2 text-center max-w-xs">
					Tip: You can import a CSV of buyers, bulk update statuses, and undo
					imports. Try it out!
				</div>
			</main>
			<footer className="mt-16 text-gray-400 text-xs">
				&copy; {new Date().getFullYear()} Buyer Lead Intake Demo
			</footer>
		</div>
	);
}
