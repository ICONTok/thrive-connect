
import { useAuth } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { MenteeDashboard } from "@/components/dashboard/MenteeDashboard";
import { useMentorship } from "@/hooks/use-mentorship";

const Index = () => {
  const { user } = useAuth();
  const { currentProfile } = useMentorship(user?.id);

  const renderDashboard = () => {
    if (!currentProfile) {
      console.log("No current profile found");
      return null;
    }

    // Log the full profile for debugging
    console.log("Full profile data:", currentProfile);

    // Ensure we're working with lowercase values
    const userType = currentProfile.user_type?.toLowerCase() as 'admin' | 'mentor' | 'mentee' | null;

    // Add strict type checking
    if (!userType) {
      console.error("User type is not set!");
      return null;
    }

    // Add debug logging
    console.log("Rendering dashboard for user type:", userType);

    // Strict type checking for each case
    if (userType === 'admin') {
      return <AdminDashboard />;
    }
    if (userType === 'mentor') {
      return <MentorDashboard />;
    }
    return <MenteeDashboard />;
  };

  return (
    <div className="w-full max-w-full">
      {renderDashboard()}
    </div>
  );
};

export default Index;
