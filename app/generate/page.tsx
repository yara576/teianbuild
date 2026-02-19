import Link from "next/link";
import ProposalForm from "@/components/proposal/ProposalForm";

export default function GeneratePage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="mb-8 w-full max-w-2xl">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← トップに戻る
        </Link>
      </div>
      <ProposalForm />
    </div>
  );
}
