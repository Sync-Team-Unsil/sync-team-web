// src/app/api/teams/applicant-action/route.ts
import { NextResponse } from 'next/server';
import { teamsDb, notificationsDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  try {
    const { teamId, applicantId, action } = await request.json();

    if (!teamId || !applicantId || !action) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const team = teamsDb.find((t: any) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    const applicantIndex = team.applicants.findIndex((a: any) => a.id === applicantId);
    if (applicantIndex === -1) {
      return NextResponse.json({ message: "Applicant not found" }, { status: 404 });
    }

    const applicant = team.applicants[applicantIndex];

    if (action === 'accept') {
      // Remove from applicants
      team.applicants.splice(applicantIndex, 1);
      
      // Add to joined members
      team.joinedMembers.push({
        ...applicant,
        time: "Joined Just Now"
      });

      // Update membersCount string (e.g., "4/5" -> "5/5")
      const [current, max] = team.membersCount.split('/').map(Number);
      team.membersCount = `${current + 1}/${max}`;
      
      // Update avatars
      team.memberAvatars.push(applicant.avatar);

      // Notify applicant
      notificationsDb.unshift({
        id: `notif-${Date.now()}`,
        recipient: applicant.name,
        message: `Your application to ${team.title} has been accepted!`,
        type: 'acceptance',
        teamTitle: team.title,
        time: "Just now",
        read: false,
        senderAvatar: "https://github.com/shadcn.png"
      });

    } else if (action === 'reject') {
      // Just remove from applicants
      team.applicants.splice(applicantIndex, 1);

      // Notify applicant
      notificationsDb.unshift({
        id: `notif-${Date.now()}`,
        recipient: applicant.name,
        message: `Your application to ${team.title} was not accepted.`,
        type: 'rejection',
        teamTitle: team.title,
        time: "Just now",
        read: false,
        senderAvatar: "https://github.com/shadcn.png"
      });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: `Applicant ${action}ed successfully!` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
