
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  user_type: 'admin' | 'mentor' | 'mentee' | null;
  is_active: boolean;
  role: 'admin' | 'mentor' | 'mentee';
  expertise?: string | null;
  interests?: string | null;
  goals?: string | null;
  years_of_experience?: number | null;
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  mentee: Profile;
  mentor: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  assigned_by: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface SharedFile {
  id: string;
  filename: string;
  file_url: string;
  shared_by: string;
  shared_with: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  categories?: string;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  author: {
    full_name: string;
  };
}
