
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  user_type: 'mentor' | 'mentee' | 'admin';
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  mentee: Profile;
  mentor: Profile;
}
