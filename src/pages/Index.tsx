
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Connect, Learn, Grow Together
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Welcome to our mentorship platform where experienced professionals and eager learners come together to foster growth and knowledge sharing.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/mentor-signup")}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Become a Mentor
            </Button>
            <Button
              onClick={() => navigate("/mentee-signup")}
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Find a Mentor
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Expert Guidance</h3>
            <p className="text-gray-600">
              Connect with industry professionals who can guide you through your career journey.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Personalized Matching</h3>
            <p className="text-gray-600">
              Find the perfect mentor based on your goals, industry, and interests.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">Flexible Learning</h3>
            <p className="text-gray-600">
              Schedule sessions at your convenience and learn at your own pace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
