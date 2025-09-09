-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "certificates" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_OnGoingCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_OnGoingCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CompletedCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CompletedCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_FailedCourses" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FailedCourses_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "public"."Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "public"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE INDEX "_OnGoingCourses_B_index" ON "public"."_OnGoingCourses"("B");

-- CreateIndex
CREATE INDEX "_CompletedCourses_B_index" ON "public"."_CompletedCourses"("B");

-- CreateIndex
CREATE INDEX "_FailedCourses_B_index" ON "public"."_FailedCourses"("B");

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnGoingCourses" ADD CONSTRAINT "_OnGoingCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_OnGoingCourses" ADD CONSTRAINT "_OnGoingCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompletedCourses" ADD CONSTRAINT "_CompletedCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CompletedCourses" ADD CONSTRAINT "_CompletedCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FailedCourses" ADD CONSTRAINT "_FailedCourses_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FailedCourses" ADD CONSTRAINT "_FailedCourses_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
