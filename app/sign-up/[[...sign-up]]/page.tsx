import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-surface">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary/10 blur-[100px] pointer-events-none"></div>
      
      <div className="z-10 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold tracking-widest text-primary font-headline">JOIN FILESCAPE</h1>
        <SignUp />
      </div>
    </div>
  );
}