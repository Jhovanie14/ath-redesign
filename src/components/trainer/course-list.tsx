import { CATEGORY_LABELS, type Trainer } from "@/lib/types";
import { formatGBP } from "@/lib/utils";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "./enquiry-dialog";

export function CourseList({ trainer }: { trainer: Trainer }) {
  return (
    <section id="courses" className="scroll-mt-24">
      <SectionEyebrow>Courses</SectionEyebrow>
      <h2 className="mt-4 font-display text-display-md text-ink">
        Courses &amp; pricing
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        {trainer.courses.map((course) => (
          <div
            key={course.id}
            className="rounded-card border border-linen bg-paper p-6"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {CATEGORY_LABELS[course.category]}
                  </Badge>
                  {course.cpdAccredited && (
                    <Badge variant="success">CPD accredited</Badge>
                  )}
                </div>
                <h3 className="mt-3 font-display text-title text-ink">
                  {course.title}
                </h3>
                <p className="mt-2 max-w-prose text-small leading-relaxed text-ink-soft">
                  {course.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-data text-micro text-stone">
                  <span>
                    {course.durationDays} day
                    {course.durationDays > 1 ? "s" : ""}
                  </span>
                  <span aria-hidden>·</span>
                  <span>Max {course.maxDelegates} delegates</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end sm:border-l sm:border-linen sm:pl-6">
                <span className="font-data text-title font-medium text-ink">
                  {formatGBP(course.priceGBP)}
                </span>
                <EnquiryDialog trainer={trainer} defaultCourseTitle={course.title}>
                  <Button variant="outline" size="sm">
                    Enquire about this course
                  </Button>
                </EnquiryDialog>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
