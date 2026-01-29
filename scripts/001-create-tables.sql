-- Locations table (venues/buildings on campus)
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type TEXT DEFAULT 'building', -- building, field, stage, quad, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location categories (what's available at each location)
CREATE TABLE IF NOT EXISTS location_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- food_trucks, entertainment, student_org_fair, childrens_fair
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  category TEXT, -- animals, science, nature, arts, food, featured
  popularity INTEGER DEFAULT 0, -- track how many users add to schedule
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Amenities table (food vendors, bathrooms, water stations)
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- food, bathroom, water
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User schedules (for tracking popularity and personal schedules)
CREATE TABLE IF NOT EXISTS user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- anonymous session ID or auth user ID
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_location_features_location ON location_features(location_id);
CREATE INDEX IF NOT EXISTS idx_amenities_type ON amenities(type);
CREATE INDEX IF NOT EXISTS idx_user_schedules_user ON user_schedules(user_id);

-- Insert locations data
INSERT INTO locations (name, short_name, address, latitude, longitude, type) VALUES
  ('Hoagland Hall', 'Hoagland Hall', '480 Sprocket Bikeway, Davis, CA 95616', 38.5385, -121.7505, 'building'),
  ('Hutchison Field', 'Hutchison Field', 'Hutchison Hall, Davis, CA 95616', 38.5380, -121.7610, 'field'),
  ('Mondavi Center for the Performing Arts', 'Mondavi Center', '1 Shields Ave, Davis, CA 95616', 38.5365, -121.7630, 'venue'),
  ('MU Quad', 'Memorial Union', 'Centennial Walk, Davis, CA 95616', 38.5420, -121.7495, 'quad'),
  ('Silo', 'Silo', '420 Hutchison Dr, Davis, CA 95616', 38.5390, -121.7520, 'building'),
  ('Cole A Facility', 'Cole Facility', 'G6MV+8Q Davis, California', 38.5345, -121.7580, 'facility'),
  ('Russell Field', 'Russell Field', 'G6WW+6WC University of California-Davis, California', 38.5456, -121.7527, 'field'),
  ('California Hall', 'California Hall', '205 California Ave, Davis, CA 95616', 38.5410, -121.7480, 'building'),
  ('Hoagland Lawn', 'Hoagland Lawn', '480 Sprocket Bikeway, Davis, CA 95616', 38.5387, -121.7503, 'lawn'),
  ('East Quad', 'East Quad', '824 E Quad, Davis, CA 95616', 38.5400, -121.7460, 'quad'),
  ('Sciences Lab Patio', 'Science Laboratory', 'Hutchison Dr, Davis, CA 95616', 38.5375, -121.7540, 'patio'),
  ('Wellman Hall', 'Wellman', '197 W Quad, Davis, CA 95616', 38.5415, -121.7510, 'building'),
  ('Russell Stage', 'Russell Stage', 'G6WW+6WC University of California-Davis, California', 38.5456, -121.7527, 'stage')
ON CONFLICT DO NOTHING;

-- Insert location features
INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Hoagland Hall';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Hutchison Field';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Mondavi Center';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Memorial Union';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Silo';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Cole Facility';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'Russell Field';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'food_trucks', 'Food Trucks available' FROM locations WHERE short_name = 'California Hall';

-- CDF - Children's Discovery Fair
INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'childrens_fair', 'Children''s Discovery Fair - crafts, activities for kids' FROM locations WHERE short_name = 'Hoagland Lawn';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'childrens_fair', 'Children''s Discovery Fair activities' FROM locations WHERE name = 'Hoagland Hall';

-- ENT - Entertainment Stages
INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'entertainment', 'Entertainment Stage' FROM locations WHERE short_name = 'East Quad';

INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'entertainment', 'Picnic Day Pit Stop entertainment' FROM locations WHERE name = 'Russell Stage';

-- SOF - Student Organization Fair
INSERT INTO location_features (location_id, feature, description) 
SELECT id, 'student_org_fair', 'Student Organization Fair' FROM locations WHERE short_name = 'Memorial Union';

-- Insert some sample amenities
INSERT INTO amenities (name, type, latitude, longitude, notes) VALUES
  ('Restroom - MU', 'bathroom', 38.5420, -121.7495, 'Memorial Union restrooms'),
  ('Restroom - Silo', 'bathroom', 38.5390, -121.7520, 'Silo building restrooms'),
  ('Restroom - Wellman', 'bathroom', 38.5415, -121.7510, 'Wellman Hall restrooms'),
  ('Restroom - Sciences', 'bathroom', 38.5375, -121.7540, 'Science Lab building restrooms'),
  ('Water Station - Quad', 'water', 38.5420, -121.7490, 'Near Memorial Union'),
  ('Water Station - Hutchison', 'water', 38.5380, -121.7600, 'Near Hutchison Field'),
  ('Water Station - East Quad', 'water', 38.5400, -121.7460, 'East Quad area'),
  ('Water Station - Russell', 'water', 38.5456, -121.7530, 'Near Russell Field')
ON CONFLICT DO NOTHING;
