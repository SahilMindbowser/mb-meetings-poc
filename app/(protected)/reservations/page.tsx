"use client";

import { useState } from "react";
import { format, isBefore } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TimeSlotDialog from "@/components/dialogs/time-slot-dialog";

// Mock current user ID - in real app would come from auth
const CURRENT_USER_ID = "user1";

// Mock data - in real app would come from API/database
const mockReservations = [
  {
    id: 1,
    title: "Team Standup",
    start: new Date(new Date().setHours(10, 0)),
    end: new Date(new Date().setHours(10, 30)),
    room: "Room 3",
    userId: CURRENT_USER_ID,
  },
  {
    id: 2,
    title: "Project Review",
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1)),
    room: "Room 2",
    userId: CURRENT_USER_ID,
  },
  {
    id: 3,
    title: "Client Meeting",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    room: "Room 1",
    userId: CURRENT_USER_ID,
  },
];

const Reservations = () => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = (start: Date, end: Date) => {
    const now = new Date();
    if (isBefore(end, now)) {
      return <Badge variant="secondary">Past</Badge>;
    }
    if (isBefore(start, now) && !isBefore(end, now)) {
      return <Badge variant="default">In Progress</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">My Reservations</h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReservations.map((reservation) => (
              <TableRow
                key={reservation.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleEventClick(reservation)}
              >
                <TableCell className="font-medium">
                  {reservation.title}
                </TableCell>
                <TableCell>{format(reservation.start, "PPP")}</TableCell>
                <TableCell>
                  {format(reservation.start, "p")} -{" "}
                  {format(reservation.end, "p")}
                </TableCell>
                <TableCell>{reservation.room}</TableCell>
                <TableCell>
                  {getStatusBadge(reservation.start, reservation.end)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedEvent && (
        <TimeSlotDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          startTime={selectedEvent.start}
          endTime={selectedEvent.end}
          roomName={selectedEvent.room}
          initialTitle={selectedEvent.title}
          isPreview={true}
        />
      )}
    </div>
  );
};

export default Reservations;
