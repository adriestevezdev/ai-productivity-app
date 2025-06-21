import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded"></div>
            <h1 className="text-2xl font-bold text-white">productiv.ai</h1>
          </div>
          <p className="text-[#A0A0A0]">Create your account to get started</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-[#1A1A1C] border border-white/8",
              headerTitle: "text-white",
              headerSubtitle: "text-[#A0A0A0]",
              socialButtonsBlockButton: "bg-[#242426] border-white/8 text-white hover:bg-[#2A2A2C]",
              socialButtonsBlockButtonText: "text-white",
              dividerLine: "bg-white/8",
              dividerText: "text-[#A0A0A0]",
              formFieldLabel: "text-white",
              formFieldInput: "bg-[#242426] border-white/8 text-white",
              footerActionText: "text-[#A0A0A0]",
              footerActionLink: "text-[#4ECDC4] hover:text-[#45B7B8]",
              formButtonPrimary: "bg-[#4ECDC4] hover:bg-[#45B7B8] text-black",
              identityPreviewText: "text-white",
              identityPreviewEditButton: "text-[#4ECDC4]"
            }
          }}
        />
      </div>
    </div>
  );
}