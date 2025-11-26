-- Run this SQL to check if students are in onGoingStudents but not in Enrollment table
-- This will help identify the data mismatch

-- Check students in onGoingStudents relationship
SELECT 
    c.id as course_id,
    c.title as course_title,
    u.id as user_id,
    u."firstName" || ' ' || u."lastName" as student_name,
    u.email
FROM 
    "Course" c
JOIN 
    "_OnGoingCourses" og ON c.id = og."B"
JOIN 
    "Student" s ON og."A" = s.id
JOIN 
    "User" u ON s."userId" = u.id
WHERE 
    c."isConfirmed" = true
ORDER BY 
    c.id, u.id;

-- Check Enrollment table
SELECT 
    e.id,
    e."userId",
    e."courseId",
    e."paymentId",
    e."enrollmentDate",
    u."firstName" || ' ' || u."lastName" as student_name,
    c.title as course_title,
    p.status as payment_status
FROM 
    "Enrollment" e
JOIN 
    "User" u ON e."userId" = u.id
JOIN 
    "Course" c ON e."courseId" = c.id
LEFT JOIN 
    "Payment" p ON e."paymentId" = p.id
ORDER BY 
    e."courseId", e."userId";

-- Find students in onGoingCourses but NOT in Enrollment (these need to be synced)
SELECT 
    c.id as course_id,
    c.title as course_title,
    u.id as user_id,
    u."firstName" || ' ' || u."lastName" as student_name,
    u.email,
    'MISSING FROM ENROLLMENT TABLE' as status
FROM 
    "Course" c
JOIN 
    "_OnGoingCourses" og ON c.id = og."B"
JOIN 
    "Student" s ON og."A" = s.id
JOIN 
    "User" u ON s."userId" = u.id
LEFT JOIN 
    "Enrollment" e ON e."userId" = u.id AND e."courseId" = c.id
WHERE 
    c."isConfirmed" = true
    AND e.id IS NULL
ORDER BY 
    c.id, u.id;
