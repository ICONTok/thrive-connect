
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Welcome to Mentorship</h1>
          <p className="text-center text-gray-500">Connect with mentors and grow together</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => navigate("/auth/login")} 
            className="w-full"
            variant="default"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/auth/register")} 
            className="w-full"
            variant="outline"
          >
            Create Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
