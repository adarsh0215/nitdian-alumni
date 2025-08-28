import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "./ui";
import type { Profile } from "../_lib/types";

export default function DetailsCard({ profile }: { profile: Profile }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Your details</CardTitle>
        <CardDescription>What other members see after approval.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <Info label="Full name" value={profile.full_name} />
        <Info label="Degree" value={profile.degree} />
        <Info label="Branch" value={profile.branch} />
        <Info label="Graduation year" value={profile.graduation_year} />
        <Info label="Company" value={profile.company} />
        <Info label="Role" value={profile.role} />
        <Info label="Location" value={profile.location} />
        <Info label="Phone" value={profile.phone} />
        <Info label="LinkedIn" value={profile.linkedin} link />
        <Info label="Short bio" value={profile.bio} />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button asChild variant="outline">
          <Link href="/onboarding">Update details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
