-- Remove all demo contractor businesses
DELETE FROM contractor_businesses;

-- Remove all demo profiles
DELETE FROM profiles;

-- Remove all demo reviews
DELETE FROM reviews;

-- Remove all demo contractor projects
DELETE FROM contractor_projects;

-- Remove all demo contractor services
DELETE FROM contractor_services;

-- Remove all demo saved contractors
DELETE FROM saved_contractors;

-- Remove all demo rate limit logs
DELETE FROM review_rate_limits;

-- Reset the search vectors and stats
UPDATE contractor_businesses SET search_vector = NULL WHERE search_vector IS NOT NULL;