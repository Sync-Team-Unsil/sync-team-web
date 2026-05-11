// src/app/api/teams/leave/route.ts
import { NextResponse } from 'next/server';
import { teamsDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  try {
    const { teamId, username } = await request.json();

    if (!teamId || !username) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const team = teamsDb.find((t: any) => t.id === Number(teamId));
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if owner (assuming first joinedMember is owner for simplicity)
    if (team.joinedMembers[0]?.name === username) {
       return NextResponse.json({ message: "Owner cannot leave the team. Use Delete Team instead." }, { status: 400 });
    }

    // Remove from joinedMembers
    const memberIndex = team.joinedMembers.findIndex((m: any) => m.name === username);
    if (memberIndex === -1) {
       // Check if currently an applicant
       const applicantIndex = team.applicants.findIndex((a: any) => a.name === username);
       if (applicantIndex !== -1) {
          team.applicants.splice(applicantIndex, 1);
          return NextResponse.json({ message: "Cancelled application" }, { status: 200 });
       }
       return NextResponse.json({ message: "User not found in team" }, { status: 404 });
    }

    const removedMember = team.joinedMembers[memberIndex];
    team.joinedMembers.splice(memberIndex, 1);

    // Update membersCount
    const [current, max] = team.membersCount.split('/').map(Number);
    team.membersCount = `${current - 1}/${max}`;

    // Remove avatar
    const avatarIndex = team.memberAvatars.indexOf(removedMember.avatar);
    if (avatarIndex !== -1) {
      team.memberAvatars.splice(avatarIndex, 1);
    }

    return NextResponse.json({ message: "Successfully left the team" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
