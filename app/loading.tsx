import { MinusIcon } from "lucide-react";

const Loading = () => {
  return (
    <div className='w-full min-h-screen flex items-center justify-center'>
      <MinusIcon className='animate-spin mr-3' /> Please wait...
    </div>
  );
};

export default Loading;
