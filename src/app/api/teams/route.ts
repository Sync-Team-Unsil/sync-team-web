// src/app/api/teams/route.ts
import { NextResponse } from 'next/server';
import { teamsDb } from '@/lib/dummy-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const available = searchParams.get('available') === 'true';

  if (username) {
    if (available) {
      const otherTeams = teamsDb.filter((t: any) => 
        !t.joinedMembers.some((m: any) => m.name === username) &&
        !t.applicants.some((a: any) => a.name === username)
      );
      return NextResponse.json(otherTeams, { status: 200 });
    }

    const userTeams = teamsDb.filter((t: any) => 
      t.joinedMembers.some((m: any) => m.name === username) ||
      t.applicants.some((a: any) => a.name === username)
    );
    return NextResponse.json(userTeams, { status: 200 });
  }

  return NextResponse.json(teamsDb, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  if (!body.title || !body.description) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }

  const newTeam = {
    id: Date.now(),
    title: body.title,
    description: body.description,
    membersCount: `1/${body.maxMembers || 5}`,
    memberAvatars: ["https://github.com/shadcn.png"], // User pembuat
    status: "ongoing",
    bgColor: "bg-purple-50/70",
    tagColor: "text-purple-500",
    tags: body.tags || [],
    ownerName: body.ownerName,
    applicants: [],
    joinedMembers: [
      { id: "owner", name: body.ownerName || "Owner", time: "Just Now", avatar: "https://github.com/shadcn.png" }
    ]
  };

  teamsDb.unshift(newTeam);
  
  return NextResponse.json({ message: "Tim berhasil dibuat!", team: newTeam }, { status: 201 });
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID tim tidak ditemukan" }, { status: 400 });
    }

    const teamIndex = teamsDb.findIndex((t: any) => t.id === Number(id));
    if (teamIndex === -1) {
      return NextResponse.json({ message: "Tim tidak ditemukan" }, { status: 404 });
    }

    teamsDb.splice(teamIndex, 1);
    return NextResponse.json({ message: "Tim berhasil dihapus" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus tim" }, { status: 500 });
  }
}
