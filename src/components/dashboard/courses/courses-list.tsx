"use client";

import { useState } from "react";
import { CATEGORY_LABELS, type Course } from "@/lib/types";
import { formatGBP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { CourseFormDialog } from "./course-form-dialog";

export function CoursesList({ courses: initialCourses }: { courses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  function addCourse(course: Course) {
    setCourses((prev) => [...prev, course]);
  }

  function updateCourse(course: Course) {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
  }

  function toggleArchived(id: string) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-[#25241F]">
            Courses
          </h1>
          <p className="mt-1.5 text-body text-[#746F65]">
            What students see and book on your public listing.
          </p>
        </div>
        <CourseFormDialog onSave={addCourse}>
          <Button>Add course</Button>
        </CourseFormDialog>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          className="mt-8"
          title="No courses yet"
          description="Add your first course to start appearing in student searches."
        />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-2xl border border-[#DED8CD] bg-[#FFFEFC] p-6 shadow-[0_8px_28px_rgba(40,35,28,0.045)]"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">
                  {CATEGORY_LABELS[course.category]}
                </Badge>
                {course.cpdAccredited && (
                  <Badge variant="success">CPD accredited</Badge>
                )}
                {course.archived && <Badge variant="outline">Archived</Badge>}
              </div>
              <h3 className="mt-3 font-display text-title text-[#25241F]">
                {course.title}
              </h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#746F65]">
                {course.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-data text-[12px] text-[#A49C8E]">
                <span>
                  {course.durationDays} day
                  {course.durationDays > 1 ? "s" : ""}
                </span>
                <span aria-hidden>·</span>
                <span>Max {course.maxDelegates} delegates</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[#E7E1D8] pt-4">
                <span className="font-data text-title font-medium text-[#25241F]">
                  {formatGBP(course.priceGBP)}
                </span>
                <div className="flex gap-2">
                  <CourseFormDialog course={course} onSave={updateCourse}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </CourseFormDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArchived(course.id)}
                  >
                    {course.archived ? "Reactivate" : "Archive"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
