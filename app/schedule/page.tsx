"use client";

import { useState, useRef } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import {
  format,
  startOfWeek,
  parse,
  getDay,
  addHours,
  isAfter,
  isBefore,
} from "date-fns";
import {
  dateFnsLocalizer,
  Calendar as BigCalendar,
  Event,
  Views,
  SlotInfo,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { enUS } from "date-fns/locale/en-US";
import TimeSlotDialog from "@/components/dialogs/time-slot-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const roomResources = [
  { id: 1, title: "Room 1" },
  { id: 2, title: "Room 2" },
  { id: 3, title: "Room 3" },
  { id: 4, title: "Room 4" },
  { id: 5, title: "Room 5" },
  { id: 6, title: "Room 6" },
];

// Mock current user ID - in real app would come from auth
const CURRENT_USER_ID = "user1";

// Extended event type with our custom properties
type CustomEvent = Event & {
  userId?: string;
  description?: string;
};

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CustomEvent[]>([
    {
      title: "Meeting with John",
      start: new Date(new Date().setHours(17, 0)),
      end: new Date(new Date().setHours(18, 30)),
      resource: 1,
      userId: CURRENT_USER_ID,
    },
    {
      title: "Project Review",
      start: new Date(new Date().setHours(14, 0)),
      end: new Date(new Date().setHours(15, 30)),
      resource: 2,
      userId: "user2",
    },
    {
      title: "Team Standup",
      start: new Date(new Date().setHours(10, 0)),
      end: new Date(new Date().setHours(11, 30)),
      resource: 3,
      userId: CURRENT_USER_ID,
    },
  ]);
  const [view, setView] = useState<(typeof Views)[keyof typeof Views]>(
    Views.DAY
  );

  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSlotSelect = (slotInfo: SlotInfo) => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setSelectedTime(slotInfo.start);
    setSelectedResource(
      typeof slotInfo.resourceId === "number" ? slotInfo.resourceId : null
    );
    setIsDialogOpen(true);
  };

  const handleEventSelect = (event: CustomEvent) => {
    const isMyEvent = event.userId === CURRENT_USER_ID;
    const isUpcoming = isAfter(event.start as Date, new Date());

    setSelectedEvent(event);
    setSelectedTime(event.start as Date);
    setSelectedResource(event.resource as number);
    setIsEditMode(isMyEvent && isUpcoming);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTime(null);
    setSelectedResource(null);
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  const handleAddEvent = (title: string, description?: string) => {
    if (selectedTime && selectedResource) {
      if (selectedEvent && isEditMode) {
        // Update existing event
        const updatedEvents = events.map((event) =>
          event === selectedEvent
            ? {
                ...event,
                title,
                description,
                start: selectedTime,
                end: addHours(selectedTime, 1),
              }
            : event
        );
        setEvents(updatedEvents);
      } else {
        // Add new event
        const newEvent = {
          title,
          description,
          start: selectedTime,
          end: addHours(selectedTime, 1),
          resource: selectedResource,
          userId: CURRENT_USER_ID,
        };
        setEvents([...events, newEvent]);
      }
      handleDialogClose();
    }
  };

  const handleAddBooking = () => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setSelectedTime(new Date());
    setSelectedResource(null); // Changed to null initially to require room selection
    setIsDialogOpen(true);
  };

  // Filter upcoming bookings (only my events with start time in the future)
  const upcomingBookings = events
    .filter(
      (event) =>
        isAfter(event.start as Date, new Date()) &&
        event.userId === CURRENT_USER_ID
    )
    .sort((a, b) => (a.start as Date).getTime() - (b.start as Date).getTime());

  // Custom event styling based on ownership
  const eventPropGetter = (event: CustomEvent) => {
    const isMyEvent = event.userId === CURRENT_USER_ID;
    const isPast = isBefore(event.end as Date, new Date());
    return {
      style: {
        backgroundColor: isMyEvent
          ? isPast
            ? "#94a3b8"
            : "#0ea5e9"
          : "#6b7280",
        borderColor: isMyEvent ? (isPast ? "#64748b" : "#0284c7") : "#4b5563",
        cursor: "pointer",
      },
    };
  };

  return (
    <div className="flex flex-col md:flex-row h-screen p-4 space-y-4 md:space-y-0 md:space-x-6 bg-gray-100">
      {/* Left: Date Picker and Upcoming Bookings */}
      <div className="w-full md:w-max flex flex-col space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <Button
            size="sm"
            onClick={handleAddBooking}
            className="flex items-center gap-1 w-full mb-4"
          >
            <Plus className="h-4 w-4" /> Add Booking
          </Button>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Select a Date</h2>
          </div>
          <ShadCalendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date as Date)}
            className="w-max block mx-auto"
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex-1 overflow-auto">
          <h2 className="text-lg font-semibold mb-4">My Upcoming Bookings</h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map((booking, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEventSelect(booking)}
                >
                  <h3 className="font-medium">{booking.title}</h3>
                  <p className="text-sm text-gray-600">
                    {format(booking.start as Date, "PPP")} at{" "}
                    {format(booking.start as Date, "p")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {
                      roomResources.find((r) => r.id === booking.resource)
                        ?.title
                    }
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No upcoming bookings
            </p>
          )}
        </div>
      </div>

      {/* Right: Google Calendar-Style Scheduler */}
      <div className="flex-1 bg-white p-4 rounded-lg shadow-md" ref={dialogRef}>
        <h2 className="text-lg font-semibold mb-4 text-center md:text-left">
          Schedule
        </h2>
        <div className="overflow-x-auto">
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={selectedDate}
            onNavigate={(date) => setSelectedDate(date)}
            selectable
            onSelectSlot={handleSlotSelect}
            onSelectEvent={handleEventSelect}
            style={{ height: "calc(100vh - 120px)" }}
            resources={roomResources}
            resourceIdAccessor="id"
            resourceTitleAccessor="title"
            resourceAccessor="resource"
            views={[Views.DAY, Views.AGENDA]}
            eventPropGetter={eventPropGetter}
          />
        </div>
      </div>

      {(selectedTime || selectedEvent) && (
        <TimeSlotDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          startTime={selectedTime || new Date()}
          endTime={
            (selectedEvent?.end as Date) ||
            addHours(selectedTime || new Date(), 1)
          }
          roomName={
            selectedResource
              ? roomResources.find((r) => r.id === selectedResource)?.title
              : ""
          }
          onAddEvent={handleAddEvent}
          isEditMode={isEditMode}
          initialTitle={selectedEvent?.title ? String(selectedEvent.title) : ""}
          initialDescription={
            selectedEvent?.description ? String(selectedEvent.description) : ""
          }
          isPreview={
            selectedEvent
              ? selectedEvent.userId !== CURRENT_USER_ID ||
                (selectedEvent.userId === CURRENT_USER_ID &&
                  isBefore(selectedEvent.end as Date, new Date()))
              : false
          }
          existingEvents={events.filter(
            (event) => selectedResource === event.resource
          )}
          currentEventId={selectedEvent ? selectedEvent.resource : undefined}
          rooms={roomResources}
          selectedRoomId={selectedResource}
          onRoomChange={setSelectedResource}
        />
      )}
    </div>
  );
}
