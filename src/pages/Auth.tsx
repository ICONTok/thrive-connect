
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Welcome</h1>
          <p className="text-center text-gray-500">Sign in to continue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
