import { MadeWithDyad } from "@/components/made-with-dyad";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Start building your amazing project here!
        </p>
        <Link
          to="/admin"
          className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Go to Admin Dashboard
        </Link>
      </div>
      <div className="absolute bottom-0">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;