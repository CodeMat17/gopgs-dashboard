import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className='flex min-h-[60vh] w-full items-center justify-center gap-3 text-sm text-muted-foreground'>
      <Loader2 className='size-5 animate-spin text-primary' /> Loading…
    </div>
  );
};

export default Loading;
