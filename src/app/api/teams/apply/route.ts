// src/app/api/teams/apply/route.ts
import { NextResponse } from 'next/server';
import { teamsDb, notificationsDb } from '@/lib/dummy-db';

export async function POST(request: Request) {
  try {
    const { teamId, user } = await request.json();

    if (!teamId || !user) {
      return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
    }

    const team = teamsDb.find((t: any) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // Check if already applied
    const alreadyApplied = team.applicants.some((a: any) => a.name === user.username);
    const alreadyJoined = team.joinedMembers.some((m: any) => m.name === user.username);

    if (alreadyApplied || alreadyJoined) {
      return NextResponse.json({ message: "You have already applied or joined this team" }, { status: 400 });
    }

    // Add to applicants
    team.applicants.push({
      id: `app-${Date.now()}`,
      name: user.username,
      time: "Just now",
      avatar: user.avatar || "https://github.com/shadcn.png"
    });

    // Create notification for team owner
    const owner = team.joinedMembers[0]?.name;
    if (owner) {
      notificationsDb.unshift({
        id: `notif-${Date.now()}`,
        recipient: owner,
        message: `${user.username} applied to join ${team.title}`,
        type: 'application',
        teamTitle: team.title,
        time: "Just now",
        read: false,
        senderAvatar: user.avatar || "https://github.com/shadcn.png"
      });
    }

    return NextResponse.json({ message: "Successfully applied to team!" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
