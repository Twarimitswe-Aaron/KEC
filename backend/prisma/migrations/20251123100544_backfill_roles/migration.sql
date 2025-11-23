-- Backfill missing Admin records
INSERT INTO "Admin" ("userId", "title", "isVisibleOnTeam")
SELECT "id", 'Administrator', true
FROM "User"
WHERE "role" = 'admin' AND "id" NOT IN (SELECT "userId" FROM "Admin");

-- Backfill missing Teacher records
INSERT INTO "Teacher" ("userId", "title", "isVisibleOnTeam")
SELECT "id", 'Instructor', false
FROM "User"
WHERE "role" = 'teacher' AND "id" NOT IN (SELECT "userId" FROM "Teacher");

-- Backfill missing Student records
INSERT INTO "Student" ("userId")
SELECT "id"
FROM "User"
WHERE "role" = 'student' AND "id" NOT IN (SELECT "userId" FROM "Student");