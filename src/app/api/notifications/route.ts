import { NextResponse } from 'next/server';
import { notificationsDb } from '@/lib/dummy-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ message: "Username required" }, { status: 400 });
  }

  // Fetch notifications for this user
  const userNotifications = notificationsDb.filter(n => n.recipient === username);

  return NextResponse.json(userNotifications, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { recipient, message, type, teamTitle } = body;

  const newNotification = {
    id: Date.now().toString(),
    recipient,
    message,
    type, // 'application', 'acceptance', 'rejection'
    teamTitle,
    time: "Just now",
    read: false
  };

  notificationsDb.unshift(newNotification);

  return NextResponse.json(newNotification, { status: 201 });
}
