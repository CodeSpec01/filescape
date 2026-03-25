import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-surface">
      {/* Background glow to match your branding */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] pointer-events-none"></div>
      
      <div className="z-10 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold tracking-widest text-primary font-headline">FILESCAPE SECURE LOGIN</h1>
        {/* The Clerk Component */}
        <SignIn />
      </div>
    </div>
  );
}