
-- Activer Realtime sur les tables critiques du système de collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE accompaniment_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborations;
ALTER PUBLICATION supabase_realtime ADD TABLE app_notifications;
