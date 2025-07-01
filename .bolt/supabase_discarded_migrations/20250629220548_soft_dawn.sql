/*
  # Community Features Migration

  1. New Tables
    - `discussions` - For community forum discussions
    - `discussion_replies` - For replies to discussions
    - `discussion_likes` - For tracking likes on discussions and replies
    - `events` - For community events
    - `event_attendees` - For tracking event attendance
    - `notifications` - For user notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  views integer DEFAULT 0
);

-- Create discussion_replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES discussions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create discussion_likes table
CREATE TABLE IF NOT EXISTS discussion_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  discussion_id uuid REFERENCES discussions(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE,
  is_like boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT discussion_or_reply_check CHECK (
    (discussion_id IS NOT NULL AND reply_id IS NULL) OR
    (discussion_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, discussion_id, reply_id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_virtual boolean DEFAULT true,
  location text,
  meeting_link text,
  max_attendees integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'attending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for discussions
CREATE POLICY "Anyone can view discussions"
  ON discussions
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON discussions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for discussion_replies
CREATE POLICY "Anyone can view discussion replies"
  ON discussion_replies
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create discussion replies"
  ON discussion_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussion replies"
  ON discussion_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussion replies"
  ON discussion_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for discussion_likes
CREATE POLICY "Anyone can view discussion likes"
  ON discussion_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create and update their own likes"
  ON discussion_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON discussion_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for events
CREATE POLICY "Anyone can view events"
  ON events
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update their own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Users can delete their own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Create policies for event_attendees
CREATE POLICY "Anyone can view event attendees"
  ON event_attendees
  FOR SELECT
  USING (true);

CREATE POLICY "Users can register for events"
  ON event_attendees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
  ON event_attendees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own attendance"
  ON event_attendees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_action_url text DEFAULT NULL,
  notification_metadata jsonb DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  ) VALUES (
    user_id,
    notification_type,
    notification_title,
    notification_message,
    notification_action_url,
    notification_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify discussion author when someone replies
CREATE OR REPLACE FUNCTION notify_discussion_reply()
RETURNS TRIGGER AS $$
DECLARE
  discussion_record discussions;
  discussion_title text;
  author_id uuid;
BEGIN
  -- Get the discussion details
  SELECT * INTO discussion_record
  FROM discussions
  WHERE id = NEW.discussion_id;
  
  -- Only notify if the reply author is different from the discussion author
  IF discussion_record.user_id != NEW.user_id THEN
    -- Create notification
    PERFORM create_notification(
      discussion_record.user_id,
      'discussion_reply',
      'New Reply to Your Discussion',
      'Someone replied to your discussion: ' || discussion_record.title,
      '/community?discussion=' || discussion_record.id,
      jsonb_build_object(
        'discussion_id', discussion_record.id,
        'reply_id', NEW.id,
        'reply_author_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for discussion reply notifications
CREATE TRIGGER on_discussion_reply
  AFTER INSERT ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION notify_discussion_reply();

-- Create function to notify users when they receive likes
CREATE OR REPLACE FUNCTION notify_content_like()
RETURNS TRIGGER AS $$
DECLARE
  content_author_id uuid;
  content_title text;
  notification_type text;
  notification_title text;
  notification_message text;
  notification_url text;
BEGIN
  -- Only create notification if it's a like (not a dislike)
  IF NOT NEW.is_like THEN
    RETURN NEW;
  END IF;
  
  -- Determine if this is a discussion like or reply like
  IF NEW.discussion_id IS NOT NULL THEN
    -- Get discussion author
    SELECT user_id, title INTO content_author_id, content_title
    FROM discussions
    WHERE id = NEW.discussion_id;
    
    notification_type := 'discussion_like';
    notification_title := 'Someone liked your discussion';
    notification_message := 'Your discussion "' || content_title || '" received a like';
    notification_url := '/community?discussion=' || NEW.discussion_id;
  ELSE
    -- Get reply author
    SELECT user_id INTO content_author_id
    FROM discussion_replies
    WHERE id = NEW.reply_id;
    
    -- Get discussion details for the reply
    SELECT d.title, d.id INTO content_title, NEW.discussion_id
    FROM discussion_replies r
    JOIN discussions d ON r.discussion_id = d.id
    WHERE r.id = NEW.reply_id;
    
    notification_type := 'reply_like';
    notification_title := 'Someone liked your reply';
    notification_message := 'Your reply in "' || content_title || '" received a like';
    notification_url := '/community?discussion=' || NEW.discussion_id || '&reply=' || NEW.reply_id;
  END IF;
  
  -- Only notify if the liker is different from the content author
  IF content_author_id != NEW.user_id THEN
    -- Create notification
    PERFORM create_notification(
      content_author_id,
      notification_type,
      notification_title,
      notification_message,
      notification_url,
      jsonb_build_object(
        'discussion_id', NEW.discussion_id,
        'reply_id', NEW.reply_id,
        'liker_id', NEW.user_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for like notifications
CREATE TRIGGER on_content_like
  AFTER INSERT ON discussion_likes
  FOR EACH ROW EXECUTE FUNCTION notify_content_like();

-- Create function to notify users about new events
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  -- In a real implementation, this would query users based on preferences
  -- For now, we'll just create a placeholder
  
  -- Example of how you might notify specific users:
  -- INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
  -- SELECT 
  --   id, 
  --   'new_event',
  --   'New Event: ' || NEW.title,
  --   'A new event has been scheduled: ' || NEW.title,
  --   '/community?tab=events&event=' || NEW.id,
  --   jsonb_build_object('event_id', NEW.id, 'host_id', NEW.host_id)
  -- FROM profiles
  -- WHERE 
  --   -- Example criteria: users who have shown interest in this category
  --   id IN (SELECT user_id FROM user_interests WHERE category = NEW.category)
  --   -- Don't notify the host
  --   AND id != NEW.host_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new event notifications
CREATE TRIGGER on_new_event
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION notify_new_event();

-- Create function to update discussion views
CREATE OR REPLACE FUNCTION increment_discussion_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE discussions
  SET views = views + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for discussion views
CREATE TRIGGER on_discussion_view
  AFTER SELECT ON discussions
  FOR EACH ROW EXECUTE FUNCTION increment_discussion_views();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user_id ON discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_discussion_id ON discussion_likes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_likes_reply_id ON discussion_likes(reply_id);
CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);